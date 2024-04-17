import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_SECRET_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import {error as errorx} from '@sveltejs/kit';

async function isAdmin(session, supabase) {
    if (!session) {
        return errorx(401, "Unauthorized");
    }

    /* Role IDs (AS OF NOW):
    / 2 - moderator
    / 3 - admin (FULL PERMS)
    / 4 - staff
     */
    const {data: data, error} = await supabase
        .from('roles_profile')
        .select('role_id')
        .eq('user_id', session.user.id)
        .eq('role_id', 3);

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching profile");
    }

    if (!data || data.length === 0) {
        return errorx(401, "Unauthorized");
    }

    return true;
}

export const load = async ( { locals: { supabase, getSession } }) => {
    const session = await getSession();
    let maxUsers = 1000000;

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    // Use supabase-js and make admin supabase client
    const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_SECRET_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const {data: profiles, error} = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', {ascending: false});

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching users");
    }

    const { data: { users }, error: listUsersError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: maxUsers
    })

    if (listUsersError) {
        console.error(listUsersError);
        return errorx(500, "Error fetching users");
    }

    profiles.forEach(profile => {
        const user = users.find(user => user.id === profile.id);
        if (user) {
            profile.email = user.email;
        }
    });

    return {
        profiles
    }
}

