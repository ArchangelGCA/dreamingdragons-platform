import {error as errorx, redirect} from "@sveltejs/kit";
import sharp from "sharp";
import PocketBase from "pocketbase";
import {PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW} from '$env/static/private';
import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES, PUBLIC_COVER_MAX_RESIZE, PUBLIC_POCKETBASE_URL, PUBLIC_POCKETBASE_URL_IMG_API } from "$env/static/public";

export const load = async ({ params, locals: { supabase, getSession} }) => {
    const {session} = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    if (!params.book){
        errorx(400, "Missing required fields");
        return;
    }

    const sessionUserId = session.user.id;
    const bookId = params.book;

    const {data: bookSearch, error} = await supabase
        .from('book')
        .select('*, chapters(id, title), book_tags(tags(id, name))')
        .eq('id', bookId)
        .eq('owner_id', sessionUserId);

    if (error){
        errorx(500, 'Something went wrong, perhaps the IDs may be invalid or you are\'t the owner of this Content...');
        return;
    }

    if (!bookSearch || bookSearch.length === 0) {
        errorx(404, "Content not found OR you are not the owner of this Content...");
        return;
    }

    const book = bookSearch[0];
    book.tags = book.book_tags.map(tag => tag.tags.name);
    book.book_tags = [];

    return {
        book,
        title: 'DreamingDragons - Edit Tale',
        description: 'Edit your tale.',
        index: false
    };
}

export const actions = {
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
    editbook: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const bookId = formData.bookId;

        if (!bookId) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: bookSearch, error} = await supabase
            .from('book')
            .select('id, cover_url')
            .eq('id', bookId)
            .eq('owner_id', session.user.id);

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        if (bookSearch.length === 0) {
            return {
                status: 500,
                body: {
                    message: "You are not the owner of this book"
                }
            }
        }

        // Get formdata, not all data is required
        const {title, description, tags, image } = formData;
        const cover_url = bookSearch[0].cover_url;
        let finalURL = null;

        if (image !== null && image !== undefined && image.size > 0 && image.name !== ""){
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

            const cover_url_path = cover_url.substring(PUBLIC_POCKETBASE_URL_IMG_API.length);
            const cover_id = cover_url_path.split('/')[1];

            finalURL = await uploadImage(image, cover_id);

            // If error or object, return it
            if (typeof finalURL === 'object') {
                return finalURL;
            }
        }

        let updateData = {};

        if (title !== null) updateData.title = title;
        if (description !== null) updateData.description = description;
        if (finalURL !== null) updateData.cover_url = finalURL;
        updateData.updated_at = new Date();

        const { error: error2 } = await supabase
            .from('book')
            .update(updateData)
            .eq('id', bookId)
            .eq('owner_id', session.user.id);

        if (error2) {
            return {
                status: 500,
                body: {
                    message: error2.message
                }
            }
        }

        // Delete all old tags
        await supabase
            .from('book_tags')
            .delete()
            .eq('book_id', bookId);

        // Insert new tags
        if (tags !== null && tags !== undefined && tags !== "") {

            const tag_names = tags.split(',');

            tag_names.forEach((tag, index) => {
                tag_names[index] = tag.trim();
            });

            const { error } = await supabase
                .rpc('add_tags_to_book', {
                    book_id: bookId,
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
                message: "Tale edited successfully"
            }
        }
    }
}

const uploadImage = async (image, cover_id) => {
    const imageSharp = sharp(await image.arrayBuffer(), {animated: true});
    const metadata = await imageSharp.metadata();

    // Get image res, if more than 5000px, error
    if ((metadata.format === 'gif' && (metadata.pageHeight > PUBLIC_COVER_MAX_HEIGHT || metadata.width > PUBLIC_COVER_MAX_WIDTH)) || (metadata.format !== 'gif' && (metadata.width > PUBLIC_COVER_MAX_WIDTH || metadata.height > PUBLIC_COVER_MAX_HEIGHT))) {
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

    // delete old image cover_id
    await pb.collection('media').delete(cover_id);

    pb.authStore.clear();

    return PUBLIC_POCKETBASE_URL + '/api/files/' + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;
}