import { redirect } from '@sveltejs/kit'

export const load = async ({ url, locals: { getSession } }) => {
    const {session} = await getSession()
    let title = 'DreamingDragons - Login';
    let description = 'Register/Login to DreamingDragons.';

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
            title = 'DreamingDragons - Signup';
            description = 'Register to DreamingDragons';
        }
    }
    if (url.searchParams.has('signup')) {
        signup = true;
        title = 'DreamingDragons - Signup';
        description = 'Register to DreamingDragons';
    }

    return {
        url: url.origin,
        view,
        signup,
        title,
        description
    }
}
