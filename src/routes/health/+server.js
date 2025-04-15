export const prerender = true

export const GET = async () => {
    // Return a Response 200 success
    return new Response('OK', { status: 200, statusText: 'OK' });
}