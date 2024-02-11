import {redirect} from '@sveltejs/kit'
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {STORJ_BUCKET_NAME, STORJ_SHARE_LINK} from '$env/static/private';
import sharp from 'sharp';

const uploadImage = async (image, s3) => {

    // Make image a buffer
    image = await image.arrayBuffer();

    // convert image to webp with 80% quality
    const buffer = await sharp(image)
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



        // Assign to image a random name
        /*const random = Math.random().toString(36).substring(2, 15);
        const imageExtension = image.type.split('/')[1];
        const newImageName = `${random}.${imageExtension}`;

        // Make a compatible body format for S3
        const imageBuffer = await image.arrayBuffer();

        // Upload cover to S3 STORJ
        const coverUrl = `covers/${newImageName}`;
        const coverParams = {
            Bucket: STORJ_BUCKET_NAME,
            Key: coverUrl,
            Body: imageBuffer,
            ACL: 'public-read',
            ContentType: image.type
        };

        try {
            const putObjectCommand = new PutObjectCommand(coverParams);
            await s3.send(putObjectCommand);
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        // Hacky way of building the final public URL
        const finalURL = `${STORJ_SHARE_LINK}/${STORJ_BUCKET_NAME}/${coverUrl}?wrap=0`;

        // Get final URL of the cover
        /*const getObjectCommand = new GetObjectCommand({
            Bucket: 'images',
            Key: coverUrl,
        });

        let signedUrl;
        try {
            signedUrl = await getSignedUrl(s3, getObjectCommand);
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }*/

        const finalURL = await uploadImage(image, s3);

        // Check if return is an error

        // check if return starts with https
        if (!finalURL.startsWith('https://')) {
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
    }
}