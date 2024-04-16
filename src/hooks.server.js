import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from "@supabase/ssr";

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => event.cookies.get(key),
            set: (key, value, options) => {
                event.cookies.set(key, value, { ...options, path: '/' })
            },
            remove: (key, options) => {
                event.cookies.delete(key, { ...options, path: '/' })
            },
        },
    });

    /**
     * Get the client's IP address
     */
    event.locals.ip_address = event.getClientAddress();

    /**
     * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
     */
    event.locals.getSession = async () => {
        const { data: getUserData, error: err }  = await event.locals.supabase.auth.getUser();

        let {
            data: { session },
        } = await event.locals.supabase.auth.getSession();

        if (getUserData.user == null) {
            session = null;
        }

        return session;
    }
    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range';
        },
    })
}