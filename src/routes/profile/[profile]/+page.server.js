import {error as errorx, redirect} from '@sveltejs/kit';

export const load = async ( { params, locals: { supabase, getSession } }) => {
    const {session} = await getSession();
    const id = params.profile;

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
            .select('*, book!book_owner_id_fkey(id,title,owner_id,cover_url,created_at, book_likes(user_id)), followers!followers_following_id_fkey(follower_id, profiles!followers_follower_id_fkey(id,username))')
            .eq('id', id)
            .order('created_at', {referencedTable: 'book' ,ascending: false});

        // Note: Relationships should use nametableofReference!namefield_fkey(data_that_I_want)
        // Example, I want to get many followers related to a profile, I can use followersLoL!followers_following_id_fkey(data_that_I_want) etc.
        // The difference between "!" and ":" is that:
        // The "!" is OneToMany (A profile can have many followers)
        // The ":" is ManyToOne (A follower can follow many profiles)

        if (errorTest) {
            console.error(errorTest);
            return {
                status: 500,
                body: {
                    message: errorTest.message
                }
            }
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
    like: async ({ request, locals: { supabase, getSession } }) => {
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

        const { data: likes, error } = await supabase
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
            const { error } = await supabase
                .from('book_likes')
                .insert([{ book_id: contentId, user_id: userId }]);

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
            const { error } = await supabase
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
    follow: async ({ request, locals: { supabase, getSession } }) => { // TODO: Refactor to use rules directly on database.
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
        let { data: followData, error } = await supabase
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
            const { error } = await supabase
                .from('followers')
                .insert([{ following_id: profileId, follower_id: userId }]);

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
            const { error } = await supabase
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
    }
}