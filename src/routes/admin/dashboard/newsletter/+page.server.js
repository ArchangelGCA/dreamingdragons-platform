import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID, SUPABASE_SECRET_KEY } from '$env/static/private';
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

    // Get contacts from audience (shape varies by SDK — degrade to []).
    let audience = [];
    try {
        const audienceList = await resend.contacts.list({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });
        audience = audienceList?.data?.data ?? audienceList?.data ?? [];
    } catch (err) {
        console.error(err);
    }

    return {
        ...pageData,
        audience
    }
}

export const actions = {
    getUsersOnPlatform: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        // Use supabase-js and make admin supabase client
        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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

        // Page through auth users in small bounded batches: a single
        // `perPage: 1000000` call blows Vercel's serverless timeout/memory on
        // large communities. Cap the fetch so the admin action always returns.
        const AUTH_PAGE_SIZE = 200;
        const MAX_USERS = 2000;
        const users = [];
        let authPage = 1;
        while (users.length < MAX_USERS) {
            const { data, error: listUsersError } = await adminSupabase.auth.admin.listUsers({
                page: authPage,
                perPage: AUTH_PAGE_SIZE
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
            const batch = data?.users ?? [];
            users.push(...batch);
            if (batch.length < AUTH_PAGE_SIZE) break;
            authPage += 1;
        }
        const capped = users.length >= MAX_USERS;

        // Get profiles in id chunks (Supabase `in()` handles hundreds per call).
        const ids = users.map((u) => u.id);
        const profilesById = new Map();
        for (let i = 0; i < ids.length; i += 200) {
            const chunk = ids.slice(i, i + 200);
            if (chunk.length === 0) break;
            const { data: profiles, error: profilesError } = await adminSupabase
                .from('profiles')
                .select('id, username, can_upload')
                .in('id', chunk);

            if (profilesError) {
                console.error(profilesError);
                return {
                    status: 500,
                    body: {
                        message: "Error fetching profiles"
                    }
                }
            }
            for (const p of (profiles ?? [])) profilesById.set(p.id, p);
        }

        // Add username to users
        users.forEach(u => {
            const profile = profilesById.get(u.id);
            if (profile) {
                u.username = profile.username;
                u.can_upload = profile.can_upload;
            }
        });

        return {
            status: 200,
            body: {
                users,
                capped,
                fetched: users.length
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

        const email = String(formData.email ?? '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
            return {
                status: 400,
                body: {
                    message: "Invalid email address"
                }
            }
        }

        const {error} = await resend.contacts.create({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID,
            unsubscribed: false,
            email,
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
                message: "User " + email +  " added to audience!"
            }
        }
    }
}