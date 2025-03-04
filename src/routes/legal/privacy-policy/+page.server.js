/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
    runtime: 'edge'
};

export const load = async ({}) => {
    return {
        title: 'DreamingDragons - Privacy Policy',
        description: 'Privacy Policy of DreamingDragons (DD).',
    }
}