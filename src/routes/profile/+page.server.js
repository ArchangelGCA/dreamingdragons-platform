import { PUBLIC_DEFAULT_NAME, PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
import {error as errorx, redirect} from "@sveltejs/kit";

export const load = async ( { params, locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    if (session) {

        // Check if user is found in profiles, if not, create a new profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
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
        }

        redirect(302,'/profile/' + session.user.id);
    } else {
        redirect(302,'/login');
    }
}