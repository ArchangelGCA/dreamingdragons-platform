import {ORIGIN} from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({url}) {

    // Test URL for oEmbed discovery
    const testUrl = `${ORIGIN}/content/1345`;

    return {
        title: 'oEmbed Test Page',
        description: 'Test page for oEmbed functionality',
        testUrl,
        oembedUrl: `${ORIGIN}/oembed?url=${encodeURIComponent(testUrl)}&format=json`
    };
}
