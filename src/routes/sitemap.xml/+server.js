import { createBookPath, createChapterPath, createProfilePath } from '$lib/utils/slugs.js';

export const GET = async ({locals: {supabase}}) => {

    const {data: newData, error: newError} = await supabase
        .from('sitemap_view_with_titles')
        .select('*');

    if (newError) {
        console.error('Sitemap database error:', newError);
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
                status: 500,
                headers: {
                    'Content-Type': 'application/xml; charset=UTF-8'
                }
            }
        );
    }

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
    <loc>https://tales.archangelgca.eu</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/legal/privacy-policy</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/legal/tos</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/login</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/search</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/settings</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/settings/updates</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/staff/timezones</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/updates</loc>
</url>
<url>
    <loc>https://tales.archangelgca.eu/upload</loc>
</url>
${newData && newData[0] && newData[0].books ? newData[0].books.map((book) => `<url>
    <loc>https://tales.archangelgca.eu${createBookPath(book.title, book.id)}</loc>
</url>`).join('') : ''}${newData && newData[0] && newData[0].chapters ? newData[0].chapters.map((chapter) => `<url>
    <loc>https://tales.archangelgca.eu${createChapterPath(chapter.book_title, chapter.book_id, chapter.chapter_title, chapter.chapter_id)}</loc>
</url>`).join('') : ''}${newData && newData[0] && newData[0].profiles ? newData[0].profiles.map((profile) => `<url>
    <loc>https://tales.archangelgca.eu${createProfilePath(profile.username, profile.id)}</loc>
</url>`).join('') : ''}${newData && newData[0] && newData[0].tags ? newData[0].tags.map((tag) => `<url>
    <loc>https://tales.archangelgca.eu/search?tag=${encodeURIComponent(tag)}</loc>
</url>`).join('') : ''}
</urlset>`, {
            headers: {
                'Content-Type': 'application/xml; charset=UTF-8'
            }
        }
    );
};