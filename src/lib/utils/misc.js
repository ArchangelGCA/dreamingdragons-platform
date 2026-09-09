import {error as errorx} from "@sveltejs/kit";
import sharp from "sharp";
import PocketBase from "pocketbase";
import crypto from "crypto";
import {PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW} from '$env/static/private';
import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_RESIZE, PUBLIC_POCKETBASE_URL } from "$env/static/public";

export async function isAdmin(session, supabase) {
    if (!session) {
        return errorx(401, "Unauthorized");
    }

    /* Role IDs (AS OF NOW):
    / 2 - moderator
    / 3 - admin (FULL PERMS)
    / 4 - staff
     */
    const {data: data, error} = await supabase
        .from('roles_profile')
        .select('role_id')
        .eq('user_id', session.user.id)
        .eq('role_id', 3);

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching profile");
    }

    if (!data || data.length === 0) {
        return errorx(401, "Unauthorized");
    }

    return true;
}

export const uploadImage = async (image, cover_id = null) => {
    let imageSharp;
    try {
        imageSharp = sharp(await image.arrayBuffer(), {animated: true, limitInputPixels: 25000000, failOn: 'warning'});
    } catch {
        return {status: 400, body: {message: 'Invalid image file'}};
    }
    let metadata;
    try {
        metadata = await imageSharp.metadata();
    } catch {
        return {status: 400, body: {message: 'Invalid image file'}};
    }

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

    // Assign to image a random name (unpredictable, collision-resistant)
    const newImageName = `${crypto.randomUUID()}.webp`;

    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

    const file = new File([buffer], newImageName, { type: 'image/webp', lastModified: Date.now() });

    const formData = new FormData();
    formData.append('image', file);

    const createdRecord = await pb.collection('media').create(formData);

    // delete old image cover_id (only when it looks like a PB record id)
    if (cover_id && /^[A-Za-z0-9_-]{1,64}$/.test(String(cover_id))) {
        try {
            await pb.collection('media').delete(cover_id);
        } catch {
            // Best-effort cleanup; do not fail upload if old file is gone.
        }
    }

    pb.authStore.clear();

    return PUBLIC_POCKETBASE_URL + '/api/files/' + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;
}