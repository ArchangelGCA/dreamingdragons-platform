import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL, PUBLIC_IMAGE_PROXY_URL } from '$env/static/public'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'

export const load = async ({ fetch, data, depends }) => {
    depends('supabase:auth')

    const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
            fetch,
        },
        cookies: {
            get(key) {
                if (!isBrowser()) {
                    return JSON.stringify(data.session)
                }

                const cookie = parse(document.cookie)
                return cookie[key]
            },
        },
    });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;
    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        },
        theme: 'text-center w-auto',
        autoPosition: true,
    };

    let notifications = [];
    let userData = null;
    let notifs = [];

    if (session) {
        const {data: notifs, error} = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', session.user.id)
            .order('created_at', {ascending: false})
            .range(0, 20);

        if (error) {
            console.error(error)
            return {
                status: 500,
                body: {
                    message: error.message,
                },
            }
        }

        const { data: user, errorProfiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (errorProfiles) {
            console.error(errorProfiles)
            return {
                status: 500,
                body: {
                    message: errorProfiles.message,
                },
            }
        }

        userData = user;
        notifications = notifs;
    }

    return {
        supabase,
        userData,
        session,
        notifications,
        image_proxy,
        tooltipConfig,
    }
}