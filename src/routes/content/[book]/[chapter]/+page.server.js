import {error as errorx} from '@sveltejs/kit';

async function loadComments(supabase, session, chapterId) {
    let {data: comments, error: commentsError} = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

    if (commentsError) {
        return Error('Something went wrong, comments loading error...');
    }

    if (session) {
        comments.forEach(comment => {
            comment.is_owner = comment.user_id === session.user.id;
        });
    }

    const commentMap = {};

    for (let comment of comments) {
        comment.children = [];
        commentMap[comment.id] = comment;
    }

    for (let comment of comments) {
        if (comment.parent_comment_id !== null) {
            const parent = commentMap[comment.parent_comment_id];
            if (parent) {
                parent.children.push(comment);
            }
        }
    }

    comments = comments.filter(comment => comment.parent_comment_id === null);

    return comments;
}

export const load = async ({ params, locals: { supabase, ip_address, getSession } }) => {
    const {session} = await getSession();
    let isOwner = false;

    if (!params.book || !params.chapter) {
        return errorx(400, "Missing required fields");
    }

    const bookId = params.book;
    const chapterId = params.chapter;


    const {data: chapterContent, error} = await supabase
            .from('chapter_content_views')
            .select('*, chapter_tags(tags(id, name))')
            .eq('book_id', bookId)
            .eq('chapter_id', chapterId);

    if (error) {
        return errorx(500, 'Something went wrong, perhaps the IDs may be invalid...');
    }

    if (!chapterContent || chapterContent.length === 0) {
        return errorx(404, "Chapter and/or Book not found");
    }

    const tags = chapterContent[0].chapter_tags.map(chapter_tag => chapter_tag.tags);
    const user_id = session ? session.user.id : null;

    if (!session) {
        isOwner = false;
    } else {
        isOwner = chapterContent[0].owner_id === session.user.id;
    }

    const comments = await loadComments(supabase, session, chapterId);

    if (comments instanceof Error) {
        return errorx(500, comments.message);
    }

    // add isOwner to chapterContent
    chapterContent[0].is_owner = isOwner;

    // return
    return { chapterContent, tags, comments, ip_address, user_id };
}

export const actions = {
    like: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

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
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to add a comment"
                }
            }
        }

        const chapterId = formData.chapterId;
        const parentCommentId = formData.parentCommentId;
        const userId = session.user.id;
        const content = formData.content;

        if (chapterId === null || content === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        if (content.length > 1000) {
            return {
                status: 400,
                body: {
                    message: "Comment is too long"
                }
            }
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([{ chapter_id: chapterId, user_id: userId, parent_comment_id: parentCommentId, content: content }])
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
    },
    delete_chapter: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to delete a chapter"
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

        const { error: deleteError } = await supabase
            .from('chapters')
            .delete()
            .eq('id', chapterId)
            .eq('owner_id', userId);

        if (deleteError) {
            console.error(deleteError);
            return {
                status: 500,
                body: {
                    message: deleteError.message
                }
            }
        }

        return {
            status: 200,
            body: {
                message: "Chapter [" + chapterId + "] deleted successfully"
            }
        }
    },
    report: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to report a book"
                }
            }
        }

        const report_type = "chapter";
        const user_id = session.user.id;
        let { report_description, chapter_id, book_id } = formData;

        if (chapter_id === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: existingReports, error: existingReportsError } = await supabase
            .from('reports')
            .select('*')
            .eq('report_type', report_type)
            .eq('user_id', user_id)
            .eq('chapter_id', chapter_id);

        if (existingReportsError) {
            console.error(existingReportsError);
            return {
                status: 500,
                body: {
                    message: existingReportsError.message
                }
            }
        }

        if (existingReports.length > 0) {
            return {
                status: 400,
                body: {
                    message: "You have already reported this Chapter!"
                }
            }
        }

        if (report_description === null) report_description = '';

        // Description limit
        if (report_description.length > 1000) {
            return {
                status: 400,
                body: {
                    message: "Report description is too long"
                }
            }
        }

        const { error } = await supabase
            .from('reports')
            .insert({
                report_type,
                user_id,
                report_description,
                chapter_id,
                book_id
            });

        if (error) {
            console.error(error);
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
                message: "Content reported successfully"
            }
        }
    },
}