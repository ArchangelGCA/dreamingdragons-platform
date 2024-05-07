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

    // For convenience, I'll keep this list of theme variables here: https://github.com/supabase-community/auth-ui/blob/main/packages/shared/src/theming/Themes.ts

    export let data;
</script>

<Seo {...seo} />

<div class="row justify-content-center pt-4 pb-3">
    <div class="col">
        <div class="row">
            <div class="col-12">
                <h1 class="text-center">Login/Register</h1>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-11 col-md-6 col-xxl-4 bg-purple border border-purple rounded-4 my-4 pt-1">
                <Auth
                        supabaseClient={data.supabase}
                        view="magic_link"
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
    </div>
</div>

<style>
    .border-purple {
        border-color: #5c00a6 !important;
    }

    /* Background slightly opacity purple */
    .bg-purple {
        background-color: rgba(92, 0, 166, 0.15) !important;
    }
</style>
