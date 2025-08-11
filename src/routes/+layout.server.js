import {PUBLIC_IMAGE_PROXY_URL} from "$env/static/public";
import {ORIGIN} from '$env/static/private';

export const load = async ({locals: {getSession}, cookies, url}) => {


    return {
        session: await getSession(),
        image_proxy: PUBLIC_IMAGE_PROXY_URL ?? undefined,
        cookies: cookies.getAll(),
        title: 'DreamingDragons - Platform',
        description: 'Discover amazing content on DreamingDragons!',
        keywords: 'stories, art, community, dreamingdragons',
        canonical: url.origin + url.pathname,
        siteName: 'DreamingDragons',
        imageURL: ORIGIN + '/favicon-192.webp',
        logo: ORIGIN + '/favicon.svg',
        type: 'website',
        twitter: true,
        openGraph: true,
        schemaOrg: true,
        socials: ['https://discord.gg/u6qFjfDDy2', 'https://github.com/ArchangelGCA', 'https://www.deviantart.com/groups/dreamingdragons', 'https://www.deviantart.com/archangelgca', "https://dreamingdragons.net"],
    };
};