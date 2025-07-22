/**
 * SEO-friendly URL utilities for books and chapters
 * Supports both legacy numeric IDs and new title-id format
 */

/**
 * Creates a URL-safe slug from a title
 * @param {string} title - The title to slugify
 * @returns {string} - URL-safe slug
 */
export function createSlug(title) {
    if (!title || typeof title !== 'string') {
        return '';
    }
    
    return title
        .toLowerCase()
        .trim()
        // Replace spaces and special characters with hyphens
        .replace(/[\s\W_]+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-|-$/g, '')
        // Limit length to 50 characters for reasonable URLs
        .substring(0, 50)
        // Remove trailing hyphen if substring cut in middle of word
        .replace(/-$/, '');
}

/**
 * Creates SEO-friendly URL for book
 * @param {string} title - Book title
 * @param {number|string} id - Book ID
 * @returns {string} - SEO-friendly URL segment (title-id)
 */
export function createBookUrl(title, id) {
    const slug = createSlug(title);
    return slug ? `${slug}-${id}` : `${id}`;
}

/**
 * Creates SEO-friendly URL for chapter
 * @param {string} title - Chapter title
 * @param {number|string} id - Chapter ID
 * @returns {string} - SEO-friendly URL segment (title-id)
 */
export function createChapterUrl(title, id) {
    const slug = createSlug(title);
    return slug ? `${slug}-${id}` : `${id}`;
}

/**
 * Extracts ID from either legacy numeric ID or new title-id format
 * @param {string} param - URL parameter (either "123" or "title-123")
 * @returns {string|null} - Extracted ID or null if invalid
 */
export function extractId(param) {
    if (!param || typeof param !== 'string') {
        return null;
    }

    // Check if it's just a numeric ID (legacy format)
    if (/^\d+$/.test(param)) {
        return param;
    }

    // Check if it's title-id format by looking for the last hyphen followed by digits
    const parts = param.split('-');
    if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        // Only consider it an ID if the last part is purely numeric
        if (/^\d+$/.test(lastPart)) {
            return lastPart;
        }
    }

    return null;
}

/**
 * Validates that a URL parameter is either a valid ID or title-id format
 * @param {string} param - URL parameter to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidUrlParam(param) {
    if (!param || typeof param !== 'string') {
        return false;
    }

    // Allow numeric IDs (legacy)
    if (/^\d+$/.test(param)) {
        return true;
    }

    // Allow title-id format (new SEO-friendly)
    // Must end with hyphen followed by digits, and have at least one character before
    if (/^.+-\d+$/.test(param)) {
        return true;
    }

    return false;
}

/**
 * Creates full book URL path
 * @param {string} title - Book title
 * @param {number|string} id - Book ID
 * @returns {string} - Full URL path
 */
export function createBookPath(title, id) {
    return `/content/${createBookUrl(title, id)}`;
}

/**
 * Creates full chapter URL path
 * @param {string} bookTitle - Book title
 * @param {number|string} bookId - Book ID
 * @param {string} chapterTitle - Chapter title
 * @param {number|string} chapterId - Chapter ID
 * @returns {string} - Full URL path
 */
export function createChapterPath(bookTitle, bookId, chapterTitle, chapterId) {
    return `/content/${createBookUrl(bookTitle, bookId)}/${createChapterUrl(chapterTitle, chapterId)}`;
}

/**
 * Generate canonical URL for redirects
 * @param {Object} book - Book object with title and id
 * @param {Object} chapter - Optional chapter object with title and id
 * @returns {string} - Canonical URL
 */
export function getCanonicalUrl(book, chapter = null) {
    if (chapter) {
        return createChapterPath(book.title, book.id, chapter.title, chapter.id);
    }
    return createBookPath(book.title, book.id);
}
