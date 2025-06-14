import {
    generateRSSFeed,
    generateBookRSSItem,
    FEEDS,
    SITE_URL
} from '$lib/utils/rss.js';

export const prerender = false;

export const GET = async ({locals: {supabase}}) => {
    try {
        const {data: books, error} = await supabase
            .from('book')
            .select('id, title, owner_id, created_at, profiles!book_owner_id_fkey(username)')
            .eq('hidden', false)
            .order('created_at', {ascending: false})
            .limit(50);

        if (error) {
            console.error('Error fetching books for RSS:', error);
            throw error;
        }

        // Generate RSS items
        const rssItems = (books || []).map(book => generateBookRSSItem(book));
        const feed = generateRSSFeed(
            FEEDS.BOOKS.title,
            FEEDS.BOOKS.description,
            SITE_URL,
            `${SITE_URL}/rss/content/books.xml`,
            rssItems
        );

        return new Response(feed, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'max-age=3600'
            }
        });

    } catch (error) {
        console.error('Error generating books RSS feed:', error);
        const emptyFeed = generateRSSFeed(
            FEEDS.BOOKS.title,
            FEEDS.BOOKS.description,
            SITE_URL,
            `${SITE_URL}/rss/content/books.xml`,
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
