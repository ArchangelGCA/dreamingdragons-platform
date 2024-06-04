import {error as errorx} from '@sveltejs/kit';
import { PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW } from '$env/static/private';
import { PUBLIC_POCKETBASE_URL_IMG_API, PUBLIC_POCKETBASE_URL } from "$env/static/public";
import PocketBase from "pocketbase";
async function loadComments(supabase, session, bookId) {
    let {data: comments, error: commentsError} = await supabase
        .from('comments')
        .select('*, profiles(username, avatar_url)')
        .eq('book_id', bookId)
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

    if (!params.book) {
        return errorx(400, 'Missing required fields');
    }

    const bookId = params.book;

    const { data: bookContent, error} = await supabase
        .from('secure_book_content_views')
        .select('*, book_tags(tags(id, name))')
        .eq('book_id', bookId);

    if (error) {
        console.error(error);
        return errorx(500, 'Something went wrong, perhaps the ID may be invalid...');
    }

    if (!bookContent || bookContent.length === 0) {
        return errorx(404, "Content not found or removed by the original author.");
    }

    if (bookContent && bookContent.length > 0) {
        bookContent.forEach(book => {
            if (book.chapters) {
                book.chapters.sort((a, b) => a.chapter_id - b.chapter_id);
            }
        });
    }

    const tags = bookContent[0].book_tags.map(book_tag => book_tag.tags);
    const user_id = session ? session.user.id : null;

    if (!session) {
        isOwner = false;
    } else {
        isOwner = bookContent[0].owner_id === session.user.id;
    }

    const comments = await loadComments(supabase, session, bookId);

    bookContent[0].is_owner = isOwner;

    return { bookContent: bookContent[0], tags, comments, ip_address, user_id };
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

        const bookId = formData.bookId;
        const userId = session.user.id;
        const parentCommentId = formData.parentCommentId;
        const content = formData.content;

        if (bookId === null || content === null) {
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
            .insert([{ book_id: bookId, user_id: userId, parent_comment_id: parentCommentId, content: content }]) // Modified line
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
    delete_book: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to delete your book"
                }
            }
        }

        const bookId = formData.bookId;
        const userId = session.user.id;

        if (bookId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        // Select book by ID and owner ID
        const { data: book, error: bookError } = await supabase
            .from('book')
            .select('*')
            .eq('id', bookId)
            .eq('owner_id', userId);

        if (bookError) {
            console.error(bookError);
            return {
                status: 500,
                body: {
                    message: bookError.message
                }
            }
        }

        if (!book || book.length === 0) {
            return {
                status: 404,
                body: {
                    message: "Book not found"
                }
            }
        }

        const cover_url = book[0].cover_url;
        const cover_url_path = cover_url.substring(PUBLIC_POCKETBASE_URL_IMG_API.length);
        const cover_id = cover_url_path.split('/')[1];

        const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
        await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);
        await pb.collection('media').delete(cover_id);

        const { error } = await supabase
            .from('book')
            .delete()
            .eq('id', bookId)
            .eq('owner_id', userId);

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
                message: "Book [ " + bookId + " ] " + book[0].title + " deleted successfully"
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

        const report_type = "book";
        const user_id = session.user.id;
        let { report_description, book_id } = formData;

        if (book_id === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const { data: reports, error: errorReportFetch } = await supabase
            .from('reports')
            .select('*')
            .eq('report_type', report_type)
            .eq('user_id', user_id)
            .eq('book_id', book_id);

        if (errorReportFetch) {
            console.error(errorReportFetch);
            return {
                status: 500,
                body: {
                    message: errorReportFetch.message
                }
            }
        }

        if (reports.length > 0) {
            return {
                status: 400,
                body: {
                    message: "You have already reported this Content!"
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