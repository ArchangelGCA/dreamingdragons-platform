<script>
    import { Auth } from '@supabase/auth-ui-svelte'
    import { ThemeSupa } from '@supabase/auth-ui-shared'
    import autoAnimate from '@formkit/auto-animate';

    // For convenience, I'll keep this list of theme variables here: https://github.com/supabase-community/auth-ui/blob/main/packages/shared/src/theming/Themes.ts

    /** @type {{data: any}} */
    let { data } = $props();
    let callBackUrl = $derived(data.url + '/auth/callback');

    let view = $state(data.view || 'magic_link');
    let finalView = $derived(view);
    let signup = $derived(data.signup || false);
</script>

<div class="row justify-content-center pt-4 pb-3">
    <div class="col">
        <div class="row">
            <div class="col-12 text-center mb-4">
                <h1 class="h2">🌹 Welcome to DreamingDragons - Tales!</h1>
                {#if finalView === 'sign_in' || (finalView === 'magic_link' && !signup)}
                    <p class="h5">😎 Please, login to continue.</p>
                {:else if (finalView === 'sign_up' || signup) && finalView !== 'forgotten_password'}
                    <p class="h5">🌹 Please, register to continue.</p>
                {:else if finalView === 'forgotten_password'}
                    <p class="h5">🔒 Please, recover your password.</p>
                {/if}
            </div>
            <!--<div class="col-12 text-center">
                <p class="h1">Authentication</p>
            </div>-->
        </div>
        <div class="row justify-content-center">
            <div class="col-12 text-center" use:autoAnimate>
                {#if finalView === 'magic_link'}
                    <p class="h5">Modern <span class="text-login">Login</span>/<span class="text-register">Register</span> with <span class="text-magic-link"> Magic Link</span> 🪄</p>
                {:else if finalView === 'sign_up'}
                    <p class="h5">Classic <span class="text-register">Register</span> with <span class="text-magic-link">Email and Password</span> 🔐</p>
                {:else if finalView === 'sign_in'}
                    <p class="h5">Classic <span class="text-login">Login</span> with <span class="text-magic-link">Email and Password</span> 🔐</p>
                {:else if finalView === 'forgotten_password'}
                    <p class="h5 text-danger-emphasis">Password Recovery</p>
                {/if}
            </div>
            <div class="col-11 col-md-6 col-xxl-4 bg-purple border border-purple rounded-4 my-4 pt-1" use:autoAnimate>
                <Auth
                        supabaseClient={data.supabase}
                        view={finalView}
                        redirectTo={callBackUrl}
                        showLinks={false}
                        appearance={{ theme: ThemeSupa, style: { input: 'color: #fff'},
                        variables: {
                            default: {
                                colors: {
                                    messageBackground: '#e7fcf1',
                                    messageBorder: '#5c00a6',
                                    messageBackgroundDanger: 'rgba(166,0,44,0.1)',
                                    messageBorderDanger: '#822025',
                                    inputLabelText: 'gray',
                                    messageText: 'gray',
                                    messageTextDanger: 'white',
                                    anchorTextColor: 'gray',
                                    anchorTextHoverColor: 'darkgray',
                                    brandButtonText: 'white',
                                    defaultButtonText: 'white',
                                    dividerBackground: 'rgba(92,0,166,0.5)',
                                    inputText: 'white',
                                    inputPlaceholder: 'darkgray',
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
                                },
                                space: {
                                    spaceSmall: '4px',
                                    spaceMedium: '8px',
                                    spaceLarge: '16px',
                                    labelBottomMargin: '8px',
                                    anchorBottomMargin: '4px',
                                    emailInputSpacing: '4px',
                                    socialAuthSpacing: '4px',
                                    buttonPadding: '10px 15px',
                                    inputPadding: '10px 15px',
                                },
                                fontSizes: {
                                    baseBodySize: '13px',
                                    baseInputSize: '14px',
                                    baseLabelSize: '14px',
                                    baseButtonSize: '14px',
                                },
                                fonts: {
                                    bodyFontFamily: `Comfortaa, serif`,
                                    buttonFontFamily: `Comfortaa, serif`,
                                    inputFontFamily: `Comfortaa, serif`,
                                    labelFontFamily: `Comfortaa, serif`,
                                },
                                borderWidths: {
                                    inputBorderWidth: '1px',
                                    buttonBorderWidth: '1px',
                                },
                                radii: {
                                    borderRadiusButton: '20px',
                                    buttonBorderRadius: '4px',
                                    inputBorderRadius: '10px',
                                },
                            }
                        }
                        }
                        }
                        providers={['google', 'discord', 'twitter']}
                        socialLayout="horizontal"
                />
            </div>
        </div>
        <div class="row justify-content-center" use:autoAnimate>
            {#if finalView === "forgotten_password"}
                <div class="col-11 col-md-6 col-xxl-4 bg-purple border border-purple rounded-4 mb-4 px-3 py-2 pt-3 main-div main-div1" use:autoAnimate>
                    <p class="h5 text-danger-emphasis">Password Recovery</p>
                    <p class="h6">You'll receive an email with a link allowing you to login. Once you're in, you should head to <a class="link" href="/settings">settings</a> and change your password!</p>
                </div>
            {/if}
            <div class="col-12 text-center">
                {#if finalView === "magic_link"}
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_up"}>
                        Classic Register
                    </button>
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_in"}>
                        Classic Login
                    </button>
                {:else if finalView === "sign_up"}
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_in"}>
                        Classic Login
                    </button>
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "magic_link"}>
                        Modern Login/Register 🪄
                    </button>
                    <button class="btn btn-link text-danger-emphasis text-decoration-none" onclick={() => view = "forgotten_password"}>
                        Forgot Password?
                    </button>
                {:else if finalView === "sign_in"}
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_up"}>
                        Classic Register
                    </button>
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "magic_link"}>
                        Modern Login/Register 🪄
                    </button>
                    <button class="btn btn-link text-danger-emphasis text-decoration-none" onclick={() => view = "forgotten_password"}>
                        Forgot Password?
                    </button>
                {:else if finalView === "forgotten_password"}
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_in"}>
                        Classic Login
                    </button>
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "magic_link"}>
                        Modern login and register 🪄
                    </button>
                    <button class="btn btn-link text-white text-decoration-none" onclick={() => view = "sign_up"}>
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
</style>
