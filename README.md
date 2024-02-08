# Work-in-progress - ritf-svelte

## TODO:
- Database model, hosting and management.
- User authentication.
- Website design and layout.
- Object storage (storing images and other files).
- Email service (for sending notifications and newsletters) (Can't really do).

**Using a VPS would be the best option for hosting the website.**

### Using a VPS:
- Making a /static folder alongside the build nodeapp folder, and using NGINX make it public (route /static), this for storing **IMAGES** and **UPLOADED FILES**.
- Deploying

## AUTHENTICATION:
- We're using Supabase for authentication and database management. For users we're using the basic example: [Link](https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit)

## MANUAL REQUIREMENTS:
- To run the project you must create a `.env` file in the root directory of the project and add the following environment variables:
    - `PUBLIC_SUPABASE_URL` - The URL of your Supabase project.
    - `PUBLIC_SUPABASE_ANON_KEY` - The anonymous key of your Supabase project.
- Add to your static folder tinymce, you first [download](https://www.tiny.cloud/get-tiny/) it and then extract the zip, open folders `tinymce/js/tinymce` and move this last subfolder tinymce to `/static`.

#### Example .env:
```env
PUBLIC_SUPABASE_URL=https://<your_project_id>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<your_public_anon_key>
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
