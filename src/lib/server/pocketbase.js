import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW } from '$env/static/private';

/**
 * System auth collection for admins on PocketBase >= 0.23.
 * The legacy `pb.admins` service was soft-deprecated in JS SDK 0.22
 * (aliased to this collection) — always auth via this constant.
 */
export const SUPERUSERS_COLLECTION = '_superusers';

/**
 * Create a PocketBase client authenticated as superuser.
 * Requires PocketBase server >= 0.23 and JS SDK >= 0.22.
 */
export async function createSuperuserClient() {
	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	await pb.collection(SUPERUSERS_COLLECTION).authWithPassword(
		PRIVATE_POCKETBASE_EMAIL,
		PRIVATE_POCKETBASE_PSW
	);
	return pb;
}

/**
 * Run a callback with an authenticated superuser client.
 * The auth store is always cleared afterwards so tokens never leak
 * between requests on reused server instances.
 */
export async function withSuperuserClient(fn) {
	const pb = await createSuperuserClient();
	try {
		return await fn(pb);
	} finally {
		pb.authStore.clear();
	}
}

/**
 * Build a public file URL for a record file.
 * Uses the SDK helper so base-URL handling stays correct
 * (replaces manual `PUBLIC_POCKETBASE_URL + '/api/files/' + ...` concat).
 */
export function buildFileUrl(pb, record, filename) {
	return pb.files.getURL(record, filename);
}

/**
 * Extract a PocketBase record id from a stored file URL.
 * Expected shape: `{base}/api/files/{collectionId}/{recordId}/{filename}`.
 * Returns `null` when the URL doesn't match (e.g. external/Supabase URL).
 */
export function extractRecordIdFromFileUrl(url) {
	if (!url || typeof url !== 'string') return null;
	const match = url.match(/\/api\/files\/[^/]+\/([^/]+)\/[^/]+\s*$/);
	if (!match) return null;
	const id = match[1].trim();
	return /^[A-Za-z0-9_-]{1,64}$/.test(id) ? id : null;
}

/**
 * Best-effort delete of a file record. Never throws — callers (book/user
 * deletes, avatar resets) must not fail when the file is already gone.
 */
export async function deleteFileRecordBestEffort(pb, collection, recordId) {
	if (!recordId) return;
	try {
		await pb.collection(collection).delete(recordId);
	} catch {
		// File already deleted or otherwise unreachable — ignore.
	}
}
