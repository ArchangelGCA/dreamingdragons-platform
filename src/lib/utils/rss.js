import { createBookPath, createChapterPath } from './slugs.js';
import {ORIGIN} from "$env/static/private";
import { resolveImageUrl } from './images.js';


const SITE_URL = ORIGIN || 'https://tales.archangelgca.eu';
const SITE_TITLE = 'DreamingDragons';
const SITE_DESCRIPTION = 'A platform for sharing and discovering creative art, stories and literature';

/**
 *
 * @param title
 * @param description
 * @param link
 * @param selfLink
 * @returns {string}
 */
export function generateRSSHeader(title, description, link, selfLink) {
    const buildDate = new Date().toUTCString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${link}</link>
    <atom:link href="${selfLink}" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <generator>DreamingDragons Platform</generator>
    <managingEditor>contact@archangelgca.eu (DreamingDragons)</managingEditor>
    <webMaster>contact@archangelgca.eu (DreamingDragons)</webMaster>
    <ttl>60</ttl>`;
}

/**
 *
 * @returns {string}
 */
export function generateRSSFooter() {
    return `</channel>
</rss>`;
}

/**
 *
 * @param text
 * @returns {*|string}
 */
export function escapeHTML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 *
 * @param book
 * @returns {string}
 */
export function generateBookRSSItem(book) {
    const title = escapeHTML(book.title);
    const author = book.profiles?.username || 'Unknown Author';
    const description = `New book "${title}" by ${escapeHTML(author)}`;
    const link = `${SITE_URL}${createBookPath(book.title, book.id)}`;
    const pubDate = new Date(book.created_at).toUTCString();
    const guid = `${SITE_URL}${createBookPath(book.title, book.id)}`;
    const coverURL = book.cover_url ? escapeHTML(resolveImageUrl(book.cover_url)) : '';

    let finalDescription = description;
    if (coverURL) {
        finalDescription = `<img src="${coverURL}" alt="${title}" /><br /><br />${description}`;
    }

    return `    <item>
        <title><![CDATA[${title} by ${author}]]></title>
        <description><![CDATA[${finalDescription}]]></description>
        <link>${link}</link>
        <guid isPermaLink="true">${guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeHTML(author)}</author>
        <category>Books, Artworks</category>
    </item>`;
}

/**
 *
 * @param chapter
 * @returns {string}
 */
export function generateChapterRSSItem(chapter) {
    const title = escapeHTML(chapter.title);
    const bookTitle = escapeHTML(chapter.book?.title || 'Unknown Book');
    const author = chapter.profiles?.username || 'Unknown Author';
    const description = `New chapter "${title}" in "${bookTitle}" by ${escapeHTML(author)}`;
    const link = `${SITE_URL}${createChapterPath(bookTitle, chapter.book_id, chapter.title, chapter.id)}`;
    const pubDate = new Date(chapter.created_at).toUTCString();
    const guid = `${SITE_URL}${createChapterPath(bookTitle, chapter.book_id, chapter.title, chapter.id)}`;
    const bookCoverURL = chapter.book?.cover_url ? escapeHTML(resolveImageUrl(chapter.book.cover_url)) : '';

    let finalDescription = description;
    if (bookCoverURL) {
        finalDescription = `<img src="${bookCoverURL}" alt="${title}" /><br /><br />${description}`;
    }

    return `    <item>
        <title><![CDATA[${bookTitle}: ${title}]]></title>
        <description><![CDATA[${finalDescription}]]></description>
        <link>${link}</link>
        <guid isPermaLink="true">${guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeHTML(author)}</author>
        <category>Chapters</category>
    </item>`;
}

/**
 *
 * @param activity
 * @param username
 * @returns {string}
 */
export function generateUserActivityRSSItem(activity, username) {
    const book = activity.book;
    const title = escapeHTML(book.title);
    const bookAuthor = book.profiles?.username || 'Unknown Author';
    const description = `${escapeHTML(username)} liked "${title}" by ${escapeHTML(bookAuthor)}`;
    const link = `${SITE_URL}${createBookPath(book.title, book.id)}`;
    const pubDate = new Date(activity.created_at).toUTCString();
    const guid = `${SITE_URL}/activity/like/${activity.created_at}/${book.id}`;

    return `    <item>
        <title><![CDATA[${username} liked: ${title}]]></title>
        <description><![CDATA[${description}]]></description>
        <link>${link}</link>
        <guid isPermaLink="false">${guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeHTML(username)}</author>
        <category>User Activity</category>
    </item>`;
}

/**
 *
 * @param book
 * @param username
 * @returns {string}
 */
export function generateUserBookRSSItem(book, username) {
    const title = escapeHTML(book.title);
    const description = `${escapeHTML(username)} published a new book: "${title}"`;
    const link = `${SITE_URL}${createBookPath(book.title, book.id)}`;
    const pubDate = new Date(book.created_at).toUTCString();
    const guid = `${SITE_URL}${createBookPath(book.title, book.id)}`;

    return `    <item>
        <title><![CDATA[${username} published: ${title}]]></title>
        <description><![CDATA[${description}]]></description>
        <link>${link}</link>
        <guid isPermaLink="true">${guid}</guid>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeHTML(username)}</author>
        <category>Published</category>
    </item>`;
}

/**
 *
 * @param title
 * @param description
 * @param link
 * @param selfLink
 * @param items
 * @returns {string}
 */
export function generateRSSFeed(title, description, link, selfLink, items) {
    const header = generateRSSHeader(title, description, link, selfLink);
    const footer = generateRSSFooter();
    const itemsXML = items.join('\n');

    return `${header}
${itemsXML}
${footer}`;
}

/**
 *
 * @type {{CONTENT: {title: string, description: string}, BOOKS: {title: string, description: string}, CHAPTERS: {title: string, description: string}, USER_ACTIVITY: (function(*): {title: string, description: string}), USER_PUBLISHED: (function(*): {title: string, description: string})}}
 */
export const FEEDS = {
    CONTENT: {
        title: `${SITE_TITLE} - Latest Content`,
        description: 'Latest artworks, books and chapters from DreamingDragons platform'
    },
    BOOKS: {
        title: `${SITE_TITLE} - New Artworks and Books`,
        description: 'Recently published artworks and books on DreamingDragons platform'
    },
    CHAPTERS: {
        title: `${SITE_TITLE} - New Chapters`,
        description: 'Recently published chapters on DreamingDragons platform'
    },
    USER_ACTIVITY: (username) => ({
        title: `${SITE_TITLE} - ${username}'s Activity`,
        description: `Activity feed for user ${username} on DreamingDragons platform`
    }),
    USER_PUBLISHED: (username) => ({
        title: `${SITE_TITLE} - ${username}'s Published Content`,
        description: `Published artworks, books and content by ${username} on DreamingDragons platform`
    })
};

export {SITE_URL, SITE_TITLE, SITE_DESCRIPTION};
