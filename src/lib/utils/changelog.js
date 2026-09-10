/**
 * Keep a Changelog → website update helpers (`website_updates.content`).
 *
 * The repo's CHANGELOG.md follows keepachangelog.com: version blocks start
 * with `## [x.y.z] - YYYY-MM-DD`, sections with `### Added/Fixed/...`, items
 * are `- ` bullets (possibly nested, possibly wrapped over indented
 * continuation lines), inline markup is `**bold**`, `` `code` `` and
 * `[label](https://url)`. These helpers turn one pasted block into the
 * sanitized HTML stored for the public /updates page.
 *
 * Pure + dependency-light (escapeHtml/safeExternalUrl), so the same code
 * runs in the admin browser (live preview) and in server actions (guard).
 */

import { escapeHtml, safeExternalUrl } from '$lib/utils/images.js';

/** Max HTML length accepted for a single update (mirrors server-side cap). */
export const UPDATE_CONTENT_MAX_LENGTH = 20000;

/** Sections that are internal process notes and are excluded by default. */
export const DEFAULT_EXCLUDED_SECTIONS = ['Verified'];

/**
 * Inline markdown on a raw (unescaped) text fragment → HTML-escaped string
 * with <strong>/<code>/<a> applied. Backtick spans are protected first so
 * `**not bold** inside code` stays literal.
 * @param {string} text
 * @returns {string} HTML
 */
export function formatInline(text) {
	const segments = String(text ?? '').split('`');
	let out = '';
	for (let i = 0; i < segments.length; i++) {
		if (i % 2 === 1) {
			out += `<code>${escapeHtml(segments[i])}</code>`;
			continue;
		}
		let s = escapeHtml(segments[i]);
		s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))*)\)/g, (match, label, url) => {
			const safe = safeExternalUrl(url);
			return safe
				? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`
				: label;
		});
		out += s;
	}
	return out;
}

/**
 * Parse the bullet lines of one section into a tree of
 * `{ text, children }`, honoring indentation and merging non-bullet
 * "wrapped" lines into the current bullet.
 * @param {string[]} lines
 * @returns {{ items: Array<{text: string, children: Array}>, preamble: string }}
 */
function parseBullets(lines) {
	const root = { indent: -1, children: [] };
	const stack = [root];
	let currentLeaf = null;
	const preamble = [];

	for (const rawLine of lines) {
		const line = String(rawLine).replace(/\s+$/, '');
		if (!line.trim()) continue;
		const m = line.match(/^(\s*)[-*]\s+(.*)$/);
		if (m) {
			const indent = m[1].length;
			while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
			const item = { text: m[2].trim(), children: [] };
			stack[stack.length - 1].children.push(item);
			stack.push({ indent, children: item.children });
			currentLeaf = item;
		} else if (currentLeaf) {
			currentLeaf.text += ' ' + line.trim();
		} else {
			preamble.push(line.trim());
		}
	}

	return { items: root.children, preamble: preamble.join(' ').trim() };
}

/**
 * Render a bullet tree to `<ul>` HTML.
 * @param {Array<{text: string, children: Array}>} items
 * @returns {string}
 */
function renderItems(items) {
	if (!items || items.length === 0) return '';
	let html = '<ul>';
	for (const item of items) {
		html += `<li>${formatInline(item.text)}${renderItems(item.children)}</li>`;
	}
	return html + '</ul>';
}

/**
 * Parse one pasted CHANGELOG block (tolerates a whole-file paste: only the
 * first `## ` version heading onward is used, up to the next `## `).
 *
 * @param {string} raw
 * @returns {{
 *   version: string | null,
 *   date: string | null,
 *   preambleHtml: string,
 *   sections: Array<{ name: string, itemCount: number, html: string }>
 * }}
 */
export function parseChangelogBlock(raw) {
	const result = { version: null, date: null, preambleHtml: '', sections: [] };
	const text = String(raw ?? '').replace(/\r\n?/g, '\n').trim();
	if (!text) return result;

	const lines = text.split('\n');
	const headerIdx = lines.findIndex((l) => /^##\s+/.test(l));

	let bodyLines;
	if (headerIdx === -1) {
		// No version heading — parse the whole paste as section content.
		bodyLines = lines;
	} else {
		const header = lines[headerIdx].match(/^##\s+\[?([^\]\s]+)\]?\s*(?:-\s*(.+?))?\s*$/);
		if (header) {
			result.version = header[1] ?? null;
			const rawDate = String(header[2] ?? '').trim();
			result.date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
		}
		let endIdx = lines.length;
		for (let i = headerIdx + 1; i < lines.length; i++) {
			if (/^##\s+/.test(lines[i])) {
				endIdx = i;
				break;
			}
		}
		bodyLines = lines.slice(headerIdx + 1, endIdx);
	}

	// Split into `### Section` buckets; text before the first one is preamble.
	let current = null;
	const preLines = [];
	for (const line of bodyLines) {
		const h3 = line.match(/^###\s+(.+?)\s*$/);
		if (h3) {
			current = { name: h3[1].trim(), lines: [] };
			result.sections.push(current);
		} else if (current) {
			current.lines.push(line);
		} else {
			preLines.push(line);
		}
	}

	result.sections = result.sections.map((section) => {
		const { items, preamble: sectionPreamble } = parseBullets(section.lines);
		const parts = [];
		if (sectionPreamble) parts.push(`<p>${formatInline(sectionPreamble)}</p>`);
		parts.push(renderItems(items));
		return {
			name: section.name,
			itemCount: items.length,
			html: parts.filter(Boolean).join('\n')
		};
	});

	// Bullets before any `###` heading (e.g. legacy blocks like 0.6.3) become
	// an unnamed section rendered without a heading; plain text is preamble.
	const top = parseBullets(preLines);
	if (top.preamble) result.preambleHtml = `<p>${formatInline(top.preamble)}</p>`;
	if (top.items.length > 0) {
		result.sections.unshift({
			name: '',
			itemCount: top.items.length,
			html: renderItems(top.items)
		});
	}

	return result;
}

/**
 * Compose the final HTML to store/preview from a parsed block.
 * @param {ReturnType<typeof parseChangelogBlock>} parsed
 * @param {{ excludedSections?: Iterable<string>, includeVersion?: boolean }} [options]
 * @returns {string}
 */
export function buildUpdateHtml(parsed, { excludedSections = [], includeVersion = true } = {}) {
	if (!parsed) return '';
	const excluded = new Set(excludedSections);
	const parts = [];
	if (includeVersion && parsed.version) {
		parts.push(`<h4 class="update-version">v${escapeHtml(parsed.version)}</h4>`);
	}
	if (parsed.preambleHtml) parts.push(parsed.preambleHtml);
	for (const section of parsed.sections) {
		if (excluded.has(section.name) || !section.html) continue;
		if (section.name) parts.push(`<h5 class="update-section">${escapeHtml(section.name)}</h5>`);
		parts.push(section.html);
	}
	return parts.join('\n');
}

/**
 * Strip HTML tags for compact previews (history list snippets).
 * @param {string} html
 * @param {number} [max]
 * @returns {string}
 */
export function htmlToPlainText(html, max = 160) {
	const text = String(html ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= max) return text;
	return text.slice(0, max).trimEnd() + '…';
}

/**
 * Best-effort scrub of admin-authored update HTML before it is rendered with
 * `{@html}` on the public /updates page. The generated changelog HTML is
 * already escaped; this only guards the admin's hand-written HTML against
 * obvious active-content vectors (not a general-purpose sanitizer).
 * @param {string} html
 * @returns {string}
 */
export function sanitizeUpdateHtml(html) {
	return String(html ?? '')
		.replace(/<\/?(script|iframe|object|embed|form|input|button|link|meta)\b[^>]*>/gi, '')
		.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'>\s]*\2/gi, '$1="#"');
}
