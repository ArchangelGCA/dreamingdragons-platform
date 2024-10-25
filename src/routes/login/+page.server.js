import { redirect } from '@sveltejs/kit'

export const load = async ({ url, locals: { getSession } }) => {
    const {session} = await getSession()
    let title = 'Roses in The Flames - Login';
    let description = 'Register/Login to Roses in The Flames.';

    // if the user is already logged in return them to the account page
    if (session) {
        throw redirect(303, '/profile')
    }

    let view = 'magic_link';
    let signup = false;

    if (url.searchParams.has('view')) {
        view = url.searchParams.get('view');
        if (view === 'sign_up') {
            signup = true;
            title = 'Roses in The Flames - Signup';
            description = 'Register to Roses in The Flames';
        }
    }
    if (url.searchParams.has('signup')) {
        signup = true;
        title = 'Roses in The Flames - Signup';
        description = 'Register to Roses in The Flames';
    }

    return {
        url: url.origin,
        view,
        signup,
        title,
        description
    }
}
