import adapter from "@sveltejs/adapter-vercel";
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
    }),
  },
  compilerOptions: {
    warningFilter: (warning) => warning.code !== 'state_referenced_locally',
    preserveComments: true
  }
};

export default config;
