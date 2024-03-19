import {error as errorx, redirect} from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase, ip_address, getSession } }) => {
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

    const { data: bookContent, error} = await supabase
        .from('book_content_views')
        .select('*, book_tags(tags(id, name))')
        .eq('book_id', bookId);

    if (error) {
        errorx(500, 'Something went wrong, perhaps the ID may be invalid...');
    }

    if (!bookContent || bookContent.length === 0) {
        errorx(404, "Book not found");
        return;
    }

    const {data: comments, error: commentsError} = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

    if (commentsError) {
        errorx(500, 'Something went wrong, comments loading error...');
    }

    const tags = bookContent[0].book_tags.map(book_tag => book_tag.tags);
    const user_id = session ? session.user.id : null;

    if (!session) {
        isOwner = false;
    } else {
        isOwner = bookContent[0].owner_id === session.user.id;
        comments.forEach(comment => {
            comment.is_owner = comment.user_id === session.user.id;
        });
    }

    bookContent[0].is_owner = isOwner;

    return { bookContent, tags, comments, ip_address, user_id };
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

        const contentId = formData.contentId;
        const userId = session.user.id;

        if (contentId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: likes, error } = await supabase
            .from('book_likes')
            .select('*')
            .eq('book_id', contentId)
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
                .from('book_likes')
                .insert([{ book_id: contentId, user_id: userId }]);

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
                .from('book_likes')
                .delete()
                .eq('book_id', contentId)
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
    },
    like_chapter: async ({ request, locals: { supabase, getSession } }) => {
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
    },
    add_comment: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to add a comment"
                }
            }
        }

        const bookId = formData.bookId;
        const userId = session.user.id;
        const content = formData.content;

        if (bookId === null || content === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([{ book_id: bookId, user_id: userId, content: content }])
            .select('*, profiles(username, avatar_url)');

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        data[0].is_owner = true;

        return {
            status: 200,
            body: {
                message: "Comment added successfully",
                comment: data[0]
            }
        }
    }
}