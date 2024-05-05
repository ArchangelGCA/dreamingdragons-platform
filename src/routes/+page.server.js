import {error as errorx} from '@sveltejs/kit';

export const load = async ( { locals: { supabase, getSession } }) => {
    const { session } = await getSession();

    /****************************************************/
    // BEGINNING GLOBAL CODE EXECUTED FOR EVERY VISITOR //
    /****************************************************/

    const startRange = 0;
    const endRange = 20;

    const fetchBooks = async (table) => {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .range(startRange, endRange);
        if (error) throw error;
        return data;
    }

    let books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter;

    try {
        [books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter] = await Promise.all([
            fetchBooks('books_ordered_by_likes'),
            fetchBooks('books_ordered_by_created_at'),
            fetchBooks('books_ordered_by_latest_chapter_created_at')
        ]);
    } catch (error) {
        console.error(error);
        return errorx(500, "Error fetching content")
    }

    /****************************************************/
    //    END GLOBAL CODE EXECUTED FOR EVERY VISITOR    //
    /****************************************************/

    const results = {
        books_ordered_by_likes,
        books_ordered_by_created_at,
        books_ordered_by_latest_chapter
    }

    if (!session) { // GUESTS
        results.is_logged = false;
        results.followed = [];
    } else { // LOGGED USERS
        results.is_logged = true;

        const { data: followed, error: followedError } = await supabase
            .rpc('get_followed_users', { user_id: session.user.id });

        if (followedError) {
            results.followed = [];
        } else {
            results.followed = followed;
        }
    }

    return results;
}