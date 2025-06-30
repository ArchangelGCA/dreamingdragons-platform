import { 
    generateRSSHeader, 
    generateRSSFooter, 
    generateChapterRSSItem,
    escapeHTML
} from '$lib/utils/rss.js';

export const prerender = false;

export const GET = async ({ params, locals: { supabase } }) => {
    const bookId = params.book;
    
    try {
        // Get book information
        const { data: book, error: bookError } = await supabase
            .from('book')
            .select('id, title, owner_id, created_at, profiles!book_owner_id_fkey(username)')
            .eq('id', bookId)
            .eq('hidden', false)
            .single();

        if (bookError || !book) {
            return new Response('Book not found', { status: 404 });
        }

        // Get chapters for this book
        const { data: chapters, error: chaptersError } = await supabase
            .from('chapters')
            .select('id, title, book_id, owner_id, created_at, book!chapters_book_id_fkey(id, title), profiles!chapters_owner_id_fkey(username)')
            .eq('book_id', bookId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (chaptersError) {
            console.error('Error fetching chapters for book RSS:', chaptersError);
            return new Response('Error fetching chapters', { status: 500 });
        }

        const bookTitle = escapeHTML(book.title);
        const authorName = book.profiles?.username || 'Unknown Author';
        const feedTitle = `${bookTitle} - Chapters by ${authorName}`;
        const feedDescription = `Latest chapters from "${bookTitle}" by ${escapeHTML(authorName)} on DreamingDragons`;
        const feedLink = `https://tales.archangelgca.eu/content/${bookId}`;
        const selfLink = `https://tales.archangelgca.eu/rss/content/${bookId}.xml`;

        // Generate RSS items
        const rssItems = (chapters || []).map(chapter => generateChapterRSSItem(chapter)).join('\n');

        const rss = `${generateRSSHeader(feedTitle, feedDescription, feedLink, selfLink)}
${rssItems}
${generateRSSFooter()}`;

        return new Response(rss, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'max-age=3600, s-maxage=3600'
            }
        });
    } catch (error) {
        console.error('Error generating book RSS feed:', error);
        return new Response('Internal server error', { status: 500 });
    }
};
