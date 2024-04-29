import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_SECRET_KEY } from '$env/static/private';
import { PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL_IMG_API, PUBLIC_POCKETBASE_URL } from "$env/static/public";
import {error as errorx} from "@sveltejs/kit";
import {createClient} from "@supabase/supabase-js";
import PocketBase from "pocketbase";

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
    const {session} = await getSession();

    const result = await isAdmin(session, supabase);
    if (result !== true) return result;

    // Get all books and chapters
    const {data: content, error: booksError} = await supabase
        .from('book')
        .select('*, profiles:owner_id(*), chapters:chapters(*)')
        .order('created_at', {ascending: false});

    if (booksError) {
        console.error(booksError);
        return errorx(500, "Error fetching content");
    }

    return { content }
}

export const actions = {
    delete_book: async ({request, locals: {supabase, getSession}}) => {
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

        const bookId = formData.bookId;
        const cover_url = formData.bookCover;
        const sendWarning = formData.sendWarning;
        const warningMessage = formData.warningMessage;
        const ownerId = formData.ownerId;
        if (!bookId || bookId === "" || !cover_url || cover_url === "") {
            return {
                status: 400,
                body: { message: "Invalid Content ID" }
            }
        }

        // Check if book exists
        const { data: bookData, error: bookError } = await adminSupabase
            .from('book')
            .select('id')
            .eq('id', bookId);

        if (bookError) {
            console.error(bookError);
            return {
                status: 500,
                body: { message: "Error fetching Content" }
            }
        }

        if (!bookData || bookData.length === 0) {
            return {
                status: 404,
                body: { message: "Content not found" }
            }
        }

        // Delete book
        const { error } = await adminSupabase
            .from('book')
            .delete()
            .eq('id', bookId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: { message: "Error deleting Content" }
            }
        }

        // Delete book cover
        const cover_url_path = cover_url.substring(PUBLIC_POCKETBASE_URL_IMG_API.length);
        const cover_id = cover_url_path.split('/')[1];

        const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
        await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);
        await pb.collection('media').delete(cover_id);

        if (sendWarning === 'true') {
            if (warningMessage === "" || !warningMessage) {
                return {
                    status: 400,
                    body: { message: "Warning message required" }
                }
            }

            // Add to notifications with type "warning" using admin supabase client
            const { error: notificationError } = await adminSupabase
                .from('notifications')
                .insert({
                    type: "warning",
                    recipient_id: ownerId,
                    source_user_id: session.user.id,
                    content: warningMessage
                    });

            if (notificationError) {
                console.error(notificationError);
                return {
                    status: 500,
                    body: { message: "Error sending warning" }
                }
            }
        }

        return {
            status: 200,
            body: { message: "Content deleted" }
        }
    },
    delete_chapter: async ({request, locals: {supabase, getSession}}) => {
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

        const chapterId = formData.chapterId;
        const sendWarning = formData.sendWarning;
        const warningMessage = formData.warningMessage;
        const ownerId = formData.ownerId;
        if (!chapterId || chapterId === "") {
            return {
                status: 400,
                body: {message: "Invalid Chapter ID"}
            }
        }

        // Check if chapter exists
        const {data: chapterData, error: chapterError} = await adminSupabase
            .from('chapters')
            .select('id')
            .eq('id', chapterId);

        if (chapterError) {
            console.error(chapterError);
            return {
                status: 500,
                body: {message: "Error fetching Chapter"}
            }
        }

        if (!chapterData || chapterData.length === 0) {
            return {
                status: 404,
                body: {message: "Chapter not found"}
            }
        }

        // Delete chapter
        const {error} = await adminSupabase
            .from('chapters')
            .delete()
            .eq('id', chapterId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {message: "Error deleting Chapter"}
            }
        }

        if (sendWarning === 'true') {
            if (warningMessage === '' || !warningMessage) {
                return {
                    status: 400,
                    body: {message: "Warning message required"}
                }
            }

            const {error: notificationError} = await adminSupabase
                .from('notifications')
                .insert({
                    type: "warning",
                    recipient_id: ownerId,
                    source_user_id: session.user.id,
                    content: warningMessage
                });

            if (notificationError) {
                console.error(notificationError);
                return {
                    status: 500,
                    body: {message: "Error sending warning"}
                }
            }
        }

        return {
            status: 200,
            body: {message: "Chapter deleted"}
        }
    },
    edit_book: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

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

        const bookId = formData.bookId;

        if (!bookId) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: bookSearch, error} = await adminSupabase
            .from('book')
            .select('id, cover_url')
            .eq('id', bookId);

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (bookSearch.length === 0) {
            return {
                status: 404,
                body: {
                    message: "Content not found"
                }
            }
        }

        const { title, description, coverUrl } = formData;

        const { error: updateError } = await adminSupabase
            .from('book')
            .update({
                title,
                description,
                cover_url: coverUrl,
                updated_at: new Date()
            })
            .eq('id', bookId);

        if (updateError) {
            return {
                status: 500,
                body: {
                    message: updateError.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Content updated successfully"
            }
        }
    }
}