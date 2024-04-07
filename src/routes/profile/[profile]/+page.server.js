import {error as errorx, redirect} from '@sveltejs/kit';

export const load = async ( { params, locals: { supabase, getSession } }) => {
    const session = await getSession();
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
        let {data: profile, errorId} = await supabase
            .from('experimental_books_new')
            .select('*')
            .eq('id', id);

        if (errorId) {
            console.error(errorId);
            return {
                status: 500,
                body: {
                    message: errorId.message
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

        results.profile = profile;

        // If there's a session
        if (session) {

            results.session = session;
            results.isOwner = profile[0].id === session.user.id;

            if (!results.isOwner) {
                const { data: follow, error } = await supabase
                    .from('followers')
                    .select('*')
                    .eq('following_id', profile[0].id)
                    .eq('follower_id', session.user.id);

                if (error) {
                    console.error(error);
                    return {
                        status: 500,
                        body: {
                            message: error.message
                        }
                    }
                }

                results.isFollowing = follow.length > 0;
            }
        }

        return results;
    } else { // ID IS NOT SPECIFIED

        // Hacky way, a user not specifying an id will be redirected to their profile to their own profile if they're logged in
        // by /profile page, otherwise they'll go to the login page.
        // This also helps keeping only one profile creation login in one place ( /profile ).
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
        const session = await getSession();

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
        const session = await getSession();

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