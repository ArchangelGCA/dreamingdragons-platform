<script>
    import { Auth } from '@supabase/auth-ui-svelte'
    import { ThemeSupa } from '@supabase/auth-ui-shared'
    import Seo from "sk-seo";

    const seo = {
        title: 'Roses In The Flames | Login',
        description: 'Register or Login to Roses In The Flames from this page.',
        siteName: 'Roses In The Flames | Tales',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA'
    }

    export let data;
</script>

<!--
<svelte:head>
    <title>User - Login</title>
</svelte:head>
-->

<Seo {...seo} />

<div class="row justify-content-center pt-4 pb-3">
    <div class="col">
        <div class="row">
            <div class="col-12">
                <h1 class="text-center">Login/Register</h1>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-8 col-md-6 col-xxl-4 border border-light-subtle bg-dark-subtle bg-opacity125 rounded-4 my-4">
                <Auth
                        supabaseClient={data.supabase}
                        view="magic_link"
                        redirectTo={`${data.url}/auth/callback`}
                        showLinks={false}
                        appearance={{ theme: ThemeSupa, style: { input: 'color: #fff' } }}
                />
            </div>
        </div>
    </div>
</div>
