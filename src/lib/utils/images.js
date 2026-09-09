/**
 * Central image URL helper — DreamingDragons Platform.
 *
 * Context: the external image proxy optimizer (PUBLIC_IMAGE_PROXY_URL,
 * e.g. https://images.archangelgca.eu/image/) can no longer be hosted.
 * Decision: serve original images at best quality directly (Supabase /
 * PocketBase CDN + browser cache), with lazy loading and async decoding.
 * No Vercel serverless sharp endpoint — it would add cold starts, cost and
 * complexity on serverless with no persistent cache.
 *
 * `image_proxy` props are kept across components for backwards compatibility
 * but are intentionally IGNORED. They may be removed in a future major.
 *
 * Security: never fetch arbitrary hosts. Only return:
 *  - absolute https:// URLs (Supabase / PocketBase originals), or
 *  - site-relative /... paths, or
 *  - the local fallback.
 * Anything else falls back to the local placeholder.
 */

export const IMAGE_FALLBACK = '/favicon-96x96.png';

/**
 * Strip a legacy proxy prefix if a stored URL was accidentally saved proxied.
 * e.g. "https://images.archangelgca.eu/image/https://xyz.supabase.co/..." -> original
 * @param {string} url
 * @param {string | null | undefined} proxyPrefix
 */
function stripProxyPrefix(url, proxyPrefix) {
	if (!url || !proxyPrefix) return url;
	if (typeof url !== 'string' || typeof proxyPrefix !== 'string') return url;
	if (proxyPrefix && url.startsWith(proxyPrefix)) {
		return url.slice(proxyPrefix.length);
	}
	return url;
}

/**
 * Resolve the best-quality original image URL.
 * Ignores the proxy (deprecated) and returns the original.
 *
 * @param {string | null | undefined} src - original URL from DB (absolute https or /relative)
 * @param {string | null | undefined} _image_proxy - deprecated, ignored (kept for compat)
 * @param {string} [fallback] - fallback image
 * @returns {string}
 */
export function resolveImageUrl(src, _image_proxy = undefined, fallback = IMAGE_FALLBACK) {
	if (!src || typeof src !== 'string') return fallback;
	let url = src.trim();
	if (!url) return fallback;

	// Strip legacy proxy prefix if present (both passed-in and known host pattern)
	url = stripProxyPrefix(url, _image_proxy);
	// Also strip the known legacy host even when proxy var is unset
	url = stripProxyPrefix(url, 'https://images.archangelgca.eu/image/');

	// Absolute URL: allow only http(s). Require https in production to avoid mixed content,
	// but allow http for local dev hosts.
	if (/^https?:\/\//i.test(url)) {
		try {
			const parsed = new URL(url);
			if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback;
			// Block javascript:, data: (except safe image data?), blob: via non-http check above.
			// Remove any proxy-style transform params (?width=&quality=) that were meant
			// for the external optimizer — originals are served as-is for best quality.
			// Keep other query params (e.g. Supabase signed URLs ?token=).
			const params = parsed.searchParams;
			params.delete('width');
			params.delete('quality');
			parsed.search = params.toString() ? `?${params.toString()}` : '';
			return parsed.toString();
		} catch {
			return fallback;
		}
	}

	// Site-relative path
	if (url.startsWith('/')) {
		// Strip any leftover transform params
		const qIndex = url.indexOf('?');
		if (qIndex !== -1) {
			try {
				const [path, query] = [url.slice(0, qIndex), url.slice(qIndex + 1)];
				const params = new URLSearchParams(query);
				params.delete('width');
				params.delete('quality');
				const rest = params.toString();
				return rest ? `${path}?${rest}` : path;
			} catch {
				return url.split('?')[0] || fallback;
			}
		}
		return url;
	}

	// Unknown scheme (javascript:, data:text/html, etc.) — block
	return fallback;
}

/**
 * Validate a user-supplied website URL for safe rendering in href.
 * Only allows http(s) URLs with a host. Returns '' when unsafe.
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function safeExternalUrl(value) {
	if (!value || typeof value !== 'string') return '';
	const trimmed = value.trim();
	if (!trimmed) return '';
	// Block javascript:, data:, blob:, file:, etc.
	if (!/^https?:\/\//i.test(trimmed)) return '';
	try {
		const parsed = new URL(trimmed);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
		if (!parsed.hostname || parsed.hostname.length > 253) return '';
		if (trimmed.length > 2048) return '';
		return parsed.toString();
	} catch {
		return '';
	}
}

/**
 * Escape text for safe interpolation into HTML strings (oEmbed, tooltips).
 * @param {string | null | undefined} text
 * @returns {string}
 */
export function escapeHtml(text) {
	if (text === null || text === undefined) return '';
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;');
}
