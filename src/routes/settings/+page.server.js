import { fail, redirect } from '@sveltejs/kit'
import {PUBLIC_PROFILE_ICON_RESIZE_WIDTH} from "$env/static/public";
import sharp from 'sharp';

export const load = async ({ locals: { supabase, getSession/*, s3*/ } }) => {
    const session = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select(`username, full_name, website, avatar_url`)
        .eq('id', session.user.id)
        .single();

    return { session, profile };
}

export const actions = {
    update: async ({ request, locals: { supabase, getSession } }) => {
        const formData = await request.formData();

        const fullName = formData.get('fullName');
        const username = formData.get('username');
        const website = formData.get('website');
        const avatarUrl = formData.get('avatarUrl');

        const session = await getSession();
        if (!session) {
            throw redirect(303, '/login');
        }

        const { error } = await supabase.from('profiles').upsert({
            id: session.user.id,
            full_name: fullName,
            username,
            website,
            avatar_url: avatarUrl,
            updated_at: new Date(),
        });

        if (error) {
            console.error('Error updating profile', error);
            return fail(500, {
                fullName,
                username,
                website,
                avatarUrl,
            });
        }

        return {
            fullName,
            username,
            website,
            avatarUrl,
        }
    },
    signout: async ({ locals: { supabase, getSession } }) => {
        const session = await getSession()
        if (session) {
            await supabase.auth.signOut()
            throw redirect(303, '/')
        }
    },
    profileicon: async ({ request, locals: { supabase, getSession } }) => {
        const session = await getSession();

        if (!session) {
            throw new Error('Unauthorized');
        }

        const formData = Object.fromEntries(await request.formData());
        const file = formData.file;
        const filePath = formData.filePath;

        if (!file) {
            throw new Error('No file uploaded');
        }

        if (!filePath) {
            throw new Error('No file path provided');
        }

        const imageSharp = sharp(await file.arrayBuffer());

        const optimizedImage = await imageSharp
            .resize(parseInt(PUBLIC_PROFILE_ICON_RESIZE_WIDTH))
            .webp({ quality: 80 })
            .toBuffer();

        const { error } = await supabase.storage.from('avatars').upload(filePath, optimizedImage, {
            contentType: 'image/webp',
        });

        if (error) {
            throw new Error('Error uploading image');
        }

        // Delete the old avatar that we can get from profiles table
        const { error2, data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', session.user.id)
            .single();

        if (error2) {
            throw new Error('Error fetching profile');
        }

        const oldAvatarUrl = profile.avatar_url;

        if (oldAvatarUrl) {
            await supabase.storage
                .from('avatars')
                .remove([oldAvatarUrl]);
        }

        return {
            status: 200,
            body: {
                message: 'Image uploaded successfully'
            }
        }
    },
}
