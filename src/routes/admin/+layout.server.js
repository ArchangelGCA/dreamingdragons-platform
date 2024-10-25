import {error as errorx} from '@sveltejs/kit';

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    if (!session) {
        return errorx(401, "Unauthorized");
    }

    /* Role IDs (AS OF NOW):
    / 2 - moderator
    / 3 - admin (FULL PERMS)
    / 4 - staff
     */
    const { data: data, error } = await supabase
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

    return {
        title: 'Roses in The Flames - Admin Dashboard',
        description: 'Admin Dashboard of Roses in The Flames platform.',
        index: false
    }
}