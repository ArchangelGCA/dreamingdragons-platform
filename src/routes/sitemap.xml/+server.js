import * as sitemap from 'super-sitemap';

export const GET = async ({locals: {supabase, getSession}}) => {

    const [books, chapters, profiles] = await Promise.all([
        supabase.from('book').select('id'),
        supabase.from('chapters').select('id, book_id'),
        supabase.from('profiles').select('id')
    ]);

    // Access data and error from each response
    const { data: booksData, error: booksError } = books;
    const { data: chaptersData, error: chaptersError } = chapters;
    const { data: profilesData, error: profilesError } = profiles;

    // Handle errors if any
    if (booksError || chaptersError || profilesError) {
        // empty books array + profiles
        return await sitemap.response({
            origin: 'https://tales.rosesintheflames.com',
            paramValues: {
                '/content/[book]': [],
                '/content/[book]/[chapter]': [],
            },
            additionalPaths: []
        });
    }

    return await sitemap.response({
        origin: 'https://tales.rosesintheflames.com',
        paramValues: {
            '/content/[book]': booksData.map((book) => book.id),
            '/content/[book]/[chapter]': chaptersData.map((chapter) => [chapter.book_id, chapter.id]),
        },
        additionalPaths: [
            ...(profilesData.map((profile) => `/profile?id=${profile.id}`))
        ]
    });
};