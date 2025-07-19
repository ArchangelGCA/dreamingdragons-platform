import {error as errorx} from '@sveltejs/kit';
import {ORIGIN} from '$env/static/private';

export const load = async ({locals: {supabase, getSession}}) => {
    const {session} = await getSession();

    /****************************************************/
    // BEGINNING GLOBAL CODE EXECUTED FOR EVERY VISITOR //
    /****************************************************/

    const startRange = 0;
    const endRange = 20;

    const fetchBooks = async (table) => {
        const {data, error} = await supabase
            .from(table)
            .select('*')
            .range(startRange, endRange);
        if (error) throw error;
        return data;
    }

    const fetchCreatedAtBooks = async () => {
        const {data, error} = await supabase
            .from('book')
            .select('id, owner_id, title, cover_url, created_at, hidden, profiles!book_owner_id_fkey(id,username, avatar_url), book_likes(user_id)')
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

    // Process books_ordered_by_created_at to add like information
    if (session) {
        books_ordered_by_created_at.forEach(book => {
            book.is_liked = book.book_likes.some(like => like.user_id === session.user.id);
            book.likes = book.book_likes.length;
        });
    } else {
        books_ordered_by_created_at.forEach(book => {
            book.is_liked = false;
            book.likes = book.book_likes.length;
        });
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
        books_ordered_by_latest_chapter,
        title: 'DreamingDragons - Discover Amazing Stories & Art',
        description: 'Explore a community of storytellers and artists on DreamingDragons. Discover new books, chapters, and creative content from talented creators.',
        imageURL: ORIGIN + '/favicon-192.webp',
        siteName: 'DreamingDragons',
        type: 'website',
        author: 'DreamingDragons Community',
        name: 'DreamingDragons Platform'
    }

    if (!session) { // GUESTS
        results.is_logged = false;
        results.followed = [];
        results.session = null;
    } else { // LOGGED USERS
        results.is_logged = true;
        results.session = session;

        const {data: followed, error: followedError} = await supabase
            .rpc('get_followed_users', {user_id: session.user.id});

        if (followedError) {
            results.followed = [];
        } else {
            results.followed = followed;
        }
    }

    return results;
}

export const actions = {
    books_created_at: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        let startRange = formData.startRange;
        let endRange = formData.endRange;

        if (startRange === null || isNaN(startRange) || startRange < 0) startRange = 0;
        if (endRange === null || isNaN(endRange) || endRange < 0 || endRange < startRange) endRange = startRange + 40;

        let {data: books, error} = await supabase
            .from('book')
            .select('id, owner_id, title, cover_url, created_at, profiles!book_owner_id_fkey(id,username, avatar_url), book_likes(user_id)')
            .order('created_at', {ascending: false})
            .eq('hidden', false)
            .range(startRange, endRange);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (books.length > 40) {
            books = books.slice(0, 40);
        }

        // Process like information
        if (session) {
            books.forEach(book => {
                book.is_liked = book.book_likes.some(like => like.user_id === session.user.id);
                book.likes = book.book_likes.length;
            });
        } else {
            books.forEach(book => {
                book.is_liked = false;
                book.likes = book.book_likes.length;
            });
        }

        return {
            status: 200,
            body: {
                books
            }
        }
    },
    like: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to like content"
                }
            }
        }

        const contentId = formData.contentId;
        const userId = session.user.id;

        if (contentId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: likes, error} = await supabase
            .from('book_likes')
            .select('*')
            .eq('book_id', contentId)
            .eq('user_id', userId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        const action = likes.length === 0 ? 'added' : 'removed';

        if (likes.length === 0) {
            const {error} = await supabase
                .from('book_likes')
                .insert([{book_id: contentId, user_id: userId}]);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        } else {
            const {error} = await supabase
                .from('book_likes')
                .delete()
                .eq('book_id', contentId)
                .eq('user_id', userId);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Like " + action + " successfully"
            }
        }
    },
    newNotifications: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        const latestNotificationTimestamp = formData.latestNotificationTimestamp;
        if (session) {

            const {data: newNotifs, error} = await supabase
                .from('notifications')
                .select('*')
                .gt('created_at', latestNotificationTimestamp)
                .eq('recipient_id', session.user.id)
                .order('created_at', {ascending: false});

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                };
            }

            return {
                status: 200,
                body: {
                    newNotifs
                }
            };
        }

        return {
            status: 401,
            body: {
                message: 'Unauthorized'
            }
        };
    },
    loadMoreNotifications: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        const startRange = formData.startRange;
        const endRange = formData.endRange;

        if (session) {
            const {data: notifs, error} = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', session.user.id)
                .order('created_at', {ascending: false})
                .range(startRange, endRange);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                };
            }

            return {
                status: 200,
                body: {
                    notifs
                }
            };
        }

        return {
            status: 401,
            body: {
                message: 'Unauthorized'
            }
        };
    }
}