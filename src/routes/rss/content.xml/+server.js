import { 
    generateRSSFeed, 
    generateBookRSSItem, 
    generateChapterRSSItem,
    FEEDS,
    SITE_URL 
} from '$lib/utils/rss.js';

export const prerender = false;

export const GET = async ({ locals: { supabase } }) => {
    try {
        const [booksResult, chaptersResult] = await Promise.all([
            supabase
                .from('book')
                .select('id, title, owner_id, created_at, profiles!book_owner_id_fkey(username)')
                .eq('hidden', false)
                .order('created_at', { ascending: false })
                .limit(25),
                
            supabase
                .from('chapters')
                .select('id, title, book_id, owner_id, created_at, book!chapters_book_id_fkey(id, title), profiles!chapters_owner_id_fkey(username)')
                .order('created_at', { ascending: false })
                .limit(25)
        ]);

        if (booksResult.error) {
            console.error('Error fetching books for RSS:', booksResult.error);
        }
        
        if (chaptersResult.error) {
            console.error('Error fetching chapters for RSS:', chaptersResult.error);
        }

        const books = booksResult.data || [];
        const chapters = chaptersResult.data || [];

        const allItems = [
            ...books.map(book => ({ ...book, type: 'book' })),
            ...chapters.map(chapter => ({ ...chapter, type: 'chapter' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
         .slice(0, 50);

        // Generate RSS items
        const rssItems = allItems.map(item => {
            if (item.type === 'book') {
                return generateBookRSSItem(item);
            } else {
                return generateChapterRSSItem(item);
            }
        });

        const feed = generateRSSFeed(
            FEEDS.CONTENT.title,
            FEEDS.CONTENT.description,
            SITE_URL,
            rssItems
        );

        return new Response(feed, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'max-age=3600'
            }
        });

    } catch (error) {
        console.error('Error generating RSS feed:', error);
        
        const emptyFeed = generateRSSFeed(
            FEEDS.CONTENT.title,
            FEEDS.CONTENT.description,
            SITE_URL,
            []
        );

        return new Response(emptyFeed, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8'
            },
            status: 500
        });
    }
};
