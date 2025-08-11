import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import {isAdmin} from "$lib/utils/misc.js";
import {createClient} from "@supabase/supabase-js";

export const GET = async ({locals: {supabase, getSession}}) => {

    const {session} = await getSession();

    const result = await isAdmin(session, supabase);
    if (result !== true) return result;

    const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const userId = "someuserid";

    const {data, error} = await adminSupabase.auth.admin.updateUserById(userId,
        {ban_duration: "43800h"});

    if (error) {
        // Return response
        return new Response(
            JSON.stringify({
                message: error.message
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }

    // Return response
    return new Response(
        JSON.stringify({
            message: "User banned " + userId,
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}