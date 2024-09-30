import * as sitemap from 'super-sitemap';

export const GET = async ({locals: {supabase}}) => {

    const [books, chapters, profiles/*, tags*/] = await Promise.all([
        supabase.from('book').select('id'),
        supabase.from('chapters').select('id, book_id'),
        supabase.from('profiles').select('id'),
        //supabase.from('tags').select('name')
    ]);

    // Access data and error from each response
    const { data: booksData, error: booksError } = books;
    const { data: chaptersData, error: chaptersError } = chapters;
    const { data: profilesData, error: profilesError } = profiles;
    // const { data: tagsData, error: tagsError } = tags;

    // Handle errors if any
    if (booksError || chaptersError || profilesError /*|| tagsError*/) {
        // empty books array + profiles
        return await sitemap.response({
            origin: 'https://tales.rosesintheflames.com',
            paramValues: {
                '/content/[book]': [],
                '/content/[book]/[chapter]': [],
            },
            // additionalPaths: [],
            excludeRoutePatterns: [
                '^/edit.*',
                '^/admin.*',
                '^/health.*'
            ]
        });
    }

    return await sitemap.response({
        origin: 'https://tales.rosesintheflames.com',
        paramValues: {
            '/content/[book]': booksData.map((book) => book.id),
            '/content/[book]/[chapter]': chaptersData.map((chapter) => [chapter.book_id, chapter.id]),
            '/profile/[profile]': profilesData.map((profile) => profile.id)
        },
        // additionalPaths: tagsData.map((tag) => `/search?q=${encodeURIComponent(tag.name)}`),
        excludeRoutePatterns: [
            '^/edit.*',
            '^/admin.*',
        ]
    });
};