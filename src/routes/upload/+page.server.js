import {redirect} from '@sveltejs/kit'
import PocketBase from 'pocketbase';
import {PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW} from '$env/static/private';
import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES, PUBLIC_COVER_MAX_RESIZE, PUBLIC_POCKETBASE_URL } from "$env/static/public";
import sharp from 'sharp';

const uploadImage = async (image) => {

    const imageSharp = sharp(await image.arrayBuffer());
    const metadata = await imageSharp.metadata();

    // Get image res, if more than 5000px, error
    if (metadata.width > PUBLIC_COVER_MAX_WIDTH || metadata.height > PUBLIC_COVER_MAX_HEIGHT) {
        return {
            status: 400,
            body: {
                message: `Image too big (max ${PUBLIC_COVER_MAX_WIDTH}x${PUBLIC_COVER_MAX_HEIGHT})`
            }
        }
    }

    // Pass PUBLIC_COVER_MAX_RESIZE to INT
    const resize = parseInt(PUBLIC_COVER_MAX_RESIZE);

    // Resize the image
    let resizedImageSharp = imageSharp
        .rotate()
        .resize(resize, resize, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
    });

    // convert image to webp
    const buffer = await resizedImageSharp
        .webp({ quality: 80 })
        .toBuffer();

    // Assign to image a random name
    const random = Math.random().toString(36).substring(2, 15);
    const newImageName = `${random}.webp`;

    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

    const file = new File([buffer], newImageName, { type: 'image/webp', lastModified: Date.now() });

    const formData = new FormData();
    formData.append('image', file);

    const createdRecord = await pb.collection('media').create(formData);

    pb.authStore.clear();

    return PUBLIC_POCKETBASE_URL + '/api/files/' + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;
}

export const load = async ({ locals: { supabase, getSession} }) => {
    const {session} = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    // Fetch from supabase the list of books from the user and book table
    const { data: books, error } = await supabase
        .from('book')
        .select('id, owner_id, title, cover_url, created_at, chapters(id)')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: true });

    // get from profiles the user and check if can_upload
    const { data: profiles, error2 } = await supabase
        .from('profiles')
        .select('can_upload')
        .eq('id', session.user.id)
        .single();

    if (error || error2) {
        throw new Error(error.message);
    }

    if (books && books.length !== 0) {
        books.forEach(book => {
            book.chapters = book.chapters.length;
        });
    }

    const can_upload = profiles.can_upload;

    return {
        session,
        books,
        can_upload,
        title: 'Roses in The Flames - Upload',
        description: 'Upload your tales and chapters to Roses in The Flames.',
        index: false
    };
}

export const actions = {
    postbook: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const title = formData.title;
        const description = formData.description;
        const image = formData.image;
        const tag_names_temp = formData.tags;

        if (image === null || title === null || description === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        if (!image || !image.type.startsWith('image/')) {
            return {
                status: 400,
                body: {
                    message: "Invalid file type"
                }
            }
        }

        // Get image size and check if it's bigger than 10MB
        if (image.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES) {
            return {
                status: 400,
                body: {
                    message: `File size too big (max ${PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES} or about 10MB)`
                }
            }
        }

        // Fetch user and check if can_upload
        const { data: profiles, error2 } = await supabase
            .from('profiles')
            .select('can_upload')
            .eq('id', session.user.id)
            .single();

        if (error2) {
            return {
                status: 500,
                body: {
                    message: error2.message
                }
            }
        }

        if (!profiles.can_upload) {
            return {
                status: 403,
                body: {
                    message: "You can't upload Content!"
                }
            }
        }

        const finalURL = await uploadImage(image);

        // If error or object, return it
        if (typeof finalURL === 'object') {
            return finalURL;
        }

        // Insert book into database and get id
        const { data, error } = await supabase.rpc('insert_book_return_id', {
            book_title: title,
            book_description:  description,
            book_cover_url: finalURL,
            owner_id: session.user.id
        });

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        const book_id = data;

        if (tag_names_temp !== null && tag_names_temp !== undefined && tag_names_temp !== "") {

            const tag_names = tag_names_temp.split(',');

            tag_names.forEach((tag, index) => {
                tag_names[index] = tag.trim();
            });

            const { error } = await supabase
                .rpc('add_tags_to_book', {
                    book_id,
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
                message: "Tale added successfully",
                book_id: book_id
            }
        }
    },
    postchapter: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const bookId = formData.book;
        const title = formData.title;
        const content = formData.content;
        const tag_names_temp = formData.tags;

        if (bookId === null || title === null || content === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        // Fetch user and check if can_upload
        const { data: profiles, error2 } = await supabase
            .from('profiles')
            .select('can_upload')
            .eq('id', session.user.id)
            .single();

        if (error2) {
            return {
                status: 500,
                body: {
                    message: error2.message
                }
            }
        }

        if (!profiles.can_upload) {
            return {
                status: 403,
                body: {
                    message: "You can't upload Chapters!"
                }
            }
        }

        // Insert chapter into database
        const { data, error } = await supabase.rpc('insert_chapter_return_id', {
            chapter_title: title, chapter_text: content, book_id: bookId, owner_id: session.user.id
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

        const chapter_id = data;

        if (tag_names_temp !== null && tag_names_temp !== undefined && tag_names_temp !== "") {

            const tag_names = tag_names_temp.split(',');

            tag_names.forEach((tag, index) => {
                tag_names[index] = tag.trim();
            });

            const { error } = await supabase
                .rpc('add_tags_to_chapter', {
                    chapter_id,
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
                message: "Chapter added successfully",
                book_id: bookId,
                chapter_id: chapter_id
            }
        }
    },
    tagsuggestions: async ({ request, locals: { supabase, getSession } }) => {
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

        const { data, error } = await supabase.rpc('get_similar_tags', {
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
    previouschaptertags: async ({ request, locals: { supabase, getSession } }) => {
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
        const book_id = formData.book_id;

        if (!book_id || book_id === "") {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        // Get latest chapter of book_id if available, and get its tags names if available
        const { data: chapter, error } = await supabase
            .from('chapters')
            .select('*, chapter_tags(tags(*))')
            .eq('book_id', book_id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (!chapter) {
            return {
                status: 404,
                body: []
            }
        }

        if (!chapter[0].chapter_tags) {
            return {
                status: 200,
                body: []
            }
        }

        const tags = chapter[0].chapter_tags.map(tag => tag.tags.name);

        return {
            status: 200,
            body: tags
        }
    }
}