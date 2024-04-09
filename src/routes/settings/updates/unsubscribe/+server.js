import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID } from '$env/static/private';
import { Resend } from 'resend';

// Example usage: settings/updates/unsubscribe?email=myemailgca@gmail.com
export const GET = async ({ url }) => {
    const email = url.searchParams.get('email');

    if (!email || email === '') {
        return new Response('Email is required!', { status: 400 });
    }

    const resend = new Resend(PRIVATE_RESEND_API_KEY);

    // Get contacts from audience
    const audienceList = await resend.contacts.list({
        audienceId: PRIVATE_RESEND_AUDIENCE_ID
    });

    let id = null;

    // Check if email is already registered
    if (audienceList.data.data.length > 0) {
        const isEmailRegistered = audienceList.data.data.find(contact => contact.email === email);
        if (!isEmailRegistered || isEmailRegistered.unsubscribed) {
            return new Response('Email is not subscribed or already unsubscribed!', { status: 400 });
        } else {
            id = isEmailRegistered.id;
            /*if (isEmailRegistered.unsubscribed) {
                return new Response('Email is already unsubscribed!', { status: 400 });
            }*/
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