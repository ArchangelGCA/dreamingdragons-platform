/*import { ListBucketsCommand } from '@aws-sdk/client-s3';*/
import { PUBLIC_DEFAULT_NAME, PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();

    /*const command = new ListBucketsCommand({});
    try {
        const response = await s3.send(command);
        console.log(response.Buckets);
    } catch (err) {
        console.log(err);
    }*/

    if (!session) {
        throw redirect(303, '/login');
    }

    // Check if a profile with the given id already exists
    let { data: profile } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', session.user.id);

    // If the profile doesn't exist, insert a new one
    if (!profile || profile.length === 0) {
        const { error } = await supabase
            .from('profiles')
            .insert([{
                id: session.user.id,
                full_name: PUBLIC_DEFAULT_NAME,
                username: PUBLIC_DEFAULT_USERNAME,
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
                .from('user_books')
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

        // TODO: Database Like Table + Add like + Also update user_books view to return if user has liked the book
        // TODO: Also make new policies for book_likes and chapter_likes tables.
    }
}