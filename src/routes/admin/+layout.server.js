import {error as errorx} from '@sveltejs/kit';
import {isAdmin} from "$lib/utils/misc.js";

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();
    const { result } = await isAdmin(session, supabase);

    if (result instanceof Error || result !== true) return result;

    return {
        title: 'DreamingDragons - Admin Dashboard',
        description: 'Admin Dashboard of DreamingDragons platform.',
        index: false
    }
}