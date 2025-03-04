/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
    runtime: 'edge'
};

export const load = async ({}) => {
    return {
        title: 'DreamingDragons - Terms of Service',
        description: 'Terms of Service of DreamingDragons (DD).',
    }
}