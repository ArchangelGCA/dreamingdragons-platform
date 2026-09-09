import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import {error as errorx} from "@sveltejs/kit";
import {createClient} from "@supabase/supabase-js";
import {isAdmin} from "$lib/utils/misc.js";
import {createSuperuserClient, deleteFileRecordBestEffort, extractRecordIdFromFileUrl} from "$lib/server/pocketbase.js";
import {pageRange, totalPagesFor} from "$lib/utils/admin.js";

const PER_PAGE = 12;
// Slim list select: chapter bodies (`chapters.text`) are deliberately excluded —
// they can be megabytes per book. The client lazy-loads one chapter via
// `get_chapter_text` only when an admin expands it.
const LIST_SELECT = 'id,title,description,cover_url,owner_id,created_at,updated_at,profiles:owner_id(id,username),chapters:chapters(id,title,owner_id,created_at)';

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
    if (result !== true) return result;

    const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
    const { page, perPage, from, to } = pageRange(url.searchParams.get('page'), PER_PAGE);

    let query = supabase
        .from('book')
        .select(LIST_SELECT, { count: 'exact' })
        .order('created_at', {ascending: false})
        .range(from, to);

    if (q) query = query.ilike('title', `%${q}%`);

    const { data: content, error: booksError, count } = await query;

    if (booksError) {
        console.error(booksError);
        return errorx(500, "Error fetching content");
    }

    const total = count ?? 0;

    return {
        content: content ?? [],
        page,
        perPage,
        total,
        totalPages: totalPagesFor(total, perPage),
        q,
        title: 'Admin - Content',
        description: 'Admin Content Dashboard of DreamingDragons platform.',
        index: false
    }
}

export const actions = {
    get_chapter_text: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();
        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }
        const formData = await request.formData();
        const chapterId = String(formData.get('chapterId') ?? '').trim();
        if (!chapterId) {
            return { status: 400, body: { message: "Invalid Chapter ID" } };
        }
        const adminSupabase = createAdminSupabase();
        const { data, error } = await adminSupabase
            .from('chapters')
            .select('id,title,text')
            .eq('id', chapterId)
            .single();
        if (error) {
            console.error(error);
            return { status: 500, body: { message: "Error fetching Chapter" } };
        }
        return { status: 200, body: { message: "Chapter loaded", chapter: data } };
    },
    delete_book: async ({request, locals: {supabase, getSession}}) => {
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

        // Delete book cover (best-effort: never fail the delete if the file is gone)
        const cover_id = extractRecordIdFromFileUrl(cover_url);

        if (cover_id) {
            const pb = await createSuperuserClient();
            try {
                await deleteFileRecordBestEffort(pb, 'media', cover_id);
            } finally {
                pb.authStore.clear();
            }
        }

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
        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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
        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
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
