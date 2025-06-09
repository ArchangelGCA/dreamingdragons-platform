import {PUBLIC_IMAGE_PROXY_URL} from "$env/static/public";

export const load = async ({locals: {getSession}, cookies, url}) => {
    const {session} = await getSession();

    const image_proxy = PUBLIC_IMAGE_PROXY_URL ?? undefined;

    return {
        session,
        image_proxy,
        cookies: cookies.getAll(),
        title: 'DreamingDragons - Platform',
        description: 'Discover amazing content on DreamingDragons!',
        keywords: 'stories, art, community, dreamingdragons',
        canonical: url.origin + url.pathname,
        siteName: 'DreamingDragons',
        imageURL: `${url.origin}/favicon-192.webp`,
        logo: `${url.origin}/favicon.svg`,
        twitter: true,
        openGraph: true,
        schemaOrg: true,
        socials: ['https://discord.gg/u6qFjfDDy2', 'https://github.com/ArchangelGCA', 'https://www.deviantart.com/groups/dreamingdragons', 'https://www.deviantart.com/archangelgca'],
    };
};