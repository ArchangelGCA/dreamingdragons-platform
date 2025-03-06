import { PRIVATE_RESEND_API_KEY, PRIVATE_RESEND_AUDIENCE_ID } from '$env/static/private';
import { Resend } from 'resend';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
    runtime: 'edge'
};

export const load = async ({}) => {
    return {
        index: true,
        title: 'DreamingDragons - Newsletter',
        description: 'Subscribe to the official DreamingDragons Newsletter.',
    }
}


export const actions = {
    // Register to Newsletter
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
                            message: 'Successfully subscribed to Newsletter!'
                        }
                    }
                }
            }
        }

        // extract content before @ in the email and use it as firstname and lastname
        const nameAndLastname = email.split('@')[0];

        const result = await resend.contacts.create({
            email: email,
            firstname: nameAndLastname,
            lastname: nameAndLastname,
            unsubscribed: false,
            audienceId: PRIVATE_RESEND_AUDIENCE_ID
        });

        if (!result || result.data === null || result.data.id === null) {
            return {
                status: 400,
                body: {
                    message: 'Failed to subscribe to Newsletter!'
                }
            }
        }

        const unsubscribeLink = `https://tales.archangelgca.eu/settings/updates/unsubscribe?id=${result.data.id}`;
        const discordLink = 'https://discord.gg/u6qFjfDDy2';
        const yearCopyright = new Date().getFullYear();

        const htmlEmail = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
            
                    .container {
                        width: 80%;
                        margin: auto;
                        overflow: hidden;
                    }
            
                    .header {
                        background: #33a8a5;
                        color: white;
                        padding: 10px 0;
                        text-align: center;
                    }
            
                    .header h1 {
                        margin: 0;
                    }
            
                    .content {
                        padding: 30px;
                        background-color: white;
                        color: #333;
                        line-height: 1.6em;
                    }
            
                    .button {
                        display: inline-block;
                        background-color: #33a8a5;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 10px 0;
                    }
            
                    .footer {
                        background: #333;
                        color: white;
                        text-align: center;
                        padding: 10px;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to the DreamingDragons Newsletter!</h1>
                    </div>
                    <div class="content">
                        <h2>You've successfully signup to our Newsletter!</h2>
                        <p>If you wish to unsubscribe, please click the button or use the link above: </p>
                        <a href="${unsubscribeLink}" class="button">Unsubscribe</a>
                        <p><a href="${unsubscribeLink}">${unsubscribeLink}</a></p>
                        <p>Please keep this link safe! It has your <b>unsubscribe code</b>!</p>
                        <p>If you have any issues, please reach us on our <a href="${discordLink}">Discord Server!</a></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${yearCopyright} DreamingDragons. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const sent = await resend.emails.send({
            from: 'DD <newsletter@tales.archangelgca.eu>',
            to: [email],
            subject: 'Welcome to the Newsletter of DreamingDragons!',
            html: htmlEmail,
            tags: [
                {
                    name: 'category',
                    value: 'updates'
                },
            ],
        });

        console.log('Email sent:', sent);

        return {
            status: 200,
            body: {
                message: 'Successfully subscribed to Newsletter!'
            }
        }
    }
}