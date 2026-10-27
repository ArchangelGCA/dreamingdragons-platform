import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Explicit environment variable declarations (SvelteKit 3).
 *
 * Every variable the app reads must be declared here. Public variables are
 * importable from `$app/env/public` (client + server) and private ones from
 * `$app/env/private` (server only, enforced at build time).
 *
 * `static: true` inlines the build-time value, which lets bundlers drop dead
 * branches. Use it only for variables that never change between deployments
 * of the same build — Vercel env vars qualify.
 */
export const variables = defineEnvVars({
    // --- Public (shipped to the browser) -------------------------------------
    PUBLIC_SUPABASE_URL: {
        public: true,
        static: true,
        description: 'Supabase project URL.',
    },
    PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
        public: true,
        static: true,
        description: 'Supabase publishable (anon) key.',
    },
    PUBLIC_POCKETBASE_URL: {
        public: true,
        static: true,
        description: 'PocketBase origin used to build public file URLs.',
    },
    PUBLIC_POCKETBASE_URL_IMG_API: {
        public: true,
        static: true,
        description: 'Image API origin for PocketBase-hosted covers and avatars.',
    },
    PUBLIC_CONVERTER_URL: {
        public: true,
        static: true,
        description: 'Client-side image conversion endpoint.',
    },
    PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES: {
        public: true,
        static: true,
        description: 'Maximum accepted cover upload size, in bytes.',
    },
    PUBLIC_COVER_MAX_WIDTH: {
        public: true,
        static: true,
        description: 'Target cover width used by the client-side cropper.',
    },
    PUBLIC_COVER_MAX_HEIGHT: {
        public: true,
        static: true,
        description: 'Target cover height used by the client-side cropper.',
    },
    PUBLIC_COVER_MAX_RESIZE: {
        public: true,
        static: true,
        description: 'Largest cover edge accepted after resizing.',
    },
    PUBLIC_PROFILE_ICON_RESIZE_WIDTH: {
        public: true,
        static: true,
        description: 'Avatar output width (px) after resizing.',
    },
    PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH: {
        public: true,
        static: true,
        description: 'Profile cover output width (px) after resizing.',
    },
    PUBLIC_DEFAULT_NAME: {
        public: true,
        static: true,
        description: 'Display name given to freshly created profiles.',
    },
    PUBLIC_DEFAULT_USERNAME: {
        public: true,
        static: true,
        description: 'Username prefix given to freshly created profiles.',
    },
    PUBLIC_LIKES_FOR_COSMETIC_BADGE: {
        public: true,
        static: true,
        description: 'Like count that unlocks the "popular" badge and glow.',
    },
    PUBLIC_IMAGE_PROXY_URL: {
        public: true,
        description:
            'Deprecated: external image optimizer prefix. Optional — the optimizer was decommissioned in 0.7.0, so an unset value is expected.',
        schema: (value) => value || undefined,
    },

    // --- Private (server only) ----------------------------------------------
    ORIGIN: {
        static: true,
        description: 'Public origin used to build absolute URLs in RSS, oEmbed and SEO tags.',
    },
    SUPABASE_SECRET_KEY: {
        static: true,
        description: 'Supabase secret key for server-side admin queries.',
    },
    PRIVATE_POCKETBASE_EMAIL: {
        static: true,
        description: 'PocketBase superuser e-mail (file storage only).',
    },
    PRIVATE_POCKETBASE_PSW: {
        static: true,
        description: 'PocketBase superuser password (file storage only).',
    },
    PRIVATE_KEY_CONVERTER: {
        static: true,
        description: 'Shared secret for the client-side token generation endpoint.',
    },
    PRIVATE_RESEND_API_KEY: {
        static: true,
        description: 'Resend API key for newsletter and notification e-mails.',
    },
    PRIVATE_RESEND_AUDIENCE_ID: {
        static: true,
        description: 'Resend audience that newsletter subscribers belong to.',
    },
});
