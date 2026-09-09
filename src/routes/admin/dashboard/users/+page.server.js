import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import {error as errorx} from '@sveltejs/kit';
import {isAdmin} from "$lib/utils/misc.js";
import {createSuperuserClient, deleteFileRecordBestEffort, extractRecordIdFromFileUrl} from "$lib/server/pocketbase.js";
import {pageRange, totalPagesFor} from "$lib/utils/admin.js";

const PER_PAGE = 20;
const PROFILE_COLUMNS = 'id,username,full_name,website,can_upload,avatar_url,cover_url,created_at,updated_at';

function createAdminSupabase() {
    return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export const load = async ( { url, locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    const result = await isAdmin(session, supabase);
    if (result !== true) {
        return result;
    }

    const q = (url.searchParams.get('q') ?? '').trim().slice(0, 64);
    const status = url.searchParams.get('status') ?? 'all';
    const { page, perPage, from, to } = pageRange(url.searchParams.get('page'), PER_PAGE);

    const adminSupabase = createAdminSupabase();

    // `warned` needs the id set first: recipients of warning-type notifications.
    let warnedIds = null;
    if (status === 'warned') {
        const { data: warnedRows, error: warnedError } = await supabase
            .from('notifications')
            .select('recipient_id')
            .ilike('type', '%warning%')
            .limit(1000);
        if (warnedError) {
            console.error(warnedError);
            return errorx(500, "Error fetching users");
        }
        warnedIds = [...new Set((warnedRows ?? []).map((r) => r.recipient_id).filter(Boolean))];
        if (warnedIds.length === 0) {
            return {
                profiles: [],
                page: 1,
                perPage,
                total: 0,
                totalPages: 1,
                q,
                status,
                title: 'Admin - Users',
                description: 'Admin Users Dashboard of DreamingDragons platform.',
                index: false,
            };
        }
    }

    let query = supabase
        .from('profiles')
        .select(PROFILE_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (q) query = query.ilike('username', `%${q}%`);
    if (status === 'blocked') query = query.eq('can_upload', false);
    else if (status === 'active') query = query.eq('can_upload', true);
    else if (status === 'warned' && warnedIds) query = query.in('id', warnedIds.slice(0, 200));

    const { data: profiles, error, count } = await query;

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching users");
    }

    const total = count ?? 0;
    const totalPages = totalPagesFor(total, perPage);
    const safePage = Math.min(page, totalPages);
    const list = profiles ?? [];

    // One warnings query for the whole page (instead of a join per profile).
    let warningsByUser = new Map();
    if (list.length > 0) {
        const ids = list.map((p) => p.id);
        const { data: warnings, error: warningsError } = await supabase
            .from('notifications')
            .select('id,recipient_id,content,created_at')
            .in('recipient_id', ids)
            .ilike('type', '%warning%')
            .order('created_at', { ascending: false })
            .limit(200);
        if (warningsError) {
            console.error(warningsError);
        } else {
            for (const w of (warnings ?? [])) {
                if (!warningsByUser.has(w.recipient_id)) warningsByUser.set(w.recipient_id, []);
                warningsByUser.get(w.recipient_id).push(w);
            }
        }
    }

    // Emails live in auth, not profiles — fetch per visible user (bounded to
    // one page) instead of listing up to a million auth users at once.
    const emailResults = await Promise.allSettled(
        list.map((p) => adminSupabase.auth.admin.getUserById(p.id))
    );
    list.forEach((profile, i) => {
        const settled = emailResults[i];
        profile.email = settled?.status === 'fulfilled'
            ? (settled.value?.data?.user?.email ?? null)
            : null;
        profile.notifications = warningsByUser.get(profile.id) ?? [];
    });

    return {
        profiles: list,
        page: safePage,
        perPage,
        total,
        totalPages,
        q,
        status,
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
        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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
            const old_url_id = extractRecordIdFromFileUrl(userAvatar.avatar_url);
            if (old_url_id) {
                const pb = await createSuperuserClient();
                try {
                    await deleteFileRecordBestEffort(pb, 'profiles_media', old_url_id);
                } finally {
                    pb.authStore.clear();
                }
            }
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

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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
            const old_url_id = extractRecordIdFromFileUrl(userCover.cover_url);
            if (old_url_id) {
                const pb = await createSuperuserClient();
                try {
                    await deleteFileRecordBestEffort(pb, 'profiles_media', old_url_id);
                } finally {
                    pb.authStore.clear();
                }
            }
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
