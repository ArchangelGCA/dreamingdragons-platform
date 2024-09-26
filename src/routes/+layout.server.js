import {PUBLIC_IMAGE_PROXY_URL} from "$env/static/public";
export const load = async ({locals: {supabase, getSession}, cookies}) => {
    const {session, user} = await getSession();
    const image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return {
        session,
        user,
        image_proxy,
        cookies: cookies.getAll(),
    };
};