import {generateToken} from "$lib/utils/gcatokens.js";

export const GET = async ({ url, locals: {getSession} }) => {
    const {session} = await getSession();

    if (!session) {
        return new Response(
            JSON.stringify({
                error: 'Unauthorized'
            }),
            {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    const token = generateToken();

    return new Response(
        JSON.stringify({
            token
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}