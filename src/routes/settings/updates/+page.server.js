import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID } from '$env/static/private';
import { Resend } from 'resend';

export const actions = {
    // Register to mailing list
    subscribe: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email');

        if (!email || email === '') {
            return {
                status: 400,
                body: {
                    message: 'Email is required!'
                }
            }
        }

        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                status: 400,
                body: {
                    message: 'Invalid email!'
                }
            }
        }

        const resend = new Resend(PRIVATE_RESEND_API_KEY);

        // Get contacts from audience
        const audienceList = await resend.contacts.list({
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });


        // Check if email is already registered
        if (audienceList.data.data.length > 0) {
            const isEmailRegistered = audienceList.data.data.find(contact => contact.email === email);
            if (isEmailRegistered) {
                if (!isEmailRegistered.unsubscribed) {
                    return {
                        status: 400,
                        body: {
                            message: 'Email is already subscribed!'
                        }
                    }
                } else {

                   // Update contact to subscribed
                    await resend.contacts.update({
                        id: isEmailRegistered.id,
                        audienceId: PRIVATE_RESEND_AUDIENCE_ID,
                        email: email,
                        unsubscribed: false,
                    });

                    return {
                        status: 200,
                        body: {
                            message: 'Successfully subscribed to mailing list!'
                        }
                    }
                }
            }
        }

        // extract content before @ in the email and use it as firstname and lastname
        const nameAndLastname = email.split('@')[0];

        await resend.contacts.create({
            email: email,
            firstname: nameAndLastname,
            lastname: nameAndLastname,
            unsubscribed: false,
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });

        return {
            status: 200,
            body: {
                message: 'Successfully subscribed to mailing list!'
            }
        }
    }
}