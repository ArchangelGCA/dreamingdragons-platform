import {error as errorx} from "@sveltejs/kit";
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_SECRET_KEY } from '$env/static/private';
import {createClient} from "@supabase/supabase-js";
import {isAdmin} from "$lib/utils/misc.js";

function getActivePanic(panic) {
    if (!panic || panic.length === 0) {
        return {
            panic: {is_active: false}
        }
    } else {
        if (panic.length === 1){ // Only one panic found, return it
            return {
                panic: panic[0]
            }
        } else {
            const activePanic = panic.filter((p) => p.is_active === true);
            if (activePanic.length > 1){ // Multiple active panic found, return latest one
                return {
                    panic: activePanic[0]
                }
            } else if (activePanic.length === 0){ // No active panic found, return latest one
                return {
                    panic: panic[0]
                }
            } else { // One active panic found, return it
                return {
                    panic: activePanic
                }
            }
        }
    }
}

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();
    let maxUsers = 1000000;

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    const {data: panic, error: panicError} = await supabase
        .from('panic')
        .select('*')
        .order('created_at', {ascending: false});

    if (panicError) {
        console.error(panicError);
        return errorx(500, "Error fetching panic");
    }

    return {
        panic: getActivePanic(panic),
        title: 'Admin - Dashboard',
        description: 'Admin Dashboard of DreamingDragons platform.',
        index: false,
    }
}

export const actions = {
    enable_panic: async ({locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // insert into panic table with is_active value set to true.
        const {error} = await adminSupabase
            .from('panic')
            .insert({
                is_active: true,
                profile_trigger: session.user.id
            });

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: "Error enabling Panic Mode"
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Panic Mode enabled"
            }
        }
    },
    disable_panic: async ({locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const {error} = await adminSupabase
            .from('panic')
            .update({
                is_active: false
            })
            .eq('is_active', true);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: "Error disabling Panic Mode"
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Panic Mode disabled"
            }
        }
    }
}