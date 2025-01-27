import { redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import {PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW} from '$env/static/private';
import {PUBLIC_PROFILE_ICON_RESIZE_WIDTH, PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH, PUBLIC_POCKETBASE_URL} from "$env/static/public";
import sharp from 'sharp';

const uploadImage = async (image, user_id, old_url) => {

    // Random image name
    const random = Math.random().toString(36).substring(2, 15);
    const newImageName = `${random}.webp`;

    // Admin Pocketbase client
    const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
    await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

    // Create image file for FormData
    const file = new File([image], newImageName, { type: 'image/webp', lastModified: Date.now() });

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', user_id);

    // Upload image
    const createdRecord = await pb.collection('profiles_media').create(formData);

    // If found, delete old image
    if (old_url && old_url !== '' && old_url.startsWith(PUBLIC_POCKETBASE_URL)) {
        const old_url_parts = old_url.split('/');
        const old_url_id = old_url_parts[old_url_parts.length - 2];
        await pb.collection('profiles_media').delete(old_url_id);
    }

    // Close session
    pb.authStore.clear();

    return PUBLIC_POCKETBASE_URL + '/api/files/' + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;
}

export const load = async ({ locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    const results = {
        profile: null,
    }

    if (session) {
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select(`username, full_name, website, avatar_url, cover_url, show_favourites`)
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
    update: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());

        const fullName = formData.fullName;
        const username = formData.username;
        const website = formData.website;

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

        const { error } = await supabase.from('profiles').upsert({
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
    signout: async ({ locals: { supabase, getSession } }) => {
        const {session} = await getSession()
        if (session) {
            await supabase.auth.signOut()
            throw redirect(303, '/')
        }
    },
    profileicon: async ({ request, locals: { supabase, getSession } }) => {
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
        let filePath = formData.filePath;

        if (!file) {
            return {
                status: 400,
                body: {
                    message: 'No file uploaded'
                }
            }
        }

        if (!filePath) {
            return {
                status: 400,
                body: {
                    message: 'No file path provided'
                }
            }
        }

        const imageSharp = sharp(await file.arrayBuffer());

        const optimizedImage = await imageSharp
            .rotate()
            .resize(parseInt(PUBLIC_PROFILE_ICON_RESIZE_WIDTH))
            .webp({ quality: 80 })
            .toBuffer();

        const { error2, data: profile } = await supabase
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
        const { error: error3 } = await supabase
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
    profilecover: async ({ request, locals: { supabase, getSession } }) => {
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
        let filePath = formData.filePath;
        const maxSize = parseInt(PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH);

        if (!file) {
            return {
                status: 400,
                body: {
                    message: 'No file uploaded'
                }
            }
        }

        if (!filePath) {
            return {
                status: 400,
                body: {
                    message: 'No file path provided'
                }
            }
        }

        const imageSharp = sharp(await file.arrayBuffer());

        const metadata = await imageSharp.metadata();
        const width = metadata.width;

        if (width > maxSize) {
            imageSharp.rotate().resize(maxSize);
        }

        const optimizedImage = await imageSharp
            .rotate()
            .webp({ quality: 80 })
            .toBuffer();

        // Get old cover url
        const { data: profile, error: error2 } = await supabase
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
        const { error3 } = await supabase
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
    showfavourites: async ({ request, locals: { supabase, getSession } }) => {
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

        const { error } = await supabase
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
    updatepassword: async ({ request, locals: { supabase, getSession } }) => {
        const formData = Object.fromEntries(await request.formData());
        const newPassword = formData.password;

        const {session} = await getSession();
        if (!session) {
            throw new Error('Unauthorized');
        }

        if (!newPassword) {
            return {
                status: 400,
                body: {
                    message: 'New password is required'
                }
            }
        }

        const { error } = await supabase.auth.updateUser({
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
}
