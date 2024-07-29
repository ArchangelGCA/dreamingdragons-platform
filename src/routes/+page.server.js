import {error as errorx} from '@sveltejs/kit';

export const load = async ( { locals: { supabase, getSession } }) => {
    const { session } = await getSession();

    /****************************************************/
    // BEGINNING GLOBAL CODE EXECUTED FOR EVERY VISITOR //
    /****************************************************/

    const startRange = 0;
    const endRange = 40;

    const fetchBooks = async (table) => {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .range(startRange, endRange);
        if (error) throw error;
        return data;
    }

    const fetchCreatedAtBooks = async () => {
        const { data, error } = await supabase
            .from('book')
            .select('id, owner_id, title, cover_url, created_at, hidden, profiles!book_owner_id_fkey(id,username, avatar_url)')
            .order('created_at', {ascending: false})
            .eq('hidden', false)
            .range(startRange, endRange);

        if (error) throw error;
        return data;
    }

    let books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter;

    try {
        [books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter] = await Promise.all([
            fetchBooks('secure_books_ordered_by_likes_new'),
            fetchCreatedAtBooks(),
            fetchBooks('secure_books_ordered_by_latest_chapter_created_at_new')
        ]);
    } catch (error) {
        console.error(error);
        return errorx(500, "Error fetching content")
    }

    /*const { data: new_books_ordered_by_likes, error: new_books_likes_error } = await supabase
        .from('book')
        .select('id, owner_id, title, cover_url, created_at, profiles!book_owner_id_fkey(id,username, avatar_url), book_likes(count)')
        .order('count', {referencedTable: 'book_likes', ascending: true}) // NOT WORKING SORT
        .range(startRange, endRange);

    if (new_books_likes_error) {
        console.error(new_books_likes_error);
        return errorx(500, "Error fetching content")
    }

    // Print all new_books_ordered_by_likes with likes count
    for (const book of new_books_ordered_by_likes) {
        console.log(book.title, book.book_likes);
    }*/

    /*const { data: new_books_ordered_by_latest_chapter_created_at, error: new_books_chapter_created_at_error } = await supabase
        .from('book')
        .select('id, owner_id, title, cover_url, created_at, profiles!book_owner_id_fkey(id,username, avatar_url), chapters(created_at)')
        .order('created_at', {referencedTable: 'chapters', ascending: false})
        .range(startRange, endRange);

    if (new_books_chapter_created_at_error) {
        console.error(new_books_chapter_created_at_error);
        return errorx(500, "Error fetching content")
    }

    console.log("new_books_ordered_by_latest_chapter_created_at", new_books_ordered_by_latest_chapter_created_at);*/ // DOESN'T SORT, but it sorts only chapters.

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