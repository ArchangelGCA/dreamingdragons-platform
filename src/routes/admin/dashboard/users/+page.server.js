import { PUBLIC_SUPABASE_URL, PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_SECRET_KEY, PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import {error as errorx} from '@sveltejs/kit';
import PocketBase from "pocketbase";
import {isAdmin} from "$lib/utils/misc.js";

export const load = async ( { locals: { supabase, getSession } }) => {
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

    const {data: profiles, error} = await supabase
        .from('profiles')
        .select('*, notifications!notifications_recipient_id_fkey(*)')
        .order('created_at', {ascending: false});

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching users");
    }

    const { data: { users }, error: listUsersError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: maxUsers
    });

    if (listUsersError) {
        console.error(listUsersError);
        return errorx(500, "Error fetching users");
    }

    profiles.forEach(profile => {
        const user = users.find(user => user.id === profile.id);
        if (user) {
            profile.email = user.email;
        }
        profile.notifications = profile.notifications.filter(notification => notification.type.includes("warning"));
        profile.notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });

    return {
        profiles,
        title: 'Admin - Users',
        description: 'Admin Users Dashboard of DreamingDragons platform.',
        index: false,
    }
}

export const actions = {
    delete_warning: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const formData = Object.fromEntries(await request.formData());

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

        const warningId = formData.warningId;
        if (!warningId || warningId === "") {
            return {
                status: 400,
                body: {message: "Invalid Warning ID"}
            }
        }

        // Check if warning exists
        const {data: warningData, error: warningError} = await adminSupabase
            .from('notifications')
            .select('id')
            .eq('id', warningId);

        if (warningError) {
            console.error(warningError);
            return {
                status: 500,
                body: {message: "Error fetching Warning"}
            }
        }

        if (!warningData || warningData.length === 0) {
            return {
                status: 404,
                body: {message: "Warning not found"}
            }
        }

        // Delete warning
        const {error} = await adminSupabase
            .from('notifications')
            .delete()
            .eq('id', warningId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {message: "Error deleting Warning"}
            }
        }

        return {
            status: 200,
            body: {message: "Warning deleted"}
        }
    },
    send_warning: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
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

        const { recipientId, warningMessage } = formData;

        if (!recipientId || !warningMessage) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data, error } = await adminSupabase
            .from('notifications')
            .insert({
                type: "warning",
                recipient_id: recipientId,
                source_user_id: session.user.id,
                content: warningMessage
            })
            .select();

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Warning sent successfully",
                notification: data[0]
            }
        }
    },
    toggle_upload: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const formData = Object.fromEntries(await request.formData());

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

        const { userId, uploadStatus } = formData;

        if (!userId || uploadStatus === null || uploadStatus === undefined) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: user, error: userError } = await adminSupabase
            .from('profiles')
            .update({
                can_upload: uploadStatus
            })
            .eq('id', userId)
            .single();

        if (userError) {
            return {
                status: 500,
                body: {
                    message: userError.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Upload status updated",
                user
            }
        }
    },
    reset_avatar: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const formData = Object.fromEntries(await request.formData());

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

        const { userId } = formData;

        if (!userId) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: userAvatar, error: userAvatarError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (userAvatarError) {
            return {
                status: 500,
                body: {
                    message: userAvatarError.message
                }
            }
        }

        if (userAvatar.avatar_url) {
            const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
            await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

            const old_url_parts = userAvatar.avatar_url.split('/');
            const old_url_id = old_url_parts[old_url_parts.length - 2];
            await pb.collection('profiles_media').delete(old_url_id);

            pb.authStore.clear();
        }

        const { data: user, error: userError } = await adminSupabase
            .from('profiles')
            .update({
                avatar_url: null
            })
            .eq('id', userId)
            .single();

        if (userError) {
            return {
                status: 500,
                body: {
                    message: userError.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Avatar reset successfully"
            }
        }
    },
    reset_cover: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const formData = Object.fromEntries(await request.formData());

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

        const {userId} = formData;

        if (!userId) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: userCover, error: userCoverError} = await supabase
            .from('profiles')
            .select('cover_url')
            .eq('id', userId)
            .single();

        if (userCoverError) {
            return {
                status: 500,
                body: {
                    message: userCoverError.message
                }
            }
        }

        if (userCover.cover_url) {
            const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
            await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

            const old_url_parts = userCover.cover_url.split('/');
            const old_url_id = old_url_parts[old_url_parts.length - 2];
            await pb.collection('profiles_media').delete(old_url_id);

            pb.authStore.clear();
        }

        const {data: user, error: userError} = await adminSupabase
            .from('profiles')
            .update({
                cover_url: null
            })
            .eq('id', userId)
            .single();

        if (userError) {
            return {
                status: 500,
                body: {
                    message: userError.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Cover reset successfully"
            }
        }
    }
}

