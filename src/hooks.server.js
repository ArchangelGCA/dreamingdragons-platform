import {PUBLIC_IMAGE_PROXY_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL} from '$env/static/public';
import {SUPABASE_JWT_SECRET} from '$env/static/private';
import {createServerClient} from "@supabase/ssr";
import * as jose from 'jose';

export const handle = async ({event, resolve}) => {
    event.locals.supabase = createServerClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
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
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession();

        if (!session) return {session: null};

        try {
            const { payload: decoded } = await jose.jwtVerify(session.access_token, new TextEncoder().encode(SUPABASE_JWT_SECRET))

            return {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: decoded.exp,
                expires_in: decoded.exp - Math.round(Date.now() / 1000),
                token_type: 'bearer',
                session: {
                    user: {
                        app_metadata: decoded.app_metadata ?? {},
                        aud: 'authenticated',
                        created_at: '',
                        id: decoded.sub,
                        email: decoded.email,
                        phone: decoded.phone,
                        user_metadata: {
                        //    avatar_url: decoded.user_metadata?.avatar_url,
                        //    nickname: decoded.user_metadata?.nickname,
                        },
                        is_anonymous: decoded.is_anonymous
                    }
                }
            };
        } catch (err) {
            return null;
        }
    }

    /** Image proxy in locals */
    event.locals.image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    })
}