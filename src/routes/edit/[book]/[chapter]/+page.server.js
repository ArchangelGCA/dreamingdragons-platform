import {error as errorx, redirect} from "@sveltejs/kit";
import {fetchProfiles} from "$lib/utils/gcafetchers.js";

export const load = async ({ params, locals: { supabase, getSession} }) => {
    const {session} = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    if (!params.book || !params.chapter){
        errorx(400, "Missing required fields");
        return;
    }

    const sessionUserId = session.user.id;
    const bookId = params.book;
    const chapterId = params.chapter;

    const {data: chapterSearch, error} = await supabase
        .from('chapters')
        .select('*, chapter_tags(tags(id, name))')
        .eq('id', chapterId)
        .eq('book_id', bookId)
        .eq('owner_id', sessionUserId);

    if (error){
        errorx(500, 'Something went wrong, perhaps the IDs may be invalid or you are\'t the owner of this Chapter...');
        return;
    }

    if (!chapterSearch || chapterSearch.length === 0) {
        errorx(404, "Chapter not found OR you are not the owner of this Chapter...");
        return;
    }

    const chapter = chapterSearch[0];

    const {data: bookSearch, error: bookError} = await supabase
        .from('book')
        .select('id, owner_id, title, cover_url, created_at')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: true });

    if (bookError) {
        return {
            status: 500,
            body: {
                message: bookError.message
            }
        }
    }

    return {
        chapter,
        books: bookSearch,
        title: 'DreamingDragons - Edit Chapter',
        description: 'Edit a chapter.',
        index: false
    };
}

export const actions = {
    tagsuggestions: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "Unauthorized"
                }
            }
        }

        const formData = Object.fromEntries(await request.formData());
        const tag = formData.tag;

        if (tag === null || tag === undefined || tag === "") {
            return {
                status: 200,
                body: []
            }
        }

        const {data, error} = await supabase.rpc('get_similar_tags', {
            partial_tag: tag
        }).limit(10);

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
            body: data
        }
    },
    editchapter: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const chapterId = formData.chapterId;
        const bookId = formData.bookId;

        if (!chapterId || !bookId) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: chapterSearch, error} = await supabase
            .from('chapters')
            .select('id')
            .eq('id', chapterId)
            .eq('book_id', bookId)
            .eq('owner_id', session.user.id);

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (chapterSearch.length === 0) {
            return {
                status: 500,
                body: {
                    message: "You are not the owner of this book"
                }
            }
        }

        const {title, content, book, tags } = formData;

        let updateData = {};

        if (title !== null) updateData.title = title;
        if (content !== null) updateData.text = content;
        if (book !== null) updateData.book_id = book;

        const { error: error2 } = await supabase
            .from('chapters')
            .update(updateData)
            .eq('id', chapterId)
            .eq('owner_id', session.user.id);

        if (error2) {
            return {
                status: 500,
                body: {
                    message: error2.message
                }
            }
        }

        // Delete all old tags
        await supabase
            .from('chapter_tags')
            .delete()
            .eq('chapter_id', chapterId);

        // Insert new tags
        if (tags !== null && tags !== undefined && tags !== "") {

            const tag_names = tags.split(',');

            tag_names.forEach((tag, index) => {
                tag_names[index] = tag.trim();
            });

            const { error } = await supabase
                .rpc('add_tags_to_chapter', {
                    chapter_id: chapterId,
                    tag_names
                });

            if (error) {
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Chapter edited successfully"
            }
        }
    },
    getProfiles: async ({ request, url, locals: { supabase, getSession } }) => {
        const { session } = await getSession();
        if (!session) {
            return {
                status: 401,
                body: {
                    message: "Unauthorized"
                }
            }
        }
        const origin = url.origin;
        return await fetchProfiles({ supabase, origin });
    }
}