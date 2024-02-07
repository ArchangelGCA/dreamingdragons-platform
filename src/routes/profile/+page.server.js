/*import { ListBucketsCommand } from '@aws-sdk/client-s3';*/
import { fail, redirect } from '@sveltejs/kit'

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

    const { data: profile } = await supabase
        .from('profiles')
        .select(`username, full_name, website, avatar_url`)
        .eq('id', session.user.id)
        .single();

    return { session, profile };
}

export const actions = {
    update: async ({ request, locals: { supabase, getSession } }) => {
        const formData = await request.formData()
        const fullName = formData.get('fullName')
        const username = formData.get('username')
        const website = formData.get('website')
        const avatarUrl = formData.get('avatarUrl')

        const session = await getSession()

        const { error } = await supabase.from('profiles').upsert({
            id: session?.user.id,
            full_name: fullName,
            username,
            website,
            avatar_url: avatarUrl,
            updated_at: new Date(),
        })

        if (error) {
            return fail(500, {
                fullName,
                username,
                website,
                avatarUrl,
            })
        }

        return {
            fullName,
            username,
            website,
            avatarUrl,
        }
    },
    signout: async ({ locals: { supabase, getSession } }) => {
        const session = await getSession()
        if (session) {
            await supabase.auth.signOut()
            throw redirect(303, '/')
        }
    },
}
