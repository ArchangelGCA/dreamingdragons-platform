/**
 * Shared admin-dashboard helpers (client + server-safe pure parts).
 * Keeps the admin surface consistent, minimal-text and fast:
 * single date formatter, single form-action poster, pagination math.
 */

import { deserialize } from '$app/forms';

/** Format a DB timestamp for admin lists. Returns '—' for null/invalid. */
export function formatAdminDate(value) {
	if (value === null || value === undefined || value === '') return '—';
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return String(value);
	return d.toLocaleString();
}

/** POST a SvelteKit form action (`?/name`) with FormData. Returns deserialized result. */
export async function postAdminAction(action, formData) {
	const response = await fetch(`?/${action}`, {
		method: 'POST',
		body: formData
	});
	return deserialize(await response.text());
}

/** Clamp a 1-based page number into [1, totalPages]. */
export function clampPage(page, totalPages) {
	const p = Number.parseInt(String(page ?? '1'), 10);
	if (!Number.isFinite(p) || p < 1) return 1;
	if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
	return Math.min(p, totalPages);
}

/** Offset/limit math for Supabase `.range()`. */
export function pageRange(page, perPage) {
	const p = Math.max(1, Number.parseInt(String(page ?? '1'), 10) || 1);
	const size = Math.min(Math.max(Number.parseInt(String(perPage ?? '20'), 10) || 20, 1), 100);
	return { page: p, perPage: size, from: (p - 1) * size, to: (p - 1) * size + size - 1 };
}

/** Total pages for a count + page size (min 1). */
export function totalPagesFor(count, perPage) {
	const total = Math.max(0, Number(count) || 0);
	const size = Math.max(1, Number(perPage) || 20);
	return Math.max(1, Math.ceil(total / size));
}

/** Very small email check for the newsletter add form (server re-validates). */
export function isPlausibleEmail(value) {
	if (typeof value !== 'string') return false;
	const trimmed = value.trim();
	if (trimmed.length < 5 || trimmed.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}
