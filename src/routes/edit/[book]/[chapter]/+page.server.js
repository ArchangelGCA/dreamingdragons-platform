import {error as errorx, redirect} from "@sveltejs/kit";

export const load = async ({ params, locals: { supabase, getSession} }) => {
    const session = await getSession();

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
    return { chapter };
}