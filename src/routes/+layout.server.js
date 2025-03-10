import {PUBLIC_IMAGE_PROXY_URL} from "$env/static/public";

export const load = async ({locals: {getSession}, cookies}) => {
    const {session} = await getSession();

    const image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return {
        session,
        image_proxy,
        cookies: cookies.getAll(),
    };
};