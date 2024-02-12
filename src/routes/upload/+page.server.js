import {redirect} from '@sveltejs/kit'
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {STORJ_BUCKET_NAME, STORJ_SHARE_LINK, COVER_MAX_WIDTH, COVER_MAX_HEIGHT, COVER_MAX_RESIZE, COVER_MAX_UPLOAD_SIZE_BYTES} from '$env/static/private';
import sharp from 'sharp';

const uploadImage = async (image, s3) => {

    const imageSharp = sharp(await image.arrayBuffer());
    const metadata = await imageSharp.metadata();

    // Get image res, if more than 5000px, error
    if (metadata.width > COVER_MAX_WIDTH || metadata.height > COVER_MAX_HEIGHT) {
        return {
            status: 400,
            body: {
                message: `Image too big (max ${COVER_MAX_WIDTH}x${COVER_MAX_HEIGHT})`
            }
        }
    }

    // Resize the image
    let resizedImageSharp = imageSharp.resize(COVER_MAX_RESIZE, COVER_MAX_RESIZE, {
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

    // Make a compatible body format for S3
    const coverUrl = `covers/${newImageName}`;
    const coverParams = {
        Bucket: STORJ_BUCKET_NAME,
        Key: coverUrl,
        Body: buffer,
        ACL: 'public-read',
        ContentType: 'image/webp'
    };

    try {
        const putObjectCommand = new PutObjectCommand(coverParams);
        await s3.send(putObjectCommand);
    } catch (error) {
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    // Hacky way of building the final public URL
    return `${STORJ_SHARE_LINK}/${STORJ_BUCKET_NAME}/${coverUrl}?wrap=0`;
}

export const load = async ({ locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    // Fetch from supabase the list of books from the user and book table
    const { data: books, error } = await supabase
        .from('book')
        .select('id, owner_id, title, cover_url, created_at')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return { session, books };
}

export const actions = {
    postbook: async ({ request, locals: { supabase, getSession, s3 } }) => {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const title = formData.title;
        const description = formData.description;
        const image = formData.image;

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
        if (image.size > COVER_MAX_UPLOAD_SIZE_BYTES) {
            return {
                status: 400,
                body: {
                    message: `File size too big (max ${COVER_MAX_UPLOAD_SIZE_BYTES} or about 10MB)`
                }
            }
        }

        const finalURL = await uploadImage(image, s3);

        // If error or object, return it
        if (typeof finalURL === 'object') {
            return finalURL;
        }

        // Insert book into database
        const { error } = await supabase.from('book').insert([
            { title, description, cover_url: finalURL, owner_id: session.user.id }
        ]);

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
            body: {
                message: "Book added successfully"
            }
        }
    },
    postchapter: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        if (!session) {
            throw redirect(303, '/login');
        }

        const bookId = formData.book;
        const title = formData.title;
        const content = formData.content;

        if (bookId === null || title === null || content === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        // Insert chapter into database
        const { error } = await supabase.from('chapters').insert([
            { title, text: content, book_id: bookId, owner_id: session.user.id }
        ]);

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
                message: "Chapter added successfully"
            }
        }
    }
}