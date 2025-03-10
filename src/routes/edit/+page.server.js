/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
    runtime: 'edge'
};

export const load = async ({}) => {
    return {
        title: 'DreamingDragons - Book Error',
        description: 'Book error.',
        index: false
    }
}
