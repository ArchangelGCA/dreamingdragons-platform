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

        if (!contact || contact.data === null || contact.data.unsubscribed) {
            // Generic response to avoid email/contact enumeration.
            return new Response('If this contact was subscribed, it has now been unsubscribed.', { status: 200 });
        }

    } else {

        const audienceList = await resend.contacts.list({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });

        // Check if email is already registered (generic response to avoid enumeration)
        if (audienceList.data.data.length > 0) {
            const isEmailRegistered = audienceList.data.data.find(contact => contact.email === email);
            if (!isEmailRegistered || isEmailRegistered.unsubscribed) {
                return new Response('If this email was subscribed, it has now been unsubscribed.', {status: 200});
            } else {
                id = isEmailRegistered.id;
            }
        } else {
            return new Response('If this email was subscribed, it has now been unsubscribed.', {status: 200});
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