import { PUBLIC_DEFAULT_NAME, PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
import {error as errorx, redirect} from "@sveltejs/kit";
import { createProfilePath } from '$lib/utils/slugs.js';

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    if (session) {

        // Check if user is found in profiles, if not, create a new profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', session.user.id);

        if (error) {
            console.error(error);
            return errorx(500, "Error fetching profile");
        }

        // User not found, creating new profile...
        if (!profile || profile.length === 0) {
            const randomIdUsernameShort = Math.random().toString(36).substring(2, 6);

            const {error: errorCreation} = await supabase
                .from('profiles')
                .insert([{
                    id: session.user.id,
                    full_name: PUBLIC_DEFAULT_NAME,
                    username: PUBLIC_DEFAULT_USERNAME + "-" + randomIdUsernameShort,
                    website: '',
                    avatar_url: '',
                    updated_at: new Date(),
                }]);

            if (errorCreation) {
                console.error('Error creating profile', errorCreation);
                return errorx(500, "Error creating profile");
            }
            
            // Fetch the newly created profile to get the username for SEO-friendly URL
            const { data: newProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
                
            if (fetchError || !newProfile) {
                console.error('Error fetching newly created profile', fetchError);
                return redirect(302, createProfilePath(PUBLIC_DEFAULT_USERNAME + "-" + randomIdUsernameShort, session.user.id)); // Fallback with generated username
            }
            
            return redirect(302, createProfilePath(newProfile.username, session.user.id));
        }

        // User exists, redirect to their SEO-friendly profile URL
        return redirect(302, createProfilePath(profile[0].username, session.user.id));
    } else {
        return redirect(302,'/login');
    }
}