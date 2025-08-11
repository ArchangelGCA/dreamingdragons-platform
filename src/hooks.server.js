import {PUBLIC_IMAGE_PROXY_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL} from '$env/static/public';
import {createServerClient} from "@supabase/ssr";
import {getValidatedSession} from "$lib/utils/gcacommons.js";

export const handle = async ({event, resolve}) => {
    event.locals.supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll: () => event.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({name, value, options}) => {
                        event.cookies.set(name, value, {...options, path: '/'})
                    })
                },
            },
        });

    event.locals.getSession = async () => {
        return await getValidatedSession(event.locals.supabase);
    }


    /** Image proxy in locals */
    event.locals.image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    })
}