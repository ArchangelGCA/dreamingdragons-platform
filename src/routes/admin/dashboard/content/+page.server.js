import {error as errorx} from "@sveltejs/kit";

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

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    // Get all books and chapters
    const {data: content, error: booksError} = await supabase
        .from('book')
        .select('*, profiles:owner_id(*), chapters:chapters(*)')
        .order('created_at', {ascending: false});

    if (booksError) {
        console.error(booksError);
        return errorx(500, "Error fetching books");
    }

    return { content }
}