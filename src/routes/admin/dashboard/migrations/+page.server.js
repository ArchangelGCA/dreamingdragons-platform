import { PUBLIC_SUPABASE_URL, PUBLIC_POCKETBASE_URL_IMG_API, PUBLIC_POCKETBASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_SECRET_KEY, PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW } from '$env/static/private';
import {createClient} from "@supabase/supabase-js";
import PocketBase from "pocketbase";
import {isAdmin} from "$lib/utils/misc.js";

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    const result = await isAdmin(session, supabase);
    if (result !== true) return result;

    return {
        title: 'Admin - Migrations',
        description: 'Admin Migrations Dashboard of DreamingDragons platform.',
        index: false
    }
}

export const actions = {
    migrate_avatars: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
        await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

        // Get all profiles
        const {data: profiles, error: profilesError} = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) {
            console.error(profilesError);
            return {
                status: 500,
                body: {
                    message: "Error fetching profiles"
                }
            }
        }

        if (!profiles || profiles.length === 0) {
            return {
                status: 200,
                body: {
                    message: "No profiles found"
                }
            }
        }

        for (const profile of profiles) {
            if (profile.avatar_url && profile.avatar_url !== '' && !profile.avatar_url.startsWith(PUBLIC_POCKETBASE_URL_IMG_API)) {

                const {data: avatarData, error: avatarError} = await adminSupabase.storage
                    .from('avatars')
                    .download(profile.avatar_url);


                if (avatarError) {
                    console.error(avatarError);
                    console.log('Error downloading avatar:', profile);
                    continue;
                }

                const file = new File([avatarData], profile.avatar_url, {type: 'image/webp', lastModified: Date.now()});

                const formData = new FormData();
                formData.append('image', file);
                formData.append('user_id', profile.id);

                const createdRecord = await pb.collection('profiles_media').create(formData);
                const finalUrl = PUBLIC_POCKETBASE_URL_IMG_API + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;

                // Update the avatar_url in profiles
                const {error: updateError} = await adminSupabase
                    .from('profiles')
                    .update({
                    avatar_url: finalUrl
                    })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error(updateError);
                    return {
                        status: 500,
                        body: {
                            message: "Error updating profile"
                        }
                    }
                }

                console.log(`Migrated ${profile.id} avatar successfully!`);
            }
        }

        return {
            status: 200,
            body: {
                message: "Avatars migrated successfully"
            }
        }
    },
    migrate_covers: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
        await pb.admins.authWithPassword(PRIVATE_POCKETBASE_EMAIL, PRIVATE_POCKETBASE_PSW);

        // Get all profiles
        const {data: profiles, error: profilesError} = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) {
            console.error(profilesError);
            return {
                status: 500,
                body: {
                    message: "Error fetching profiles"
                }
            }
        }

        if (!profiles || profiles.length === 0) {
            return {
                status: 200,
                body: {
                    message: "No profiles found"
                }
            }
        }

        for (const profile of profiles) {
            if (profile.cover_url && profile.cover_url !== '' && !profile.cover_url.startsWith(PUBLIC_POCKETBASE_URL_IMG_API)) {
                const {data: coverData, error: coverError} = await adminSupabase.storage
                    .from('avatars')
                    .download(profile.cover_url);

                if (coverError) {
                    console.error(coverError);
                    console.log('Error downloading cover:', profile);
                    continue;
                }

                const file = new File([coverData], profile.cover_url, {type: 'image/webp', lastModified: Date.now()});

                const formData = new FormData();
                formData.append('image', file);
                formData.append('user_id', profile.id);

                const createdRecord = await pb.collection('profiles_media').create(formData);
                const finalUrl = PUBLIC_POCKETBASE_URL_IMG_API + createdRecord.collectionId + '/' + createdRecord.id + '/' + createdRecord.image;

                // Update the cover_url in profiles
                const {error: updateError} = await adminSupabase
                    .from('profiles')
                    .update({
                        cover_url: finalUrl
                    })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error(updateError);
                    return {
                        status: 500,
                        body: {
                            message: "Error updating profile"
                        }
                    }
                }

                console.log(`Migrated ${profile.id} cover successfully!`);
            }
        }

        return {
            status: 200,
            body: {
                message: "Covers migrated successfully"
            }
        }
    }
}