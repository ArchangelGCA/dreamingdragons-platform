import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { STORJ_ACCESS_KEY, STORJ_ENDPOINT, STORJ_SECRET_KEY } from "$env/static/private";
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit";
import { S3Client } from "@aws-sdk/client-s3";

// Create an S3 client
const s3 = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: STORJ_ACCESS_KEY,
        secretAccessKey: STORJ_SECRET_KEY
    },
    endpoint: STORJ_ENDPOINT,
});

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: PUBLIC_SUPABASE_URL,
        supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
        event,
    })

    event.locals.s3 = s3;

    /**
     * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
     */
    event.locals.getSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession()
        return session
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range'
        },
    })
}