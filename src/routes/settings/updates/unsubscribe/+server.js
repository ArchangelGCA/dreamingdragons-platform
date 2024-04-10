import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID } from '$env/static/private';
import { Resend } from 'resend';

// Example usage: settings/updates/unsubscribe?email=myemailgca@gmail.com
export const GET = async ({ url }) => {
    const email = url.searchParams.get('email');
    const idFromUrl = url.searchParams.get('id');

    if ((!email || email === '') && (!idFromUrl || idFromUrl === '')) {
        return new Response('Email or id is required!', { status: 400 });
    }

    const resend = new Resend(PRIVATE_RESEND_API_KEY);

    let id = null;

    if (idFromUrl && idFromUrl !== '') {

        id = idFromUrl;

        const contact = await resend.contacts.get({
            id: id,
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });

        if (!contact || contact.data === null) {
            return new Response('Contact not found!', { status: 400 });
        }

        if (contact.data.unsubscribed) {
            return new Response('Email is already unsubscribed!', { status: 400 });
        }

    } else {

        const audienceList = await resend.contacts.list({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });

        // Check if email is already registered
        if (audienceList.data.data.length > 0) {
            const isEmailRegistered = audienceList.data.data.find(contact => contact.email === email);
            if (!isEmailRegistered || isEmailRegistered.unsubscribed) {
                return new Response('Email is not subscribed or already unsubscribed!', {status: 400});
            } else {
                id = isEmailRegistered.id;
            }
        }
    }

    await resend.contacts.update({
        id: id,
        audienceId: PRIVATE_RESEND_AUDIENCE_ID,
        email: email,
        unsubscribed: true,
    });

    return new Response('Unsubscribed successfully!', { status: 200 });
}