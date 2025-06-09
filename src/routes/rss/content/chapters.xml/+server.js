import { 
    generateRSSFeed, 
    generateChapterRSSItem,
    FEEDS,
    SITE_URL 
} from '$lib/utils/rss.js';

export const prerender = false;

export const GET = async ({ locals: { supabase } }) => {
    try {
        const { data: chapters, error } = await supabase
            .from('chapters')
            .select('id, title, book_id, owner_id, created_at, book!chapters_book_id_fkey(id, title), profiles!chapters_owner_id_fkey(username)')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching chapters for RSS:', error);
            throw error;
        }

        // Generate RSS items
        const rssItems = (chapters || []).map(chapter => generateChapterRSSItem(chapter));

        const feed = generateRSSFeed(
            FEEDS.CHAPTERS.title,
            FEEDS.CHAPTERS.description,
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
        console.error('Error generating chapters RSS feed:', error);
        
        const emptyFeed = generateRSSFeed(
            FEEDS.CHAPTERS.title,
            FEEDS.CHAPTERS.description,
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
