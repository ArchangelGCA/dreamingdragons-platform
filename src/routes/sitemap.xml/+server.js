import * as sitemap from 'super-sitemap';

export const GET = async ({locals: {supabase}}) => {

    const { data, error } = await supabase
        .from('sitemap_view')
        .select('*');

    // Handle errors if any
    if (error) {
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
        excludeRoutePatterns: [
            '^/edit.*',
            '^/admin.*',
        ],
        paramValues: {
            '/content/[book]': data[0].books,
            '/content/[book]/[chapter]': data[0].chapters.map((chapter) => [chapter.book_id, chapter.chapter_id]),
            '/profile/[profile]': data[0].profiles,
        },
        additionalPaths: data[0].tags.map((tag) => `/search?q=${encodeURIComponent(tag)}`),
        headers: {
            'Content-Type': 'application/xml'
        }
    });
};