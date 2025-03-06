import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID, SUPABASE_SERVICE_ROLE_SECRET_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import {isAdmin} from "$lib/utils/misc.js";
import {Resend} from "resend";
import {createClient} from "@supabase/supabase-js";

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    const pageData = {
        title: 'Admin - Reports',
        description: 'Admin Reports Dashboard of DreamingDragons platform.',
        index: false
    }

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    const resend = new Resend(PRIVATE_RESEND_API_KEY);

    // Get contacts from audience
    const audienceList = await resend.contacts.list({
        audienceId: PRIVATE_RESEND_AUDIENCE_ID
    });

    return {
        ...pageData,
        audience: audienceList.data.data
    }
}

export const actions = {
    getUsersOnPlatform: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
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

        if (!adminSupabase) {
            return {
                status: 500,
                body: {
                    message: "Error creating admin Supabase client"
                }
            }
        }

        // Get all users
        const { data: { users }, error: listUsersError } = await adminSupabase.auth.admin.listUsers({
            page: 1,
            perPage: maxUsers
        });

        if (listUsersError) {
            console.error(listUsersError);
            return {
                status: 500,
                body: {
                    message: "Error fetching users"
                }
            }
        }

        // Get profiles using profiles table, we just need the id (that matches users[].id and username)
        const { data: profiles, error: profilesError } = await adminSupabase
            .from('profiles')
            .select('id, username, can_upload')
            .in('id', users.map(u => u.id));

        if (profilesError) {
            console.error(profilesError);
            return {
                status: 500,
                body: {
                    message: "Error fetching profiles"
                }
            }
        }

        // Add username to users
        users.forEach(u => {
            const profile = profiles.find(p => p.id === u.id);
            if (profile) {
                u.username = profile.username;
                u.can_upload = profile.can_upload;
            }
        });

        return {
            status: 200,
            body: {
                users: users
            }
        }
    },
    addUserToAudience: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const formData = Object.fromEntries(await request.formData());

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const resend = new Resend(PRIVATE_RESEND_API_KEY);

        const {error} = await resend.contacts.create({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID,
            unsubscribed: false,
            email: formData.email,
        });

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: "Error adding user to audience"
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "User " + formData.email +  " added to audience!"
            }
        }
    }
}