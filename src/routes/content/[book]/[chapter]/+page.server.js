import {error as errorx, redirect} from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();
    let isOwner = false;

    if (!params.book || !params.chapter) {
        return {
            status: 400,
            body: {
                message: "Missing required fields"
            }
        }
    }

    const bookId = params.book;
    const chapterId = params.chapter;


    const {data: chapterContent, error} = await supabase
            .from('chapter_content')
            .select('*, chapter_tags(tags(id, name))')
            .eq('book_id', bookId)
            .eq('chapter_id', chapterId);

    if (error) {
        errorx(500, 'Something went wrong, perhaps the IDs may be invalid...');
        /*console.error(error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }*/
    }

    if (!chapterContent || chapterContent.length === 0) {
        errorx(404, "Chapter and/or Book not found");
        return;
    }

    const tags = chapterContent[0].chapter_tags.map(chapter_tag => chapter_tag.tags);

    if (!session) {
        isOwner = false;
    } else {
        isOwner = chapterContent[0].owner_id === session.user.id;
    }

    // add isOwner to chapterContent
    chapterContent[0].is_owner = isOwner;

    // return
    return { chapterContent, tags };
}

export const actions = {
    like: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to like content"
                }
            }
        }

        const chapterId = formData.chapterId;
        const userId = session.user.id;

        if (chapterId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: likes, error } = await supabase
            .from('chapter_likes')
            .select('*')
            .eq('chapter_id', chapterId)
            .eq('user_id', userId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        const action = likes.length === 0 ? 'added' : 'removed';

        if (likes.length === 0) {
            const { error } = await supabase
                .from('chapter_likes')
                .insert([{ chapter_id: chapterId, user_id: userId }]);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        } else {
            const { error } = await supabase
                .from('chapter_likes')
                .delete()
                .eq('chapter_id', chapterId)
                .eq('user_id', userId);

            if (error) {
                console.error(error);
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
                message: "Like " + action + " successfully"
            }
        }
    }
}