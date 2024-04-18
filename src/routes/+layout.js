import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'
import { dev } from '$app/environment';
import { inject } from '@vercel/analytics';

inject({mode: dev ? 'development' : 'production'});

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

    let notifications = [];

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

        notifications = notifs;
    }

    return { supabase, session, notifications }
}