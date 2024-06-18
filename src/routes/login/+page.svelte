<script>
    import { Auth } from '@supabase/auth-ui-svelte'
    import { ThemeSupa } from '@supabase/auth-ui-shared'
    import Seo from "sk-seo";
    import autoAnimate from '@formkit/auto-animate';

    // For convenience, I'll keep this list of theme variables here: https://github.com/supabase-community/auth-ui/blob/main/packages/shared/src/theming/Themes.ts

    export let data;

    $: view = data.view || 'magic_link';
    $: signup = data.signup || false;
</script>

<Seo
    title="Roses in The Flames - Login"
    description="Register or Login to Roses in The Flames."
    siteName="Roses in The Flames - Platform"
    imageURL="https://tales.rosesintheflames.com/favicon.webp"
    author="ArchangelGCA"
    index="true"
/>

<div class="row justify-content-center pt-4 pb-3">
    <div class="col">
        <div class="row">
            <div class="col-12 text-center mb-4">
                <h1 class="h2">🌹 Welcome to Roses in The Flames - Tales!</h1>
                {#if view === 'sign_in' || (view === 'magic_link' && !signup)}
                    <p class="h5">😎 Please, login to continue.</p>
                {:else if (view === 'sign_up' || signup) && view !== 'forgotten_password'}
                    <p class="h5">🌹 Please, register to continue.</p>
                {:else if view === 'forgotten_password'}
                    <p class="h5">🔒 Please, recover your password.</p>
                {/if}
            </div>
            <div class="col-12 text-center">
                <p class="h1">Authentication</p>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-12 text-center" use:autoAnimate>
                {#if view === 'magic_link'}
                    <p class="h5">Modern <span class="text-login">Login</span>/<span class="text-register">Register</span> with <span class="text-magic-link"> Magic Link</span> 🪄</p>
                {:else if view === 'sign_up'}
                    <p class="h5">Classic <span class="text-register">Register</span></p>
                {:else if view === 'sign_in'}
                    <p class="h5">Classic <span class="text-login">Login</span></p>
                {:else if view === 'forgotten_password'}
                    <p class="h5 text-danger-emphasis">Password Recovery</p>
                {/if}
            </div>
            <div class="col-11 col-md-6 col-xxl-4 bg-purple border border-purple rounded-4 my-4 pt-1" use:autoAnimate>
                <Auth
                        supabaseClient={data.supabase}
                        view={view}
                        redirectTo={`${data.url}/auth/callback`}
                        showLinks={false}
                        appearance={{ theme: ThemeSupa, style: { input: 'color: #fff'},
                        variables: {
                            dark: {
                                colors: {
                                    brand: '#5c00a6',
                                    brandAccent: '#7000cc',
                                    inputBackground: 'rgba(92,0,166,0.5)',
                                    inputBorder: '#5c00a6',
                                    inputBorderHover: '#9819ff',
                                    inputBorderFocus: '#ae48ff',
                                    defaultButtonBackground: 'rgba(92,0,166,0.5)',
                                    defaultButtonBackgroundHover: 'rgba(112,0,204,0.5)',
                                    defaultButtonBorderHover: '#7000cc',
                                    defaultButtonBorder: '#5c00a6',
                                }
                            }
                        }
                        }
                        }
                        theme="dark"
                        providers={['google', 'discord', 'twitter']}
                        socialLayout="horizontal"
                />
            </div>
        </div>
        <div class="row justify-content-center" use:autoAnimate>
            {#if view === "forgotten_password"}
                <div class="col-11 col-md-6 col-xxl-4 bg-purple border border-purple rounded-4 mb-4 px-3 py-2 pt-3" use:autoAnimate>
                    <p class="h5 text-danger-emphasis">Password Recovery</p>
                    <p class="h6">You'll receive an email with a link allowing you to login. Once you're in, you should head to <a class="link" href="/settings">settings</a> and change your password!</p>
                </div>
            {/if}
            <div class="col-12 text-center">
                {#if view === "magic_link"}
                    <button class="btn btn-link text-white" on:click={() => view = "sign_up"}>
                        Classic Register
                    </button>
                    <button class="btn btn-link text-white" on:click={() => view = "sign_in"}>
                        Classic Login
                    </button>
                {:else if view === "sign_up"}
                    <button class="btn btn-link text-white" on:click={() => view = "sign_in"}>
                        Classic Login
                    </button>
                    <button class="btn btn-link text-white" on:click={() => view = "magic_link"}>
                        Modern Login/Register 🪄
                    </button>
                    <button class="btn btn-link text-danger-emphasis" on:click={() => view = "forgotten_password"}>
                        Forgot Password?
                    </button>
                {:else if view === "sign_in"}
                    <button class="btn btn-link text-white" on:click={() => view = "sign_up"}>
                        Classic Register
                    </button>
                    <button class="btn btn-link text-white" on:click={() => view = "magic_link"}>
                        Modern Login/Register 🪄
                    </button>
                    <button class="btn btn-link text-danger-emphasis" on:click={() => view = "forgotten_password"}>
                        Forgot Password?
                    </button>
                {:else if view === "forgotten_password"}
                    <button class="btn btn-link text-white" on:click={() => view = "sign_in"}>
                        Classic Login
                    </button>
                    <button class="btn btn-link text-white" on:click={() => view = "magic_link"}>
                        Modern login and register 🪄
                    </button>
                    <button class="btn btn-link text-white" on:click={() => view = "sign_up"}>
                        Classic Register
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .border-purple {
        border-color: #5c00a6 !important;
    }

    .text-login {
        color: #C800FFFF;
    }

    .text-register {
        color: #FF00FFFF;
    }

    .text-magic-link {
        color: #b056ff;
    }

    .bg-purple {
        background-color: rgba(92, 0, 166, 0.15) !important;
    }
</style>
