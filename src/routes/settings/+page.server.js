import {redirect} from '@sveltejs/kit';
import crypto from 'crypto';
import {
    PRIVATE_RESEND_API_KEY,
    PRIVATE_RESEND_AUDIENCE_ID
} from '$env/static/private';
import {
    PUBLIC_PROFILE_ICON_RESIZE_WIDTH,
    PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH
} from "$env/static/public";
import sharp from 'sharp';
import {Resend} from "resend";
import { safeExternalUrl } from '$lib/utils/images.js';
import {buildFileUrl, createSuperuserClient, deleteFileRecordBestEffort, extractRecordIdFromFileUrl} from "$lib/server/pocketbase.js";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const uploadImage = async (image, user_id, old_url) => {

    // Random image name (unpredictable)
    const newImageName = `${crypto.randomUUID()}.webp`;

    // Admin Pocketbase client (superuser auth, PocketBase >= 0.23)
    const pb = await createSuperuserClient();
    try {
        // Create image file for FormData
        const file = new File([image], newImageName, {type: 'image/webp', lastModified: Date.now()});

        // Create FormData
        const formData = new FormData();
        formData.append('image', file);
        formData.append('user_id', user_id);

        // Upload image
        const createdRecord = await pb.collection('profiles_media').create(formData);

        // If found, delete old image (best-effort: never fail the upload)
        const oldRecordId = extractRecordIdFromFileUrl(old_url);
        if (oldRecordId) {
            await deleteFileRecordBestEffort(pb, 'profiles_media', oldRecordId);
        }

        return buildFileUrl(pb, createdRecord, createdRecord.image);
    } finally {
        // Close session
        pb.authStore.clear();
    }
}

export const load = async ({locals: {supabase, getSession}}) => {
    const {session} = await getSession();

    const results = {
        profile: null,
    }

    if (session) {
        const {data: profileData, error} = await supabase
            .from('profiles')
            .select(`username, full_name, website, avatar_url, cover_url, show_favourites, newsletter`)
            .eq('id', session.user.id)
            .single();
        results.profile = profileData;

        if (error) {
            // Redirect to /profile if profile not found
            return redirect(303, '/profile');
        }
    }

    results.title = (results.profile !== null && results.profile.username !== null && results.profile.username !== "" ? results.profile.username : 'Guest') + ' - Settings';
    results.description = 'Settings page for ' + (results.profile !== null && results.profile.username !== null && results.profile.username !== "" ? results.profile.username : 'Guest') + ' on DreamingDragons.';
    return results;
}

export const actions = {
    update: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());

        const fullName = typeof formData.fullName === 'string' ? formData.fullName.slice(0, 120) : '';
        const username = typeof formData.username === 'string' ? formData.username.trim().slice(0, 64) : '';
        const rawWebsite = typeof formData.website === 'string' ? formData.website.trim().slice(0, 2048) : '';
        // Only persist safe http(s) URLs; reject javascript:/data: etc.
        const website = rawWebsite ? safeExternalUrl(rawWebsite) : '';
        if (rawWebsite && !website) {
            return {
                status: 400,
                body: {
                    message: 'Website URL must start with http:// or https://'
                }
            }
        }

        const {session} = await getSession();
        if (!session) {
            throw redirect(303, '/login');
        }

        if (!username) {
            return {
                status: 400,
                body: {
                    message: 'Username is required'
                }
            }
        }

        const {error} = await supabase.from('profiles').upsert({
            id: session.user.id,
            full_name: fullName,
            username,
            website,
            updated_at: new Date(),
        });

        if (error) {
            if (error.message.includes('duplicate key value violates unique constraint')) {
                return {
                    status: 400,
                    body: {
                        message: 'Username is already taken'
                    }
                }
            } else {
                console.error('Error updating profile', error);
                return {
                    status: 500,
                    body: {
                        message: 'Error updating profile'
                    }
                }
            }
        }

        return {
            status: 200,
            body: {
                message: 'Profile updated successfully'
            }
        }
    },
    logout: async ({locals: {supabase, getSession}}) => {
        const {session} = await getSession()
        if (session) {
            await supabase.auth.signOut()
            throw redirect(303, '/')
        }
    },
    profileicon: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: 'Unauthorized'
                }
            }
        }

        const formData = Object.fromEntries(await request.formData());
        const file = formData.file;

        if (!file || typeof file.arrayBuffer !== 'function') {
            return {
                status: 400,
                body: {
                    message: 'No file uploaded'
                }
            }
        }

        if (file.type && !String(file.type).startsWith('image/')) {
            return {status: 400, body: {message: 'File must be an image'}};
        }
        if (file.size && file.size > MAX_UPLOAD_BYTES) {
            return {status: 400, body: {message: 'Image too large (max 8MB)'}};
        }

        let optimizedImage;
        try {
            const buf = await file.arrayBuffer();
            if (buf.byteLength > MAX_UPLOAD_BYTES) {
                return {status: 400, body: {message: 'Image too large (max 8MB)'}};
            }
            optimizedImage = await sharp(buf, {animated: false, limitInputPixels: 25000000, failOn: 'warning'})
                .rotate()
                .resize(parseInt(PUBLIC_PROFILE_ICON_RESIZE_WIDTH))
                .webp({quality: 80})
                .toBuffer();
        } catch {
            return {status: 400, body: {message: 'Invalid image file'}};
        }

        const {error2, data: profile} = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', session.user.id)
            .single();

        if (error2) {
            return {
                status: 500,
                body: {
                    message: 'Error fetching profile'
                }
            }
        }

        let avatarUrl = await uploadImage(optimizedImage, session.user.id, profile.avatar_url);

        // Update the avatar url in profiles table
        const {error: error3} = await supabase
            .from('profiles')
            .update({
                avatar_url: avatarUrl,
                updated_at: new Date(),
            })
            .eq('id', session.user.id);

        if (error3) {
            return {
                status: 500,
                body: {
                    message: 'Error updating profile'
                }
            }
        }

        return {
            status: 200,
            body: {
                message: 'Image uploaded successfully'
            }
        }
    },
    profilecover: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: 'Unauthorized'
                }
            }
        }

        const formData = Object.fromEntries(await request.formData());
        const file = formData.file;
        const maxSize = parseInt(PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH);

        if (!file || typeof file.arrayBuffer !== 'function') {
            return {
                status: 400,
                body: {
                    message: 'No file uploaded'
                }
            }
        }

        if (file.type && !String(file.type).startsWith('image/')) {
            return {status: 400, body: {message: 'File must be an image'}};
        }
        if (file.size && file.size > MAX_UPLOAD_BYTES) {
            return {status: 400, body: {message: 'Image too large (max 8MB)'}};
        }

        let optimizedImage;
        try {
            const buf = await file.arrayBuffer();
            if (buf.byteLength > MAX_UPLOAD_BYTES) {
                return {status: 400, body: {message: 'Image too large (max 8MB)'}};
            }
            const coverSharp = sharp(buf, {animated: false, limitInputPixels: 25000000, failOn: 'warning'});
            const metadata = await coverSharp.metadata();
            const width = metadata.width ?? 0;
            const pipeline = coverSharp.rotate();
            if (width > maxSize) {
                pipeline.resize(maxSize);
            }
            optimizedImage = await pipeline.webp({quality: 80}).toBuffer();
        } catch {
            return {status: 400, body: {message: 'Invalid image file'}};
        }

        // Get old cover url
        const {data: profile, error: error2} = await supabase
            .from('profiles')
            .select('cover_url')
            .eq('id', session.user.id)
            .single();

        if (error2) {
            return {
                status: 500,
                body: {
                    message: 'Error fetching profile'
                }
            }
        }

        // Upload image to PocketBase
        let coverUrl = await uploadImage(optimizedImage, session.user.id, profile.cover_url);

        // Update with new Cover url
        const {error3} = await supabase
            .from('profiles')
            .update({
                cover_url: coverUrl,
                updated_at: new Date(),
            })
            .eq('id', session.user.id);

        if (error3) {
            return {
                status: 500,
                body: {
                    message: 'Error updating profile'
                }
            }
        }

        return {
            status: 200,
            body: {
                message: 'Cover uploaded successfully'
            }
        }
    },
    showfavourites: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: 'Unauthorized'
                }
            }
        }

        const formData = Object.fromEntries(await request.formData());
        const showFavourites = formData.showFavourites;

        const {error} = await supabase
            .from('profiles')
            .update({
                show_favourites: showFavourites,
                updated_at: new Date(),
            })
            .eq('id', session.user.id);

        if (error) {
            console.error('Error updating profile', error);
            return {
                status: 500,
                body: {
                    message: 'Error updating profile'
                }
            }
        }

        return {
            status: 200,
            body: {
                message: showFavourites === 'true' ? 'Favourites are now shown' : 'Favourites are now hidden'
            }
        }
    },
    updatepassword: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw new Error('Unauthorized');
        }

        const newPassword = formData.password;

        if (!newPassword) {
            return {
                status: 400,
                body: {
                    message: 'New password is required'
                }
            }
        }

        const {error} = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Error updating password', error);
            return {
                status: 500,
                body: {
                    message: 'Error updating password (You must have logged in recently to update password, please try to logout and login again!)'
                }
            }
        }

        return {
            status: 200,
            body: {
                message: 'Password updated successfully'
            }
        }
    },
    newsletter: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            throw new Error('Unauthorized');
        }

        const newsletter = formData.newsletter;

        if (!newsletter) {
            return {
                status: 400,
                body: {
                    message: 'Newsletter is required'
                }
            }
        }

        const {error} = await supabase
            .from('profiles')
            .update({
                newsletter: newsletter,
                updated_at: new Date(),
            })
            .eq('id', session.user.id);

        const resend = new Resend(PRIVATE_RESEND_API_KEY);

        // Get list of contacts
        const {data: contacts, error: contactsError} = await resend.contacts.list({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID,
        });

        if (contactsError) {
            console.error(contactsError);
            return {
                status: 500,
                body: {
                    message: 'Error fetching contacts'
                }
            }
        }

        // Check if email is already registered
        const isEmailRegistered = contacts.data.find(contact => contact.email === session.user.email);

        if (isEmailRegistered) {
            await resend.contacts.update({
                audienceId: PRIVATE_RESEND_AUDIENCE_ID,
                email: session.user.email,
                unsubscribed: newsletter !== 'true',
            });
        } else {
            await resend.contacts.create({
                audienceId: PRIVATE_RESEND_AUDIENCE_ID,
                email: session.user.email,
                unsubscribed: newsletter !== 'true',
            });
        }

        if (error) {
            console.error('Error updating newsletter', error);
            return {
                status: 500,
                body: {
                    message: 'Error updating newsletter'
                }
            }
        }

        return {
            status: 200,
            body: {
                message: newsletter === 'true' ? 'Subscribed to Newsletter' : 'Unsubscribed from Newsletter'
            }
        }
    }
}
