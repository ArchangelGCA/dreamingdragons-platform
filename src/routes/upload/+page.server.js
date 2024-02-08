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

    return { session };
}