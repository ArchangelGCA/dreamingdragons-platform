import {error as errorx} from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();
    let isOwner = false;

    if (!params.book) {
        return {
            status: 400,
            body: {
                message: "Missing required fields"
            }
        }
    }

    const bookId = params.book;

    // Get book_content where book_id = bookId
    const { data: bookContent, error } = await supabase
        .from('book_content')
        .select('*')
        .eq('book_id', bookId);

    if (error) {
        console.error(error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    if (!bookContent || bookContent.length === 0) {
        errorx(404, "Book not found");
        return;
    }

    if (!session) {
        isOwner = false;
    } else {
        isOwner = bookContent[0].owner_id === session.user.id;
    }

    // add isOwner to bookContent
    bookContent[0].isOwner = isOwner;

    // return
    return { bookContent };
}