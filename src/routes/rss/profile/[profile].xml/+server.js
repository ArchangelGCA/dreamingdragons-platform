import {
    generateRSSFeed,
    generateUserBookRSSItem,
    generateUserActivityRSSItem,
    FEEDS,
    SITE_URL
} from '$lib/utils/rss.js';

export const prerender = false;

export const GET = async ({params, locals: {supabase}}) => {
    const profileId = params.profile;

    if (!profileId || profileId.length !== 36) {
        return new Response('Profile not found', {status: 404});
    }

    try {
        const {data: profile, error: profileError} = await supabase
            .from('profiles')
            .select('id, username, show_favourites')
            .eq('id', profileId)
            .single();

        if (profileError || !profile) {
            return new Response('Profile not found', {status: 404});
        }

        const username = profile.username;

        const [publishedBooksResult, likedBooksResult] = await Promise.all([
            supabase
                .from('book')
                .select('id, title, owner_id, created_at')
                .eq('owner_id', profileId)
                .eq('hidden', false)
                .order('created_at', {ascending: false})
                .limit(25),

            profile.show_favourites ?
                supabase
                    .from('book_likes')
                    .select('book_id, created_at, book!id(id, title, cover_url, owner_id, hidden, profiles:owner_id(username))')
                    .eq('user_id', profileId)
                    .order('created_at', {ascending: false})
                    .limit(25)
                : {data: [], error: null}
        ]);

        if (publishedBooksResult.error) {
            console.error('Error fetching published books for RSS:', publishedBooksResult.error);
        }

        if (likedBooksResult.error) {
            console.error('Error fetching liked books for RSS:', likedBooksResult.error);
        }

        const publishedBooks = publishedBooksResult.data || [];
        const likedBooks = (likedBooksResult.data || []).filter(like => !like.book.hidden);

        const allActivities = [
            ...publishedBooks.map(book => ({...book, type: 'published'})),
            ...likedBooks.map(like => ({
                ...like,
                type: 'liked',
                created_at: like.created_at
            }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50);

        // Generate RSS items
        const rssItems = allActivities.map(activity => {
            if (activity.type === 'published') {
                return generateUserBookRSSItem(activity, username);
            } else {
                return generateUserActivityRSSItem(activity, username);
            }
        });
        const feedConfig = FEEDS.USER_ACTIVITY(username);
        const feed = generateRSSFeed(
            feedConfig.title,
            feedConfig.description,
            SITE_URL,
            `${SITE_URL}/rss/profile/${profileId}.xml`,
            rssItems
        );

        return new Response(feed, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'max-age=3600'
            }
        });

    } catch (error) {
        console.error('Error generating profile RSS feed:', error);
        const feedConfig = FEEDS.USER_ACTIVITY('Unknown User');
        const emptyFeed = generateRSSFeed(
            feedConfig.title,
            feedConfig.description,
            SITE_URL,
            `${SITE_URL}/rss/profile/unknown.xml`,
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
