import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL, PUBLIC_IMAGE_PROXY_URL } from '$env/static/public'
import {createBrowserClient, createServerClient, isBrowser} from '@supabase/ssr'
import {getValidatedSession} from "$lib/utils/gcacommons.js";

export const load = async ({ fetch, data, depends, url }) => {
    depends('supabase:auth')

    const supabase = isBrowser()
        ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
            global: {
                fetch,
            },
        })
        : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
            global: {
                fetch,
            },
            cookies: {
                getAll() {
                    return data.cookies;
                },
            },
        });

    const {session} = isBrowser() ? await getValidatedSession(supabase) : data.session;

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

        const { data, error} = await supabase
            .from('profiles')
            .select('id, username, avatar_url, notifications!recipient_id(*)')
            .eq('id', session.user.id)
            .single();

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        notifs = data.notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);
        notifications = notifs;

        userData = {
            id: data.id,
            username: data.username,
            avatar_url: data.avatar_url,
        };
    }

    return {
        supabase,
        userData,
        session,
        notifications,
        image_proxy,
        tooltipConfig,
        title: 'DreamingDragons - Platform',
        description: 'The official platform of DreamingDragons. By ArchangelGCA, and its community. Read, find and share your art and literature.',
        siteName: 'DreamingDragons - Platform',
        imageURL: `${url.origin}/favicon.webp`,
        logo: `${url.origin}/favicon.webp`,
        author: 'ArchangelGCA',
        twitter: true,
        openGraph: true,
        schemaOrg: true,
        index: true,
    }
}