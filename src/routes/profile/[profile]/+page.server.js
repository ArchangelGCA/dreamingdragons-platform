import {error as errorx, redirect} from '@sveltejs/kit';

// Async function to get liked books, from range start to end, from book_likes
async function fetchBooksLiked(startRange, endRange, profileId, supabase) {
    const {data, error} = await supabase
        .from('book_likes')
        .select('book_id, book!id(id, title, cover_url, owner_id, created_at, profiles:owner_id(id, username, avatar_url))')
        .eq('user_id', profileId)
        .order('created_at', {ascending: false})
        .range(startRange, endRange);

    if (error) throw error;
    return data;
}

// Async function to get books + likes + owner related to them, from range start to end, from book
async function fetchBooks(startRange, endRange, profileId, supabase) {
    const {data, error} = await supabase
        .from('book')
        .select('id, title, owner_id, cover_url, created_at, book_likes(user_id)')
        .eq('owner_id', profileId)
        .order('created_at', {ascending: false})
        .range(startRange, endRange);

    // is_liked for each book
    for (let i = 0; i < data.length; i++) {
        data[i].is_liked = data[i].book_likes.some(like => like.user_id === profileId);
    }

    if (error) throw error;
    return data;
}

export const load = async ({params, locals: {supabase, getSession}}) => {
    const {session} = await getSession();
    const id = params.profile;

    const startRange = 0;
    const endRange = 40;

    const results = {
        isFollowing: false,
        isOwner: false,
    }

    // If there's no id and the user isn't logged in, send to login page
    if (!id && !session) {
        throw redirect(303, '/login');
    }

    /*************************************************/
    //    BEGINNING ACTIONS IF AN ID IS SPECIFIED    //
    /*************************************************/

    if (id) {
        const {data: profile, error: errorTest} = await supabase
            .from('profiles')
            .select('*, book!book_owner_id_fkey(id,title,owner_id,cover_url,created_at, book_likes(user_id)), followers!followers_following_id_fkey(follower_id, profiles!followers_follower_id_fkey(id,username,avatar_url)), gallery(id, name, gallery_books(id, gallery_id, book_id, book(id, owner_id, title, cover_url, hidden)))')
            .eq('id', id)
            .order('created_at', {referencedTable: 'book', ascending: false});

        // Note: Relationships should use nametableofReference!namefield_fkey(data_that_I_want)
        // Example, I want to get many followers related to a profile, I can use followersLoL!followers_following_id_fkey(data_that_I_want) etc.
        // The difference between "!" and ":" is that:
        // The "!" is OneToMany (A profile can have many followers)
        // The ":" is ManyToOne (A follower can follow many profiles)

        if (errorTest) {
            console.error(errorTest);
            errorx(404, "Profile not found!");
        }

        // Profile not found
        if (!profile || profile.length === 0) {

            // If user is logged in but no profile was found, even if this isn't expected to happen, but this is a solution
            // neverthless, we send back the user to the /profile page, that will create the profile if it doesn't exist
            // and then send it back here.
            if (session && id === session.user.id) {
                // redirect to /profile
                return redirect(302, '/profile');
            }

            return errorx(404, "Profile not found");
        }

        results.profile = profile[0];

        // Keep only the first books in range
        if (results.profile.book) {
            results.profile.book = results.profile.book.slice(startRange, endRange);
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
                for (let i = 0; i < results.profile.followers.length; i++) {
                    if (results.profile.followers[i].follower_id === session.user.id) results.isFollowing = true;
                }
            }
        }

        if (results.isOwner || results.profile.show_favourites) {

            // Books liked by user.
            const likedBooks = await fetchBooksLiked(startRange, endRange, id, supabase);

            if (likedBooks instanceof Error) {
                console.error(likedBooks);
                results.likedBooks = [];
            } else {
                results.likedBooks = likedBooks;
            }
        } else {
            results.likedBooks = [];
        }

        return results;
    } else { // ID IS NOT SPECIFIED

        // Hacky way, a user not specifying an id will be redirected to their own profile if they're logged in
        // by /profile page, otherwise they'll go to the login page.
        // This also helps keeping only one profile creation logic in one place ( /profile ).
        if (session) {
            return redirect(302, '/profile');
        }
    }

    /***********************************************/
    //      END ACTIONS IF AN ID IS SPECIFIED      //
    /***********************************************/
}


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
    follow: async ({request, locals: {supabase, getSession}}) => { // TODO: Refactor to use rules directly on database.
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
    books: async ({request, locals: {supabase, getSession}}) => { // using fetchBooks function
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