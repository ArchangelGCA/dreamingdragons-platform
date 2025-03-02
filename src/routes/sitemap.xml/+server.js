export const GET = async ({locals: {supabase}}) => {

    const {data, error} = await supabase
        .from('sitemap_view')
        .select('*');

    if (error) {
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            </urlset>`, {
                headers: {
                    'Content-Type': 'application/xml'
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
        ${data[0].books.map((book) => `
                <url>
                    <loc>https://tales.archangelgca.eu/content/${book}</loc>
                </url>
            `).join('')}
            ${data[0].chapters.map((chapter) => `
                <url>
                    <loc>https://tales.archangelgca.eu/content/${chapter.book_id}/${chapter.chapter_id}</loc>
                </url>
            `).join('')}
            ${data[0].profiles.map((profile) => `
                <url>
                    <loc>https://tales.archangelgca.eu/profile/${profile}</loc>
                </url>
            `).join('')}
            ${data[0].tags.map((tag) => `
                <url>
                    <loc>https://tales.archangelgca.eu/search?tag=${encodeURIComponent(tag)}</loc>
                </url>
            `).join('')}
            </urlset>`, {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );

    // Handle errors if any
    /*if (error) {
        // empty books array + profiles
        return await sitemap.response({
            origin: 'https://tales.archangelgca.eu',
            paramValues: {
                '/content/[book]': [],
                '/content/[book]/[chapter]': [],
            },
            // additionalPaths: [],
            excludeRoutePatterns: [
                '^/edit.*',
                '^/admin.*',
                '^/health.*',
                '^/upload/token.*',
            ],
            headers: {
                'Content-Type': 'application/xml'
            }
        });
    }

    return await sitemap.response({
        origin: 'https://tales.archangelgca.eu',
        paramValues: {
            '/content/[book]': data[0].books,
            '/content/[book]/[chapter]': data[0].chapters.map((chapter) => [chapter.book_id, chapter.chapter_id]),
            '/profile/[profile]': data[0].profiles,
        },
        additionalPaths: data[0].tags.map((tag) => `/search?q=${encodeURIComponent(tag)}`),
        excludeRoutePatterns: [
            '^/edit.*',
            '^/admin.*',
            '^/health.*',
            '^/upload/token.*',
        ],
        headers: {
            'Content-Type': 'application/xml'
        }
    });*/
};