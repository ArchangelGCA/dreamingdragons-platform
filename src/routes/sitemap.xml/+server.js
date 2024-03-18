import * as sitemap from 'super-sitemap';

export const GET = async ({locals: {supabase, getSession}}) => {

    // get from books table of supabase and return the list of books
    const { data: books, error } = await supabase
        .from('book')
        .select('id');

    const {data: chapters, error: error2} = await supabase
        .from('chapters')
        .select('id, book_id');

    if (error || error2) {
        // empty books array
        return await sitemap.response({
            origin: 'https://tales.rosesintheflames.com',
            paramValues: {
                '/content/[book]': [],
                '/content/[book]/[chapter]': [],
            },
        });
    }

    return await sitemap.response({
        origin: 'https://tales.rosesintheflames.com',
        paramValues: {
            '/content/[book]': books.map((book) => book.id),
            '/content/[book]/[chapter]': chapters.map((chapter) => [chapter.book_id, chapter.id]),
        },
    });
};