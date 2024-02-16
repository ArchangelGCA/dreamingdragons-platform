/*import { ListBucketsCommand } from '@aws-sdk/client-s3';*/
import { PUBLIC_DEFAULT_NAME, PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
import {error, redirect} from '@sveltejs/kit'

export const load = async ( { url, locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();

    /*const command = new ListBucketsCommand({});
    try {
        const response = await s3.send(command);
        console.log(response.Buckets);
    } catch (err) {
        console.log(err);
    }*/

    const id = url.searchParams.get('id');

    if (id) {
        let {data: profile} = await supabase
            .from('user_books_new')
            .select('*')
            .eq('user_id', id);

        if (!profile || profile.length === 0) {
            error(404, "Profile not found");
            return;
        }

        if (session) return { session, profile };

        return { profile };
    }

    if (!session) {
        throw redirect(303, '/login');
    }

    // Check if a profile with the given id already exists
    let { data: profile } = await supabase
        .from('user_books_new')
        .select('*')
        .eq('user_id', session.user.id);

    // If the profile doesn't exist, insert a new one
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
        } else {
            // Retrieve the user_books again after the insert operation
            const { data: updatedProfile } = await supabase
                .from('user_books_new')
                .select('*')
                .eq('user_id', session.user.id);

            profile = updatedProfile;
        }
    }

    return { session, profile };
}


export const actions = {
    like: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        if (!session) {
            throw redirect(303, '/login');
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
    }
}