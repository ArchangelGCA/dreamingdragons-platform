import {ORIGIN} from '$app/env/private';

export async function GET() {
    return Response.json({
        version: '1.0',
        title: 'DreamingDragons',
        author_name: 'DreamingDragons',
        author_url: ORIGIN,
        provider_name: 'DreamingDragons',
        provider_url: ORIGIN,
        endpoints: [
            {
                schemes: [
                    `${ORIGIN}/content/*`,
                    `${ORIGIN}/content/*/*`
                ],
                url: `${ORIGIN}/oembed{?url,format,maxwidth,maxheight}`,
                discovery: true
            }
        ]
    });
}
