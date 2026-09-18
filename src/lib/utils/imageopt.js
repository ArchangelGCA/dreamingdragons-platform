/**
 * Client-side image optimization via wsrv.nl (images.weserv.nl) — DreamingDragons.
 *
 * Rationale (see IMAGE-OPTIMIZATION.md): originals are WebP in PocketBase and
 * were previously served at full resolution everywhere. Only hero images
 * (content/profile headers) need that; every other surface (cards, avatars,
 * gallery previews, admin lists) gets a width-capped variant from wsrv.nl,
 * a free open-source resize CDN cached by Cloudflare (300+ PoPs, 1-year
 * Cache-Control, verified 2026-09-18: 496 KB original → 13 KB @300w).
 *
 * Cache-friendly variant budget — deliberately FEW widths, so desktop and
 * mobile users share the same cached objects:
 *  - AVATAR  96px   (navbar 25–50px, comments 48px, followers 25px, profile icon 150px @1x)
 *  - CARD   640px   (masonry/content/search/chapter/admin covers @1x, avatars @2x)
 *  - CARD2X 1280px  (cards @2x mobile/desktop, masonry spans, admin details)
 *  - HEADER 1600px  (profile header background — largest non-hero surface)
 * Hero images (ContentImage on /content, 82vh) stay original on purpose.
 *
 * Fallback safety: every variant URL carries &default=1, so when the origin
 * is unreachable or the image 404s, wsrv.nl 302-redirects to the ORIGINAL
 * URL (verified live) — the image still renders even if the service dies,
 * which is the same failure mode that killed the 0.7.0 proxy. On top of
 * that, components may wire `onerror` to the original URL.
 *
 * Security: only http(s) absolute URLs and site-relative paths are proxied;
 * everything else (javascript:, data:, blob:) is rejected upstream by
 * `resolveImageUrl` and never reaches this module.
 */

import { resolveImageUrl } from './images.js';

/** wsrv.nl endpoint (Cloudflare-cached, no signup, self-hostable escape hatch). */
const WSRV_BASE = 'https://wsrv.nl/';

/** Default quality: uploads are already q=80 WebP; re-encode at 72 is visually lossless for downscales. */
const DEFAULT_QUALITY = 72;

/**
 * Named width presets — the only variants that exist. Adding a new one means
 * a new edge-cache population; prefer reusing these.
 */
export const IMAGE_WIDTHS = {
	AVATAR: 96,
	CARD: 640,
	CARD_2X: 1280,
	HEADER: 1600
};

/**
 * Resolve + rewrite an image URL through wsrv.nl at the given target width.
 *
 * - `null`/empty src → `fallback` (same contract as `resolveImageUrl`).
 * - Relative URLs (site assets like /favicon.webp) are returned untouched —
 *   they are already optimized and same-origin.
 * - Absolute http(s) URLs get `w=<width>&we&q=72&output=webp&default=1`.
 *   `we` never upscales; `default=1` redirects to the original on failure.
 * - Supabase signed URLs (?token=...) are fully encoded into `url=`, which
 *   wsrv.nl accepts (verified live).
 *
 * @param {string | null | undefined} src - stored URL (PocketBase/Supabase absolute or /relative)
 * @param {number} width - target width in CSS pixels (use IMAGE_WIDTHS presets)
 * @param {object} [opts]
 * @param {string} [opts.fallback] - fallback when src is empty/unsafe (defaults to favicon)
 * @param {boolean} [opts.original] - when true, skip the proxy entirely (hero images)
 * @param {number} [opts.quality] - wsrv.nl q= (1-100), default 72
 * @returns {string} the URL to put in an <img src> / CSS url()
 */
export function optimizeImageUrl(src, width, opts = {}) {
	const { fallback = '/favicon-96x96.png', original = false, quality = DEFAULT_QUALITY } = opts;

	const resolved = resolveImageUrl(src, undefined, fallback);
	if (!resolved || resolved === fallback) return fallback;
	// Site-relative assets are already same-origin and optimized: don't proxy.
	if (resolved.startsWith('/')) return resolved;
	// Hero surfaces opt out (main /content cover, etc.).
	if (original || !width || width <= 0) return resolved;

	try {
		// resolveImageUrl guarantees http(s) here; parse for canonical encoding.
		const parsed = new URL(resolved);
		// URLSearchParams handles percent-encoding of ?& in the origin URL.
		const params = new URLSearchParams();
		params.set('url', parsed.toString());
		params.set('w', String(width));
		params.set('q', String(quality));
		params.set('output', 'webp');
		params.set('we', '');
		params.set('default', '1');
		return `${WSRV_BASE}?${params.toString()}`;
	} catch {
		return resolved;
	}
}

/**
 * Build a small, cache-friendly `srcset` for an image.
 * Widths are deduplicated, sorted ascending and expressed in `w` units.
 * Pair it with a `sizes` attribute in the component.
 *
 * @param {string | null | undefined} src
 * @param {number[]} widths - e.g. [IMAGE_WIDTHS.CARD, IMAGE_WIDTHS.CARD_2X]
 * @param {object} [opts] - same options as `optimizeImageUrl`
 * @returns {string | undefined} srcset string, or undefined when there is
 *   nothing to srcset (empty/relative/unsafe src) so callers can spread it.
 */
export function imageSrcSet(src, widths, opts = {}) {
	const resolved = resolveImageUrl(src, undefined, opts.fallback ?? '/favicon-96x96.png');
	if (!resolved || resolved.startsWith('/') || !resolved.startsWith('http')) return undefined;
	const unique = [...new Set(widths.filter((w) => Number.isFinite(w) && w > 0))].sort((a, b) => a - b);
	if (unique.length === 0) return undefined;
	return unique
		.map((w) => `${optimizeImageUrl(resolved, w, opts)} ${w}w`)
		.join(', ');
}
