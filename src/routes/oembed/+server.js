import {error, json} from '@sveltejs/kit';
import {ORIGIN} from '$env/static/private';
import { createProfilePath } from '$lib/utils/slugs.js';

export async function GET({url, locals: {supabase, image_proxy}}) {
    const requestUrl = url.searchParams.get('url');
    const format = url.searchParams.get('format') || 'json';
    const maxwidth = parseInt(url.searchParams.get('maxwidth') || '1024');
    const maxheight = parseInt(url.searchParams.get('maxheight') || '1024');

    if (!requestUrl) {
        throw error(400, 'Missing url parameter');
    }

    if (format !== 'json') {
        throw error(501, 'Only JSON format is supported');
    }

    // Parse the URL to determine if it's a content page or chapter page
    const urlObj = new URL(requestUrl);
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

            const imageUrl = chapterContent.book.cover_url.startsWith('http')
                ? chapterContent.book.cover_url
                : (image_proxy ? image_proxy + chapterContent.book.cover_url : ORIGIN + chapterContent.book.cover_url);

            // Truncate description if it's too long
            const truncatedDescription = chapterContent.description && chapterContent.description.length > 100
                ? chapterContent.description.substring(0, 100) + '...'
                : chapterContent.description || '';

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
                        <img src="${imageUrl}" alt="${chapterContent.book.title}" style="width: 60px; height: 60px; border-radius: 4px; margin-right: 12px; object-fit: cover;">
                        <div>
                            <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${chapterContent.book.title}</h3>
                            <p style="margin: 0; color: #666; font-size: 14px;">${chapterContent.title}</p>
                        </div>
                    </div>
                    ${truncatedDescription ? `<p style="margin: 0 0 8px 0; color: #555; font-size: 13px; line-height: 1.4;">${truncatedDescription}</p>` : ''}
                    <p style="margin: 0; color: #666; font-size: 12px;">By ${chapterContent.profiles.username} on DreamingDragons</p>
                    <a href="${requestUrl}" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Read Chapter</a>
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

            const imageUrl = bookContent.cover_url.startsWith('http')
                ? bookContent.cover_url
                : (image_proxy ? image_proxy + bookContent.cover_url : ORIGIN + bookContent.cover_url);

            // Truncate description if it's too long
            const truncatedDescription = bookContent.description && bookContent.description.length > 150
                ? bookContent.description.substring(0, 150) + '...'
                : bookContent.description || '';

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
                        <img src="${imageUrl}" alt="${bookContent.title}" style="width: 80px; height: 80px; border-radius: 4px; margin-right: 12px; object-fit: cover;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${bookContent.title}</h3>
                            ${truncatedDescription ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 14px; line-height: 1.4;">${truncatedDescription}</p>` : ''}
                        </div>
                    </div>
                    <p style="margin: 0; color: #666; font-size: 12px;">By ${bookContent.profiles.username} on DreamingDragons</p>
                    <a href="${requestUrl}" style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">Read Story</a>
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
