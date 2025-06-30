import {error as errorx, redirect} from '@sveltejs/kit';
import {ORIGIN} from '$env/static/private';

// Async function to get liked books, from range start to end, from book_likes
async function fetchBooksLiked(startRange, endRange, profileId, supabase) {
    const { data, error } = await supabase
        .from('book_likes')
        .select('book_id, book!id(id, title, cover_url, owner_id, created_at, hidden, profiles:owner_id(id, username, avatar_url))')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .range(startRange, endRange);

    if (error) throw error;
    return data;
}

// Async function to get books + likes + owner related to them, from range start to end, from book
async function fetchBooks(startRange, endRange, profileId, supabase) {
    const { data, error } = await supabase
        .from('book')
        .select('id, title, owner_id, cover_url, created_at, book_likes(user_id)')
        .eq('owner_id', profileId)
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .range(startRange, endRange);

    // is_liked for each book
    for (let i = 0; i < data.length; i++) {
        data[i].is_liked = data[i].book_likes.some(like => like.user_id === profileId);
    }

    if (error) throw error;
    return data;
}

export const load = async ({ params, locals: { supabase, getSession } }) => {
    const { session } = await getSession();
    const id = params.profile;

    const startRange = 0;
    const endRange = 40;

    const results = {
        isFollowing: false,
        isOwner: false,
    };

    // If there's no id and the user isn't logged in, send to login page
    if (!id && !session) {
        throw redirect(303, '/login');
    }

    /*************************************************/
    //    BEGINNING ACTIONS IF AN ID IS SPECIFIED    //
    /*************************************************/

    if (id) {
        results.id = id;

        if (id.length !== 36) {
            throw errorx(404, "Profile not found (invalid ID length)");
        }

        // Fetch profile and related data concurrently
        const [profileData, likedBooks] = await Promise.all([
            supabase
                .from('profiles')
                .select('*, book!book_owner_id_fkey(id, title, owner_id, cover_url, created_at, hidden, book_likes(user_id)), followers!followers_following_id_fkey(follower_id, profiles!followers_follower_id_fkey(id, username, avatar_url)), gallery(id, name, gallery_books(id, gallery_id, book_id, book(id, owner_id, title, cover_url, hidden)))')
                .eq('id', id)
                .order('created_at', { referencedTable: 'book', ascending: false }),
            fetchBooksLiked(startRange, endRange, id, supabase)
        ]);

        const { data: profile, error: errorTest } = profileData;

        if (errorTest) {
            console.error(errorTest);
            throw errorx(404, "Profile not found!");
        }

        // Profile not found
        if (!profile || profile.length === 0) {
            if (session && id === session.user.id) {
                return redirect(302, '/profile');
            }
            throw errorx(404, "Profile not found");
        }

        results.profile = profile[0];

        // Remove hidden books and keep only those in range
        if (results.profile.book) {
            results.profile.book = results.profile.book.filter(book => !book.hidden).slice(startRange, endRange);
        }

        let total_likes = 0;
        for (let i = 0; i < results.profile.book.length; i++) {
            if (session) {
                results.profile.book[i].is_liked = results.profile.book[i].book_likes.some(like => like.user_id === session.user.id);
            } else {
                results.profile.book[i].is_liked = false;
            }
            results.profile.book[i].likes = results.profile.book[i].book_likes.length;
            total_likes += results.profile.book[i].book_likes.length;
        }
        results.total_likes = total_likes;
        results.total_followers = results.profile.followers.length;

        // If there's a session
        if (session) {
            results.session = session;
            results.isOwner = results.profile.id === session.user.id;

            if (!results.isOwner) {
                // Check if user is following the profile
                results.isFollowing = results.profile.followers.some(follower => follower.follower_id === session.user.id);
            }
        }

        if (results.isOwner || results.profile.show_favourites) {
            results.likedBooks = likedBooks.filter(book => !book.book.hidden);
        } else {
            results.likedBooks = [];
        }

        results.title = profile[0].username + " - Profile";
        results.description = "Profile of " + profile[0].username + " on DreamingDragons";
        results.imageURL = (profile[0].avatar_url === "" || profile[0].avatar_url === null) ? 
            ORIGIN + "/favicon-192.webp" :
            (profile[0].avatar_url.startsWith('http') ? profile[0].avatar_url : ORIGIN + profile[0].avatar_url);
        results.logo = (profile[0].avatar_url === "" || profile[0].avatar_url === null) ? 
            ORIGIN + "/favicon.svg" :
            (profile[0].avatar_url.startsWith('http') ? profile[0].avatar_url : ORIGIN + profile[0].avatar_url);
        results.author = profile[0].username;
        results.name = profile[0].username;
        results.type = "profile";
        results.siteName = "DreamingDragons";
        return results;
    } else { // ID IS NOT SPECIFIED
        if (session) {
            return redirect(302, '/profile');
        }
    }

    /***********************************************/
    //            END ACTIONS WITH ID              //
    /***********************************************/
};


export const actions = {
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
    follow: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to follow someone"
                }
            }
        }

        const profileId = formData.profileId;
        const userId = session.user.id;
        let follow = false;

        if (profileId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        if (profileId === userId) {
            return {
                status: 400,
                body: {
                    message: "You can't follow yourself"
                }
            }
        }

        // Insert follower if not already following, if already following, delete it from followers
        let {data: followData, error} = await supabase
            .from('followers')
            .select('*')
            .eq('following_id', profileId)
            .eq('follower_id', userId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (followData.length === 0) {
            const {error} = await supabase
                .from('followers')
                .insert([{following_id: profileId, follower_id: userId}]);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }

            follow = true;
        } else {
            const {error} = await supabase
                .from('followers')
                .delete()
                .eq('following_id', profileId)
                .eq('follower_id', userId);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }

            follow = false;
        }

        const action = follow ? 'followed' : 'unfollowed';

        return {
            status: 200,
            body: {
                message: action + " successfully",
                follow: follow
            }
        }
    },
    books_liked: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to view this content"
                }
            }
        }

        const profileId = formData.profileId;
        let startRange = formData.startRange;
        let endRange = formData.endRange;

        if (profileId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields: profileId"
                }
            }
        }

        if (startRange === null || isNaN(startRange) || startRange < 0) startRange = 0;
        if (endRange === null || isNaN(endRange) || endRange < 0 || endRange < startRange) endRange = startRange + 40;

        // Check if user in session is owner of profile, if not, check if profileId allows other users to see their liked books
        if (session && profileId !== session.user.id) {
            const {data: profile, error} = await supabase
                .from('profiles')
                .select('show_favourites')
                .eq('id', profileId);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }

            if (!profile || profile.length === 0) {
                return {
                    status: 404,
                    body: {
                        message: "Profile not found"
                    }
                }
            }

            if (!profile[0].show_favourites) {
                return {
                    status: 403,
                    body: {
                        message: "This profile doesn't allow others to view their liked books"
                    }
                }
            }
        }

        let books = await fetchBooksLiked(startRange, endRange, profileId, supabase);

        if (books instanceof Error) {
            console.error(books);
            return {
                status: 500,
                body: {
                    message: books.message
                }
            }
        }

        // If there's at least one book, check for book_id duplicates and keep only one of them
        if (books.length > 1) {
            const book_ids = [];
            const unique_books = [];

            for (const book of books) {
                if (!book_ids.includes(book.book_id)) {
                    book_ids.push(book.book_id);
                    unique_books.push(book);
                }
            }

            books = unique_books;
        }

        return {
            status: 200,
            body: {
                books
            }
        }
    },
    books: async ({request, locals: {supabase}}) => {
        const formData = Object.fromEntries(await request.formData());

        let startRange = formData.startRange;
        let endRange = formData.endRange;
        let profileId = formData.profileId;

        if (profileId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields: profileId"
                }
            }
        }

        if (startRange === null || isNaN(startRange) || startRange < 0) startRange = 0;
        if (endRange === null || isNaN(endRange) || endRange < 0 || endRange < startRange) endRange = startRange + 40;

        let books = await fetchBooks(startRange, endRange, profileId, supabase);

        if (books instanceof Error) {
            console.error(books);
            return {
                status: 500,
                body: {
                    message: books.message
                }
            }
        }

        return {
            status: 200,
            body: {
                books
            }
        }
    }
}