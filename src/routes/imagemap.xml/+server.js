import { createBookPath, createProfilePath } from '$lib/utils/slugs.js';
import { ORIGIN } from '$env/static/private';
import { resolveImageUrl, escapeHtml } from '$lib/utils/images.js';

const SITE = ORIGIN || 'https://tales.archangelgca.eu';

const toAbsoluteImage = (value) => {
    if (!value || typeof value !== 'string') return '';
    const resolved = resolveImageUrl(value);
    if (resolved.startsWith('http')) return resolved;
    if (resolved.startsWith('/')) return `${SITE}${resolved}`;
    return '';
};

export const GET = async ({locals: {supabase}}) => {
    const {data: bookCoverUrls, error: errorBook} = await supabase
        .from('book')
        .select('id, title, cover_url');

    const {data: profileAvatarCoverUrls, error: errorProfile} = await supabase
        .from('profiles')
        .select('id, username, avatar_url, cover_url');

    if (errorBook || errorProfile) {
        return {
            status: 500,
            body: {
                error: 'An error occurred while fetching the data.'
            }
        };
    }
    
    // Check for duplicated book cover url and empty ones and remove them. bookCoverUrls is an array of objects
    // like this [ {cover_url: url} ]
    const bookCoverUrlsFiltered = bookCoverUrls.filter((book, index, self) => {
        return book.cover_url && self.findIndex((t) => t.cover_url === book.cover_url) === index;
    });

    // Check for duplicated profile avatar and cover url and empty ones and remove them, profileAvatarCoverUrls is an array of objects
    const profileAvatarCoverUrlFiltered = profileAvatarCoverUrls.filter((profile, index, self) => {
        return profile.avatar_url && profile.cover_url && self.findIndex((t) => t.avatar_url === profile.avatar_url && t.cover_url === profile.cover_url) === index;
    });

    // Output xml sitemap format like, following google image search sitemap format.
    // NOTE: external image proxy decommissioned — sitemap now lists original image URLs at best quality.
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        <url>
            <loc>${SITE}</loc>
        </url>
        <url>
            <loc>${SITE}/legal/privacy-policy</loc>
        </url>
        <url>
            <loc>${SITE}/legal/tos</loc>
        </url>
        <url>
            <loc>${SITE}/login</loc>
        </url>
        <url>
            <loc>${SITE}/search</loc>
        </url>
        <url>
            <loc>${SITE}/settings</loc>
        </url>
        <url>
            <loc>${SITE}/settings/updates</loc>
        </url>
        <url>
            <loc>${SITE}/staff/timezones</loc>
        </url>
        <url>
            <loc>${SITE}/updates</loc>
        </url>
        <url>
            <loc>${SITE}/upload</loc>
        </url>
            ${bookCoverUrlsFiltered.map((book) => {
                const img = toAbsoluteImage(book.cover_url);
                return `
                <url>
                    <loc>${SITE}${createBookPath(book.title, book.id)}</loc>
                    ${img ? `<image:image><image:loc>${escapeHtml(img)}</image:loc></image:image>` : ''}
                </url>`;
            }).join('')}
            ${profileAvatarCoverUrlFiltered.map((profile) => {
                const avatar = toAbsoluteImage(profile.avatar_url);
                const cover = toAbsoluteImage(profile.cover_url);
                return `
                <url>
                    <loc>${SITE}${createProfilePath(profile.username, profile.id)}</loc>
                    ${avatar ? `<image:image><image:loc>${escapeHtml(avatar)}</image:loc></image:image>` : ''}
                    ${cover && cover !== avatar ? `<image:image><image:loc>${escapeHtml(cover)}</image:loc></image:image>` : ''}
                </url>`;
            }).join('')}
        </urlset>`, {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}