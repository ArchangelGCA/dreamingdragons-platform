import adapter from "@sveltejs/adapter-vercel";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Hybrid runtime (deliberate): Bun 1.4.2 locally for installs/dev/builds,
    // stable Node.js 24 for Vercel Functions. The explicit pin is required —
    // adapter-vercel auto-detection reads Bun's Node-compat version string
    // (reports Node 26) and throws. The Bun Functions runtime was evaluated
    // (Public Beta, no source maps/bytecode cache, native-module risk for
    // sharp uploads) and rejected for production for now.
    adapter: adapter({
      runtime: 'nodejs24.x'
    }),
  },
  compilerOptions: {
    warningFilter: (warning) => warning.code !== 'state_referenced_locally',
    preserveComments: true
  }
};

export default config;
