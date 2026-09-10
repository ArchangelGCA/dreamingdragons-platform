/**
 * Theme registry + runtime switching.
 *
 * Themes are CSS-variable palettes selected via `data-theme` on <html>
 * (see `src/lib/css/style.css`: `:root` = deep defaults,
 * `html[data-theme="vault"]` = legacy overrides).
 *
 * To add a future theme: append `{ id, name }` here, add a matching
 * `html[data-theme="<id>"]` override block in style.css, and it appears in
 * Settings automatically. IDs are allowlisted everywhere they are read.
 */

export const THEME_COOKIE = 'dd-theme';
export const DEFAULT_THEME = 'deep';

export const THEMES = [
	{ id: 'deep', name: "Dragon's Deep" },
	{ id: 'vault', name: 'Royal Vault' }
];

export function isValidTheme(value) {
	return THEMES.some((theme) => theme.id === value);
}

function readCookie() {
	try {
		const match = document.cookie.match(/(?:^|; )dd-theme=([^;]*)/);
		return match ? decodeURIComponent(match[1]) : null;
	} catch {
		return null;
	}
}

function readStorage() {
	try {
		return localStorage.getItem(THEME_COOKIE);
	} catch {
		return null;
	}
}

/** Resolve the effective theme id (browser only; SSR uses the cookie in hooks). */
export function getStoredTheme() {
	const fromCookie = readCookie();
	if (isValidTheme(fromCookie)) return fromCookie;
	const fromStorage = readStorage();
	if (isValidTheme(fromStorage)) return fromStorage;
	return DEFAULT_THEME;
}

/**
 * Apply a theme immediately and persist it (cookie for SSR + localStorage
 * for guests). Unknown ids fall back to the default. Also syncs the
 * `theme-color` meta so the mobile browser chrome matches the ground.
 */
export function applyTheme(id, { persist = true } = {}) {
	const theme = isValidTheme(id) ? id : DEFAULT_THEME;
	try {
		document.documentElement.dataset.theme = theme;
	} catch {
		/* non-DOM context (SSR import) — nothing to paint */
	}
	if (persist) {
		try {
			localStorage.setItem(THEME_COOKIE, theme);
		} catch {
			/* private mode — cookie below is enough */
		}
		try {
			document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; Path=/; Max-Age=31536000; SameSite=Lax`;
		} catch {
			/* ignore */
		}
	}
	try {
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', theme === 'vault' ? '#0a0610' : '#000000');
	} catch {
		/* ignore */
	}
	return theme;
}

/** Apply the stored theme once (call from the root layout onMount). */
export function initTheme() {
	try {
		return applyTheme(getStoredTheme());
	} catch {
		return DEFAULT_THEME;
	}
}
