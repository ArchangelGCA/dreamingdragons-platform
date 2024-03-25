import { PUBLIC_DEFAULT_NAME, PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
import {error as errorx} from '@sveltejs/kit';

export const load = async ( { params, locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();

    /*const command = new ListBucketsCommand({});
    try {
        const response = await s3.send(command);
        console.log(response.Buckets);
    } catch (err) {
        console.log(err);
    }*/

    const id = params.profile;
    let isFollowing = false;
    let isOwner = false;

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

        if (!profile || profile.length === 0) {
            errorx(404, "Profile not found");
            return;
        }

        if (session) {

            isOwner = profile[0].id === session.user.id;

            if (!isOwner) {
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

                isFollowing = follow.length > 0;
            }

            return {session, profile, isOwner, isFollowing};
        }

        return { profile, isOwner, isFollowing };
    }

    if (!session) {
        throw redirect(303, '/login');
    }

    // Check if a profile with the given id already exists
    let { data: profile } = await supabase
        .from('experimental_books_new')
        .select('*')
        .eq('id', session.user.id);

    // If the profile doesn't exist, insert/create a new one
    if (!profile || profile.length === 0) {

        const randomIdUsernameShort = Math.random().toString(36).substring(2, 6);

        const { error } = await supabase
            .from('profiles')
            .insert([{
                id: session.user.id,
                full_name: PUBLIC_DEFAULT_NAME,
                username: PUBLIC_DEFAULT_USERNAME + "-" + randomIdUsernameShort,
                website: '',
                avatar_url: '',
                updated_at: new Date(),
            }]);

        if (error) {
            console.error('Error creating profile', error);
            return {
                status: 500,
                body: {
                    message: "Error creating profile"
                }
            }
        }

        // Retrieve the books
        const { data: updatedProfile, errorNew } = await supabase
            .from('experimental_books_new')
            .select('*')
            .eq('id', session.user.id);

        if (errorNew) {
            console.error('Error retrieving profile', errorNew);
            return {
                status: 500,
                body: {
                    message: "Error retrieving profile"
                }
            }
        }

        profile = updatedProfile;
    }

    isOwner = profile[0].id === session.user.id;

    if (!isOwner) {
        const { data: follow, error } = await supabase
            .from('followers')
            .select('*')
            .eq('following_id', profile[0].user.id)
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

        isFollowing = follow.length > 0;
    }

    return { session, profile, isOwner, isFollowing };
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