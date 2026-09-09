/**
 * Pockethost host migration — server-only helpers.
 *
 * Context: image URLs stored in Supabase tables still point at the old
 * PocketHost instance (`rosesintheflames.pockethost.io`). The instance was
 * renamed to `dreamingdragons-images.pockethost.io`, so every stored URL
 * containing the old substring must be rewritten. The transformation is a
 * pure substring replace (`rosesintheflames` -> `dreamingdragons-images`),
 * which makes it exactly reversible.
 *
 * Design notes (Vercel-safe):
 * - No long-running request. The client drives the migration one small batch
 *   at a time (`pockethost_batch`), so each server call stays well under the
 *   serverless timeout and the UI can render real-time progress.
 * - Batching is "drain from the front": each batch fetches up to `limit`
 *   rows still matching the needle, rewrites them, and returns. Updated rows
 *   no longer match, so the next batch automatically picks up the next set.
 *   No offset bookkeeping, no skipped rows.
 * - Reversibility is two-fold:
 *   1. The string replace is symmetric (forward swaps old->new, reverse
 *      swaps new->old), so a rollback works even with zero extra infra.
 *   2. Every rewritten value is also appended to the
 *      `pockethost_host_migration_backup` table (when it exists) so the
 *      exact pre-migration value can be audited / restored. Missing backup
 *      table never blocks the migration — it only downgrades the audit trail
 *      (reported as `backupAvailable: false`).
 *
 * This module is server-only: it expects a service-role Supabase client
 * (bypasses RLS) passed in by the caller. It never touches `$env` itself.
 */

export const OLD_SUBSTRING = 'rosesintheflames';
export const NEW_SUBSTRING = 'dreamingdragons-images';
export const OLD_HOST = 'rosesintheflames.pockethost.io';
export const NEW_HOST = 'dreamingdragons-images.pockethost.io';

export const BACKUP_TABLE = 'pockethost_host_migration_backup';

/**
 * Canonical list of (table, column) pairs that may hold PocketHost URLs.
 * Derived from code search (no .env read):
 * - HIGH: direct image URL columns written by upload flows.
 * - MEDIUM: rich-HTML columns (TinyMCE) where a pasted <img src="https://roses…">
 *   could be embedded.
 * - LOW: plain-text columns where a user could have pasted a raw URL.
 * The scanner treats missing tables/columns as "skipped", so this list is
 * safe to extend without breaking existing databases.
 */
export const MIGRATION_TARGETS = [
	{ table: 'profiles', column: 'avatar_url', idColumn: 'id', kind: 'image-url' },
	{ table: 'profiles', column: 'cover_url', idColumn: 'id', kind: 'image-url' },
	{ table: 'book', column: 'cover_url', idColumn: 'id', kind: 'image-url' },
	{ table: 'book', column: 'description', idColumn: 'id', kind: 'rich-html' },
	{ table: 'chapters', column: 'text', idColumn: 'id', kind: 'rich-html' },
	{ table: 'comments', column: 'content', idColumn: 'id', kind: 'plain-text' }
];

export const DIRECTIONS = ['forward', 'reverse'];

/** Needle/replacement pair for a given direction. */
export function needlesFor(direction) {
	if (direction === 'reverse') {
		return { needle: NEW_SUBSTRING, replacement: OLD_SUBSTRING };
	}
	return { needle: OLD_SUBSTRING, replacement: NEW_SUBSTRING };
}

/** Pure string rewrite. Returns null when the value does not contain the needle. */
export function rewriteValue(value, direction) {
	if (typeof value !== 'string' || value === '') return null;
	const { needle, replacement } = needlesFor(direction);
	if (!value.includes(needle)) return null;
	return value.split(needle).join(replacement);
}

/** Allowlist check — never let the client pick an arbitrary table/column. */
export function findTarget(table, column) {
	return MIGRATION_TARGETS.find((t) => t.table === table && t.column === column) ?? null;
}

/**
 * Parse a client-supplied skip list (comma-separated ids) into a safe array.
 * Only id-shaped values survive (`/^[A-Za-z0-9_-]{1,64}$/` — UUIDs and ints
 * both pass); anything else is dropped so it can never reach a query.
 * Pure — unit-tested.
 */
export function parseSkipIds(value, max = 1000) {
	if (value === null || value === undefined) return [];
	const parts = Array.isArray(value) ? value : String(value).split(',');
	const out = [];
	for (const part of parts) {
		const id = String(part).trim();
		if (/^[A-Za-z0-9_-]{1,64}$/.test(id) && !out.includes(id)) {
			out.push(id);
			if (out.length >= max) break;
		}
	}
	return out;
}

/**
 * Heuristic: does this Supabase/Postgres error look like a row-level
 * permission rejection (trigger RAISE / RLS) rather than a connectivity or
 * schema problem? Service-role bypasses RLS but NOT triggers, so trigger
 * messages such as "You are not allowed to update your avatar icon" surface
 * here. Pure — unit-tested.
 */
export function isDbPolicyError(message) {
	if (!message || typeof message !== 'string') return false;
	return /not allowed|permission denied|row-level security|violates row-level|policy|trigger|forbidden|unauthorized/i.test(
		message
	);
}

function likePattern(needle) {
	return `%${needle}%`;
}

/**
 * Count rows in one target still matching the needle (dry-run / progress total).
 * Returns { table, column, count, skipped, skipReason } — never throws.
 */
export async function scanTarget(adminSupabase, target, direction) {
	const { table, column } = target;
	const { needle } = needlesFor(direction);
	try {
		const { count, error } = await adminSupabase
			.from(table)
			.select('id', { count: 'exact', head: true })
			.ilike(column, likePattern(needle));
		if (error) {
			return {
				table,
				column,
				kind: target.kind,
				count: 0,
				skipped: true,
				skipReason: error.message ?? 'scan failed'
			};
		}
		return { table, column, kind: target.kind, count: count ?? 0, skipped: false };
	} catch (err) {
		return {
			table,
			column,
			kind: target.kind,
			count: 0,
			skipped: true,
			skipReason: err?.message ?? 'scan failed'
		};
	}
}

/** Scan every canonical target for one direction. */
export async function scanAll(adminSupabase, direction) {
	const results = [];
	for (const target of MIGRATION_TARGETS) {
		results.push(await scanTarget(adminSupabase, target, direction));
	}
	const total = results.reduce((sum, r) => sum + (r.skipped ? 0 : r.count), 0);
	return { direction, targets: results, total };
}

/**
 * Process a single batch for one target: fetch up to `limit` rows still
 * matching the needle (minus `skipIds`), rewrite, update, and (best-effort)
 * back up.
 *
 * Per-row update strategy (fault-tolerant by design):
 * 1. Service-role client first (bypasses RLS — but NOT Postgres triggers).
 * 2. On failure, retry once with the calling admin's own JWT (`userSupabase`),
 *    because permission-enforcing triggers that read `auth.uid()` see NULL
 *    under service-role and reject — while the verified admin identity may
 *    satisfy them.
 * A row failing both attempts is recorded (id + message) in `failedIds` /
 * `errors` so the caller can exclude it and keep the run going. Never throws
 * for row-level failures; those are collected, not raised.
 */
export async function migrateBatch(
	adminSupabase,
	target,
	direction,
	limit = 50,
	skipIds = [],
	userSupabase = null
) {
	const { table, column, idColumn } = target;
	const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
	const skip = parseSkipIds(skipIds);

	let query = adminSupabase
		.from(table)
		.select(`${idColumn}, ${column}`)
		.ilike(column, likePattern(needlesFor(direction).needle))
		.order(idColumn, { ascending: true })
		.limit(safeLimit);
	if (skip.length > 0) {
		query = query.not(idColumn, 'in', `(${skip.join(',')})`);
	}
	const { data: rows, error: fetchError } = await query;

	if (fetchError) {
		return {
			table,
			column,
			direction,
			fetched: 0,
			updated: 0,
			failed: 0,
			done: true,
			backupAvailable: false,
			skipped: skip.length,
			errors: [fetchError.message ?? 'fetch failed'],
			failedIds: [],
			changes: []
		};
	}

	if (!rows || rows.length === 0) {
		return {
			table,
			column,
			direction,
			fetched: 0,
			updated: 0,
			failed: 0,
			done: true,
			backupAvailable: true,
			skipped: skip.length,
			errors: [],
			failedIds: [],
			changes: []
		};
	}

	const recordSuccess = (recordId, oldValue, newValue, backupRows, changes) => {
		backupRows.push({
			table_name: table,
			record_id: String(recordId),
			column_name: column,
			old_value: oldValue,
			new_value: newValue,
			direction
		});
		// Keep a tiny sample for the UI log (avoid shipping huge HTML blobs).
		if (changes.length < 3) {
			changes.push({
				id: recordId,
				before: String(oldValue).slice(0, 160),
				after: newValue.slice(0, 160)
			});
		}
	};

	let updated = 0;
	let failed = 0;
	const errors = [];
	const failedIds = [];
	const changes = [];
	const backupRows = [];

	for (const row of rows) {
		const recordId = row[idColumn];
		const oldValue = row[column];
		const newValue = rewriteValue(oldValue, direction);
		if (newValue === null) {
			continue;
		}
		const { error: updateError } = await adminSupabase
			.from(table)
			.update({ [column]: newValue })
			.eq(idColumn, recordId);
		if (!updateError) {
			updated += 1;
			recordSuccess(recordId, oldValue, newValue, backupRows, changes);
			continue;
		}
		// Fallback: retry as the verified admin user. Triggers enforcing
		// permissions via auth.uid() reject service-role (NULL uid) but may
		// accept the real admin identity.
		let finalMessage = updateError.message ?? 'update failed';
		let retried = false;
		if (userSupabase) {
			retried = true;
			const { error: retryError } = await userSupabase
				.from(table)
				.update({ [column]: newValue })
				.eq(idColumn, recordId);
			if (!retryError) {
				updated += 1;
				recordSuccess(recordId, oldValue, newValue, backupRows, changes);
				continue;
			}
			finalMessage = retryError.message ?? finalMessage;
		}
		failed += 1;
		failedIds.push(recordId);
		errors.push(
			`${table}.${column} id=${recordId}: ${finalMessage}${retried ? ' (also retried as admin user)' : ''}`
		);
	}

	// Best-effort audit backup — a missing backup table must not fail the migration.
	let backupAvailable = true;
	if (backupRows.length > 0) {
		const { error: backupError } = await adminSupabase.from(BACKUP_TABLE).insert(backupRows);
		if (backupError) {
			backupAvailable = false;
		}
	}

	// `done` is true when we fetched fewer rows than the limit: nothing left
	// matching the needle outside the skip list (a follow-up scan confirming
	// zero is cheap anyway).
	const done = rows.length < safeLimit;

	return {
		table,
		column,
		direction,
		fetched: rows.length,
		updated,
		failed,
		done,
		backupAvailable,
		skipped: skip.length,
		errors,
		failedIds,
		changes
	};
}
