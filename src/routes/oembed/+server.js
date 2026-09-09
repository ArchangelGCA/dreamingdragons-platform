import {error, json} from '@sveltejs/kit';
import {ORIGIN} from '$env/static/private';
import { createProfilePath } from '$lib/utils/slugs.js';
import { resolveImageUrl, escapeHtml } from '$lib/utils/images.js';

export async function GET({url, locals: {supabase, image_proxy}}) {
    const requestUrl = url.searchParams.get('url');
    const format = url.searchParams.get('format') || 'json';
    const maxwidth = Math.min(Math.max(parseInt(url.searchParams.get('maxwidth') || '600', 10) || 600, 200), 800);
    const maxheight = Math.min(Math.max(parseInt(url.searchParams.get('maxheight') || '250', 10) || 250, 200), 800);

    if (!requestUrl) {
        throw error(400, 'Missing url parameter');
    }

    if (format !== 'json') {
        throw error(501, 'Only JSON format is supported');
    }

    // Parse the URL to determine if it's a content page or chapter page.
    // Only allow same-origin embeds to avoid reflecting attacker URLs.
    let urlObj;
    try {
        urlObj = new URL(requestUrl);
    } catch {
        throw error(400, 'Invalid url parameter');
    }
    try {
        const siteOrigin = new URL(ORIGIN).origin;
        if (urlObj.origin !== siteOrigin) {
            throw error(400, 'Invalid URL origin');
        }
    } catch (e) {
        if (e?.status === 400) throw e;
        throw error(400, 'Invalid URL origin');
    }
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);

    if (pathSegments[0] !== 'content' || pathSegments.length < 2) {
        throw error(400, 'Invalid URL format');
    }

    const bookId = pathSegments[1];
    const chapterId = pathSegments[2];

    try {
        if (chapterId) {
            // Chapter page
            const {data: chapterContent, error: chapterError} = await supabase
                .from('chapters')
                .select('*, profiles(id, username, avatar_url), book(title, cover_url, owner_id)')
                .eq('id', chapterId)
                .eq('book_id', bookId)
                .single();

            if (chapterError || !chapterContent) {
                throw error(404, 'Chapter not found');
            }

            const rawImage = chapterContent.book.cover_url?.startsWith('http')
                ? chapterContent.book.cover_url
                : ORIGIN + (chapterContent.book.cover_url ?? '/favicon-96x96.png');
            const imageUrl = escapeHtml(resolveImageUrl(rawImage, image_proxy));
            const safeBookTitle = escapeHtml(chapterContent.book.title);
            const safeChapterTitle = escapeHtml(chapterContent.title);
            const safeUsername = escapeHtml(chapterContent.profiles.username);

            // Truncate description if it's too long (escape after truncating plain text fallback)
            const rawDesc = typeof chapterContent.description === 'string' ? chapterContent.description.replace(/<[^>]*>/g, '').slice(0, 100) : '';
            const truncatedDescription = rawDesc ? escapeHtml(rawDesc + (chapterContent.description.length > 100 ? '...' : '')) : '';

            const oembedData = {
                version: '1.0',
                type: 'rich',
                title: `${chapterContent.book.title} - ${chapterContent.title}`,
                author_name: chapterContent.profiles.username,
                author_url: `${ORIGIN}${createProfilePath(chapterContent.profiles.username, chapterContent.profiles.id)}`,
                provider_name: 'DreamingDragons',
                provider_url: ORIGIN,
                url: requestUrl,
                html: `<div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; max-width: ${maxwidth}px; background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <img src="${imageUrl}" alt="${safeBookTitle}" style="width: 60px; height: 60px; border-radius: 4px; margin-right: 12px; object-fit: cover;">
                        <div>
                            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${safeBookTitle}</h3>
                            <p style="margin: 0; color: #666; font-size: 14px;">${safeChapterTitle}</p>
                        </div>
                    </div>
                    ${truncatedDescription ? `<p style="margin: 0 0 8px 0; color: #555; font-size: 13px; line-height: 1.4;">${truncatedDescription}</p>` : ''}
                    <p style="margin: 0; color: #666; font-size: 12px;">By ${safeUsername} on DreamingDragons</p>
                    <a href="${escapeHtml(requestUrl)}" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Read Chapter</a>
                </div>`,
                width: Math.min(maxwidth, 600),
                height: Math.min(maxheight, 200),
                thumbnail_url: imageUrl,
                thumbnail_width: 300,
                thumbnail_height: 300
            };

            return json(oembedData);
        } else {
            // Book page
            const {data: bookContent, error: bookError} = await supabase
                .from('book')
                .select('*, profiles!book_owner_id_fkey(id, username, avatar_url)')
                .eq('id', bookId)
                .single();

            if (bookError || !bookContent) {
                throw error(404, 'Book not found');
            }

            const rawBookImage = bookContent.cover_url?.startsWith('http')
                ? bookContent.cover_url
                : ORIGIN + (bookContent.cover_url ?? '/favicon-96x96.png');
            const imageUrl = escapeHtml(resolveImageUrl(rawBookImage, image_proxy));
            const safeTitle = escapeHtml(bookContent.title);
            const safeAuthor = escapeHtml(bookContent.profiles.username);

            // Truncate description if it's too long (strip tags, then escape)
            const rawBookDesc = typeof bookContent.description === 'string' ? bookContent.description.replace(/<[^>]*>/g, '').slice(0, 150) : '';
            const truncatedDescription = rawBookDesc ? escapeHtml(rawBookDesc + (bookContent.description.length > 150 ? '...' : '')) : '';

            const oembedData = {
                version: '1.0',
                type: 'rich',
                title: bookContent.title,
                author_name: bookContent.profiles.username,
                author_url: `${ORIGIN}${createProfilePath(bookContent.profiles.username, bookContent.profiles.id)}`,
                provider_name: 'DreamingDragons',
                provider_url: ORIGIN,
                url: requestUrl,
                html: `<div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; max-width: ${maxwidth}px; background: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <img src="${imageUrl}" alt="${safeTitle}" style="width: 80px; height: 80px; border-radius: 4px; margin-right: 12px; object-fit: cover;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${safeTitle}</h3>
                            ${truncatedDescription ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 14px; line-height: 1.4;">${truncatedDescription}</p>` : ''}
                        </div>
                    </div>
                    <p style="margin: 0; color: #666; font-size: 12px;">By ${safeAuthor} on DreamingDragons</p>
                    <a href="${escapeHtml(requestUrl)}" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Read Story</a>
                </div>`,
                width: Math.min(maxwidth, 600),
                height: Math.min(maxheight, 250),
                thumbnail_url: imageUrl,
                thumbnail_width: 300,
                thumbnail_height: 300
            };

            return json(oembedData);
        }
    } catch (err) {
        console.error('oEmbed error:', err);
        throw error(500, 'Internal server error');
    }
}
