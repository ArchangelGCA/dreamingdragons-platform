import {error as errorx, redirect} from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();
    let isOwner = false;

    if (!params.book) {
        return {
            status: 400,
            body: {
                message: "Missing required fields (Book)"
            }
        }
    }

    if (!params.chapter) {
        return {
            status: 400,
            body: {
                message: "Missing required fields (Chapter)"
            }
        }
    }

    const bookId = params.book;
    const chapterId = params.chapter;

    // Get chapter_content where book_id = bookId and chapter_id = chapterId
    const { data: chapterContent, error } = await supabase
        .from('chapter_content')
        .select('*')
        .eq('book_id', bookId)
        .eq('chapter_id', chapterId);

    if (error) {
        console.error(error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    if (!chapterContent || chapterContent.length === 0) {
        errorx(404, "Chapter and/or Book not found");
        return;
    }

    if (!session) {
        isOwner = false;
    } else {
        isOwner = chapterContent[0].owner_id === session.user.id;
    }

    // add isOwner to chapterContent
    chapterContent[0].is_owner = isOwner;

    // return
    return { chapterContent };
}