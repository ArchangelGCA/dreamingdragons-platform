import {redirect} from "@sveltejs/kit";

export const load = async ( { params, locals: { getSession } }) => {
    const session = await getSession();

    if (session) {
        redirect(302,'/profile/' + session.user.id);
    } else {
        redirect(302,'/login');
    }
}