import {error as errorx, redirect} from '@sveltejs/kit';
import {ORIGIN} from '$env/static/private';
import { extractId, isValidUrlParam, getCanonicalUrl } from '$lib/utils/slugs.js';

export const load = async ({ params, url, locals: { supabase, getSession, image_proxy } }) => {
    const { session } = await getSession();
    let isOwner = false;

    if (!params.book || !params.chapter) {
        throw errorx(400, "Missing required fields");
    }

    // Validate URL parameter formats
    if (!isValidUrlParam(params.book) || !isValidUrlParam(params.chapter)) {
        throw errorx(400, 'Invalid identifier format');
    }

    // Extract the actual IDs from the parameters (handles both legacy and new format)
    const bookId = extractId(params.book);
    const chapterId = extractId(params.chapter);

    // FIX for some URLs that have double /content/content and need redirect.
    if ((params.book === 'content' || params.book === 'profile')) {
        throw redirect(302, `/${params.book}/${params.chapter}`);
    }

    const { data: chapterContent, error } = await supabase
        .from('chapters')
        .select('*, profiles(id, username, avatar_url), book(title, cover_url, owner_id), views(count), chapter_tags(tags(id, name)), chapter_likes(user_id, created_at, profiles(username, avatar_url)), comments(*, profiles(username, avatar_url))')
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

    if (user_id) is_liked = (chapterContent[0].chapter_likes.length > 0 && chapterContent[0].chapter_likes.find(like => like.user_id === user_id));

    // Sorts chapter_likes
    if (chapterContent[0].chapter_likes.length > 0) chapterContent[0].chapter_likes = chapterContent[0].chapter_likes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

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

    // Check if we need to redirect to canonical URL (SEO-friendly format)
    const canonicalUrl = getCanonicalUrl(chapterContent[0].book, chapterContent[0]);
    const currentPath = url.pathname;
    
    // Only redirect if the current URL doesn't match the canonical format
    // and it's not already in the canonical format (contains hyphen before ID)
    if (currentPath !== canonicalUrl && !currentPath.match(/-\d+$/)) {
        throw redirect(301, canonicalUrl);
    }

    // return
    return {
        chapterContent: chapterContent[0],
        user_id,
        // For SEO $page.data on +layout etc...
        title: chapterContent[0].book.title + " - " + chapterContent[0].title + " by " + chapterContent[0].profiles.username,
        description: chapterContent[0].title + " by " + chapterContent[0].profiles.username + " - " + chapterContent[0].book.title + " on DreamingDragons.",
        imageURL: chapterContent[0].book.cover_url.startsWith('http') ? 
            chapterContent[0].book.cover_url + "?width=1024" : 
            (image_proxy ? image_proxy + chapterContent[0].book.cover_url + "?width=1024" : ORIGIN + chapterContent[0].book.cover_url + "?width=1024"),
        author: chapterContent[0].profiles.username,
        name: chapterContent[0].profiles.username,
        type: "article",
        siteName: "DreamingDragons",
        oembed: true
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