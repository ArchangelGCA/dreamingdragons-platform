import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_IMAGE_PROXY_URL } from '$env/static/public';
import { createServerClient } from "@supabase/ssr";

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, { ...options, path: '/' })
                })
            },
        },
    });

    /**
     * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
     */
    event.locals.getSession = async () => {
        const {data: { session }} = await event.locals.supabase
            .auth
            .getSession();
        if (!session) {
            return { session: null, user: null }
        }

        const {data: { user }, error} = await event.locals.supabase
            .auth
            .getUser();
        if (error) {
            return { session: null, user: null }
        }

        delete session.user;

        return { session: Object.assign({}, session, { user }), user };
    }

    /** Image proxy in locals */
    event.locals.image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    })
}