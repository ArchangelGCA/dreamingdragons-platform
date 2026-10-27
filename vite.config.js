import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit({
            compilerOptions: {
                // Runes mode everywhere (the codebase is already fully migrated).
                // Can be removed in Svelte 6, where runes become the only mode.
                runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
                warningFilter: (warning) => warning.code !== 'state_referenced_locally',
                preserveComments: true,
            },

            // Hybrid runtime (deliberate): Bun 1.4.4 locally for installs/dev/builds,
            // stable Node.js 24 for Vercel Functions. The explicit pin is required —
            // adapter-vercel auto-detection reads Bun's Node-compat version string
            // (reports Node 26) and throws. The Bun Functions runtime was evaluated
            // (Public Beta, no source maps/bytecode cache, native-module risk for
            // sharp uploads) and rejected for production for now.
            //
            // paths.origin is intentionally left unset: it would be baked into the
            // build and break CSRF checks on preview deployments, so SvelteKit keeps
            // deriving the origin from the request (Vercel forwards host correctly).
            adapter: adapter({
                runtime: 'nodejs24.x',
            }),
        }),
        devtoolsJson(),
    ],
    server: {
        fs: {
            allow: ['static'],
        },
    },
    // resend's optional React e-mail peer — never installed here (plain HTML
    // e-mails only), so keep it external instead of letting Vite resolve it.
    ssr: {
        external: ['@react-email/render'],
    },
});
