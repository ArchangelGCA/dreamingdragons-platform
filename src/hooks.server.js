import {PUBLIC_IMAGE_PROXY_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL} from '$app/env/public';
import {createServerClient} from "@supabase/ssr";
import {getValidatedSession} from "#lib/utils/gcacommons.js";

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


    /** Image proxy in locals (deprecated, external optimizer decommissioned).
     * PUBLIC_IMAGE_PROXY_URL is declared as an optional variable in src/env.js,
     * so an unset value resolves to `undefined` instead of failing at startup. */
    event.locals.image_proxy = PUBLIC_IMAGE_PROXY_URL;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
        // SSR theme: paint the cookie-saved palette (deep default, vault
        // legacy) on <html> so server HTML matches the client's first frame.
        transformPageChunk: ({ html }) => {
            const theme = event.cookies.get('dd-theme');
            const valid = theme === 'vault' ? 'vault' : 'deep';
            return html.replace('<html', `<html data-theme="${valid}"`);
        },
    })
}