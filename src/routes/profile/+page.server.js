/*import { ListBucketsCommand } from '@aws-sdk/client-s3';*/
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

    const { data: profile } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, created_at`)
        .eq('id', session.user.id)
        .single();

    return { session, profile };
}