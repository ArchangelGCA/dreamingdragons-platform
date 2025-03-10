import {error as errorx, redirect} from '@sveltejs/kit';

async function loadChapters(supabase, bookId) {
    const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, book_id, owner_id, number_ordinal, title')
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

    if (chaptersError) {
        throw new Error('Something went wrong, chapters loading error...');
    }

    return chapters;
}

async function loadComments(supabase, session, chapterId) {
    let { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

    if (commentsError) {
        throw new Error('Something went wrong, comments loading error...');
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

export const load = async ({ params, locals: { supabase, getSession, image_proxy } }) => {
    const { session } = await getSession();
    let isOwner = false;

    if (!params.book || !params.chapter) {
        throw errorx(400, "Missing required fields");
    }

    const bookId = params.book;
    const chapterId = params.chapter;

    // FIX for some URLs that have double /content/content and need redirect.
    if ((bookId === 'content' || bookId === 'profile')) {
        throw redirect(302, `/${bookId}/${chapterId}`);
    }

    /*const [
        chapterContentResult,
        //commentsPromise,
        //chaptersPromise
    ] = await Promise.all([
        supabase
            .from('secure_chapter_content_with_comments')
            .select('*, chapter_tags(tags(id, name)), chapter_likes!chapter_id(user_id)')
            .eq('book_id', bookId)
            .eq('chapter_id', chapterId),
        //loadComments(supabase, session, chapterId),
        //loadChapters(supabase, bookId)
    ]);*/

    /*const { data: chapterContent, error } = await supabase
        .from('secure_chapter_content_with_comments')
        .select('*, chapter_tags(tags(id, name)), chapter_likes!chapter_id(user_id)')
        .eq('book_id', bookId)
        .eq('chapter_id', chapterId);*/

    const { data: chapterContent, error } = await supabase
        .from('chapters')
        .select('*, profiles(id, username, avatar_url), book(title, cover_url, owner_id), views(count), chapter_tags(tags(id, name)), chapter_likes(user_id), comments(*, profiles(username, avatar_url))')
        .eq('id', chapterId)
        .eq('book_id', bookId);

    if (error) {
        console.error(error);
        throw errorx(500, 'Something went wrong, perhaps the IDs may be invalid...');
    }

    // Get related chapters (same book)
    const { data: relatedChapters, error: relatedChaptersError } = await supabase
        .from('chapters')
        .select('id, book_id, owner_id, number_ordinal, title, created_at')
        .eq('book_id', bookId)
        .order('created_at' , { ascending: true });

    if (relatedChaptersError) {
        console.error(relatedChaptersError);
        throw errorx(500, 'Something went wrong, perhaps the IDs may be invalid...');
    }

    if (!chapterContent || chapterContent.length === 0) {
        throw errorx(404, "Chapter and/or Content not found, or the owner has removed it...");
    }

    chapterContent[0].related_chapters = relatedChapters;

    const tags = chapterContent[0].chapter_tags.map(chapter_tag => chapter_tag.tags);
    const user_id = session ? session.user.id : null;
    let is_liked = false;
    let comments = (chapterContent[0].comments.length > 0 && chapterContent[0].comments[0].id !== null) ? chapterContent[0].comments : [];
    let chapters = (chapterContent[0].related_chapters.length > 0 && chapterContent[0].related_chapters[0].id !== null) ? chapterContent[0].related_chapters : [];

    if (!session) {
        isOwner = false;
    } else {
        isOwner = chapterContent[0].owner_id === session.user.id;
        comments.forEach(comment => {
            comment.is_owner = comment.user_id === session.user.id;
        });
    }

    // Handle comments
    comments = comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    comments = comments.filter(comment => comment.id !== null);

    // Handle chapters
    chapters = chapters.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    chapterContent[0].comments = comments;

    if (user_id) {
        is_liked = (chapterContent[0].chapter_likes.length > 0 && chapterContent[0].chapter_likes.find(like => like.user_id === user_id));
    }

    // Get previous and next chapter ids.
    const sortedChapters = chapters.sort((a, b) => a.number_ordinal - b.number_ordinal);
    const currentChapterIndex = sortedChapters.findIndex(chapter => chapter.id === chapterContent[0].id);
    chapterContent[0].previousChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1].id : null;
    chapterContent[0].nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1].id : null;

    // Add content to chapterContent
    chapterContent[0].is_owner = isOwner;
    chapterContent[0].chapters = chapters;
    chapterContent[0].tags = tags;
    chapterContent[0].is_liked = is_liked;
    chapterContent[0].chapter_tags = [];

    // return
    return {
        chapterContent: chapterContent[0],
        user_id,
        // For SEO $page.data on +layout etc...
        title: chapterContent[0].book.title + " - " + chapterContent[0].title + " by " + chapterContent[0].profiles.username,
        description: chapterContent[0].title + " by " + chapterContent[0].profiles.username + " - " + chapterContent[0].book.title + " on DreamingDragons.",
        imageURL: (image_proxy && chapterContent[0].book.cover_url.startsWith(image_proxy)) ? chapterContent[0].book.cover_url : image_proxy + chapterContent[0].book.cover_url + "?width=1024",
        author: chapterContent[0].profiles.username,
        name: chapterContent[0].profiles.username,
    };
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