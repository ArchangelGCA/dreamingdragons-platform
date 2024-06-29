<script>
    import {deserialize, enhance} from '$app/forms';
    import Avatar from '$lib/components/profile/Avatar.svelte';
    import {toast} from "@zerodevx/svelte-toast";
    import {tooltip} from "@svelte-plugins/tooltips";
    import Cover from "$lib/components/profile/Cover.svelte";
    import Seo from "sk-seo";
    import {invalidateAll} from "$app/navigation";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";

    let analyticsEnabled;

    onMount(() => {
        if (browser) {
            analyticsEnabled = window.localStorage.getItem('analyticsEnabled') === 'true';
        }
    });

    export let data;

    let {session, supabase, profile, tooltipConfig} = data;
    $: ({session, supabase, profile, tooltipConfig} = data);

    let avatarUrl = '';
    let coverUrl = '';
    let loading = false;
    let password = '';
    let loadingPassword = false;
    let isAccordionOpen = false;
    let isCoverAccordionOpen = false;
    let isAvatarAccordionOpen = false;
    let isActiveUpdate = false;
    let isActiveShowFavourites = false;
    if (!profile) {
        profile = {
            full_name: '',
            username: '',
            website: '',
            avatar_url: '',
            cover_url: ''
        };
    }

    async function handleProfileUpdate(e){
        if (isActiveUpdate) return;
        isActiveUpdate = true;

        // Get data from form
        const formData = new FormData(e.target);

        const response = await fetch('?/update', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#c800ff',
                    }
                });
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#ff0000',
                    }
                });
            }
        } else {
            toast.push('An error occurred while updating your profile.', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                    '--toastProgressBackground': '#ff0000',
                }
            });
        }
        invalidateAll();
        isActiveUpdate = false;
    }

    const handleSignOut = () => {
        loading = true
        return async ({update}) => {
            loading = false;
            toast.push('You have been signed out!', {
                theme: {
                    '--toastBackground': '#029fcc',
                    '--toastProgressBackground': '#38d971',
                    '--toastProgressText': '#ffffff',
                    '--toastText': '#868686',
                },
            });
            update();
        };
    };

    async function handleAnalytics() {
        analyticsEnabled = !analyticsEnabled;
        if (browser) {
            window.localStorage.setItem('analyticsEnabled', analyticsEnabled);
        }
    }

    async function handleShowFavourites() {
        if (isActiveShowFavourites) return;
        isActiveShowFavourites = true;

        const formData = new FormData();
        formData.append('showFavourites', profile.show_favourites ? 'false' : 'true');

        const response = await fetch('?/showfavourites', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#c800ff',
                    }
                });
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#ff0000',
                    }
                });
            }
        } else {
            toast.push('An error occurred while updating your profile.', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                    '--toastProgressBackground': '#ff0000',
                }
            });
        }

        isActiveShowFavourites = false;
    }

    async function handlePasswordUpdate(){
        if (loadingPassword) return;

        if (!confirm('Are you sure you want to change your password?')) return;

        loadingPassword = true;

        const formData = new FormData();
        formData.append('password', password);

        const response = await fetch('?/updatepassword', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#c800ff',
                    }
                });
                password = '';
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#ff0000',
                    }
                });
            }
        } else {
            toast.push('An error occurred while updating your profile.', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                    '--toastProgressBackground': '#ff0000',
                }
            });
        }

        loadingPassword = false;
    }

    $: if (profile) {
        avatarUrl = profile.avatar_url;
        coverUrl = profile.cover_url;
    }
</script>

<Seo
        title="{(profile && profile.username) ? profile.username : 'Guest'} | Settings"
        index="false"
/>

<div class="container-xxl px-0" style="min-height: 70vh">
    <div class="row mt-3 mb-2 mx-1">
        <div class="col-12 bg-animated-gradient bg-opacity-0 rounded-4 pt-2 mx-auto">
            <h1 class="text-center">Settings</h1>
        </div>
    </div>
    {#if !session}
        <div class="row mt-3 mb-2 mx-1">
            <div class="col-12 bg-animated-gradient bg-opacity-0 rounded-4 pt-2 mx-auto">
                <h2 class="text-center">Please <a class="link-warning text-decoration-none" href="/login">login</a> to access full settings.</h2>
            </div>
        </div>
    {/if}
    <div class="row mx-1 gy-2 pt-2 pb-2">
        {#if session}
            <div class="col-12 col-md-6">
                <div class="row justify-content-center">
                    <!-- Avatar Accordion -->
                    <div class="col-12 px-1">
                        <div class="accordion" id="avatarAccordion">
                            <div class="accordion-item border-0">
                                <h2 class="accordion-header" id="avatarHeading">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#avatarCollapse" aria-expanded={isAvatarAccordionOpen}
                                            aria-controls="avatarCollapse"
                                            on:click={() => isAvatarAccordionOpen = !isAvatarAccordionOpen}
                                            use:tooltip={{...tooltipConfig}} title="Avatar Settings">
                                        {#if !avatarUrl}<i class="fas fa-user me-2"></i>
                                        {:else}
                                            <UserAvatarNavbar url={avatarUrl} username={profile.username} size="20px" classes="me-2"/>
                                        {/if}
                                            Avatar
                                    </button>
                                </h2>
                                <div id="avatarCollapse" class="accordion-collapse collapse"
                                     aria-labelledby="avatarHeading" data-bs-parent="#avatarAccordion">
                                    <div class="accordion-body">
                                        <form class="form" method="post" action="?/update">
                                            <div class="row justify-content-center">
                                                <Avatar url={avatarUrl} size={10}
                                                        on:upload={() => {invalidateAll()}}/>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="row justify-content-center">
                    <div class="col-12 px-1">
                        <div class="accordion" id="profileAccordion">
                            <div class="accordion-item border-0">
                                <h2 class="accordion-header" id="profileHeading">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#profileCollapse" aria-expanded={isAccordionOpen}
                                            aria-controls="profileCollapse"
                                            on:click={() => isAccordionOpen = !isAccordionOpen}
                                            use:tooltip={{...tooltipConfig}} title="Profile Settings">
                                        <i class="fas fa-id-card me-2"></i>Details
                                    </button>
                                </h2>
                                <div id="profileCollapse" class="accordion-collapse collapse"
                                     aria-labelledby="profileHeading" data-bs-parent="#profileAccordion">
                                    <div class="accordion-body">
                                        <form class="form" method="post" action="?/update" on:submit|preventDefault={handleProfileUpdate}>
                                            <div class="row">
                                                <div class="col-12 mb-3">
                                                    <label for="email" class="form-label">Email 📧</label>
                                                    <input id="email" type="text" bind:value={session.user.email} disabled
                                                           class="form-control"/>
                                                </div>

                                                <div class="col-12 col-md-6 mb-3">
                                                    <label for="fullName" class="form-label">Full Name 🪧</label>
                                                    <input id="fullName" name="fullName" type="text" bind:value={profile.full_name}
                                                           class="form-control"/>
                                                </div>

                                                <div class="col-12 col-md-6 mb-3">
                                                    <label for="username" class="form-label">Username<span class="text-danger-emphasis">*</span> 🪟</label>
                                                    <input id="username" name="username" type="text" bind:value={profile.username}
                                                           class="form-control"/>
                                                </div>

                                                <div class="mb-3">
                                                    <label for="website" class="form-label">Website 🌐</label>
                                                    <input id="website" name="website" type="url" bind:value={profile.website}
                                                           class="form-control"/>
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <input
                                                        type="submit"
                                                        class="btn btn-purple w-100"
                                                        value={loading ? 'Loading...' : 'Update'}
                                                        disabled={loading}
                                                />
                                            </div>
                                            <small class="text-muted mb-3">
                                                <span class="text-danger-emphasis">*</span> Required fields
                                            </small>
                                        </form>
                                        <!-- Security section that allows to input new password -->
                                        <div class="row">
                                            <div class="col-12">
                                                <h3 class="text-center">Security</h3>
                                                <form class="form" method="post" action="?/updatepassword" on:submit|preventDefault={handlePasswordUpdate}>
                                                    <div class="mb-3">
                                                        <p class="h5">Change Password:</p>
                                                    </div>
                                                    <div class="mb-3">
                                                        <label for="password" class="form-label">New Password 🔒</label>
                                                        <input id="password" name="password" type="password" class="form-control" bind:value={password}>
                                                    </div>
                                                    <div class="mb-2">
                                                        <input
                                                                type="submit"
                                                                class="btn btn-purple w-100"
                                                                value={loadingPassword ? 'Loading...' : 'Update'}
                                                                disabled={loadingPassword}
                                                        />
                                                    </div>
                                                    <small class="text-muted mb-3">
                                                        Careful! There's no going back!
                                                    </small>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="row justify-content-center">
                    <!-- Cover Accordion -->
                    <div class="col-12 px-1">
                        <div class="accordion" id="coverAccordion">
                            <div class="accordion-item border-0">
                                <h2 class="accordion-header" id="coverHeading">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                            data-bs-target="#coverCollapse" aria-expanded={isCoverAccordionOpen}
                                            aria-controls="avatarCollapse"
                                            on:click={() => isCoverAccordionOpen = !isCoverAccordionOpen}
                                            use:tooltip={{...tooltipConfig}} title="Cover Settings">
                                        {#if !coverUrl}<i class="fas fa-portrait me-2"></i>
                                        {:else}
                                            <UserAvatarNavbar url={coverUrl} username={profile.username} size="20px" classes="me-2"/>
                                        {/if}
                                        Cover
                                    </button>
                                </h2>
                                <div id="coverCollapse" class="accordion-collapse collapse"
                                     aria-labelledby="coverHeading" data-bs-parent="#coverAccordion">
                                    <div class="accordion-body">
                                        <Cover url={coverUrl} on:upload={() => {invalidateAll()}}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        <div class="{session ? 'col-12 col-md-6' : 'col-12'}">
            <div class="row justify-content-center">
                <!-- Privacy Settings Accordion -->
                <div class="col-12 px-1">
                    <div class="accordion" id="privacyAccordion">
                        <div class="accordion-item border-0">
                            <h2 class="accordion-header" id="privacyHeading">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                        data-bs-target="#privacyCollapse" aria-expanded="false"
                                        aria-controls="privacyCollapse">
                                    <i class="fas fa-eye me-2"></i> Privacy
                                </button>
                            </h2>
                            <div id="privacyCollapse" class="accordion-collapse collapse"
                                 aria-labelledby="privacyHeading" data-bs-parent="#privacyAccordion">
                                <div class="accordion-body">
                                    {#if session}
                                        <!-- Check for showing favourites -->
                                        <div class="form-check form-switch mb-2">
                                            <input class="form-check-input" type="checkbox" id="showFavouritesSwitch" bind:checked={profile.show_favourites} on:click={handleShowFavourites}>
                                            <label class="form-check label ps-0" for="showFavouritesSwitch">
                                                🌟 Show Favourites
                                                <i class="fas ms-1 {profile.show_favourites ? 'fa-toggle-on' : 'fa-toggle-off'}" style="color: {profile.show_favourites ? 'green' : 'red'}"></i>
                                            </label>
                                        </div>
                                        <hr class="my-2">
                                    {/if}
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="necessaryCookiesSwitch"
                                               checked disabled>
                                        <label class="form-check-label" for="necessaryCookiesSwitch">
                                            🍪 Necessary Cookies
                                            <i class="fas fa-toggle-on ms-1" style="color: grey;"></i>
                                        </label>
                                    </div>
                                    <div class="form-check form-switch mb-2">
                                        <input class="form-check-input" type="checkbox" id="analyticsSwitch"
                                               bind:checked={analyticsEnabled} on:click={handleAnalytics}>
                                        <label class="form-check-label" for="analyticsSwitch">
                                            📈 Analytics
                                            <i class={analyticsEnabled ? 'fas fa-toggle-on ms-2' : 'fas fa-toggle-off ms-1'}
                                               style="color: {analyticsEnabled ? 'green' : 'red'};"></i>
                                        </label>
                                    </div>
                                    <small class="text-muted">
                                        <i class="fas fa-md fa-circle-info"></i> You can find more info about how we handle your data on our <a class="link-body-emphasis" href="/legal/privacy-policy">privacy policy</a>.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {#if session}
        <div class="row pt-2 mx-1">
            <div class="col px-1">
                <form method="post" action="?/signout" use:enhance={handleSignOut}>
                    <div class="mb-3">
                        <button class="btn btn-logout w-100" disabled={loading} use:tooltip={{...tooltipConfig}}
                                title="Click to Logout">Logout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<style>
    .bg-animated-gradient {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
    }

    .btn-purple {
        background-color: #5c00a6;
        color: #fff;
    }

    .btn-purple:hover {
        background-color: #4a0086;
    }

    .accordion-button {
        background-color: rgba(92, 0, 166, 0.6);
        border: 1px solid rgba(125, 0, 221, 0.7);
        color: #fff;
    }

    .accordion-button:not(.collapsed) {
        background-color: rgba(92, 0, 166, 0.8) !important;
    }

    .accordion-button:focus {
        box-shadow: 0 0 0 0.25rem rgba(92, 0, 166, 0.5);
    }

    .accordion-collapse {
        background-color: rgba(92, 0, 166, 0.3);
    }

    .form-control {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid rgba(125, 0, 221, 0.5);
        color: #f6e6ff;
    }

    .form-control:focus {
        background-color: rgba(92, 0, 166, 0.5);
        border: 1px solid rgba(125, 0, 221, 0.7);
        box-shadow: 0 0 0 0.08rem rgba(125, 0, 221, 0.5);
        color: #f6e6ff;
    }

    .form-control:disabled {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid rgba(125, 0, 221, 0.5);
        color: #6c757d;
    }

    .form-check-input {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid rgba(125, 0, 221);
        color: #f6e6ff;
    }

    .form-check-input:focus {
        box-shadow: 0 0 0 0.08rem rgba(125, 0, 221, 0.5);
    }

    .form-check-input:checked {
        background-color: rgba(92, 0, 166, 0.5);
        border: 1px solid rgba(125, 0, 221, 0.7);
        color: #f6e6ff;
    }

    .form-check-input:disabled {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid rgba(125, 0, 221, 0.5);
        color: #6c757d;
    }

    .form-check-label {
        color: #f6e6ff;
    }

    .btn-logout {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid rgba(125, 0, 221, 0.5);
    }

    .btn-logout:hover {
        background-color: rgba(92, 0, 166, 0.5);
        border: 1px solid rgba(125, 0, 221, 0.7);
        color: #ffffff;
    }

    .btn-logout:focus {
        box-shadow: 0 0 0 0.08rem rgba(125, 0, 221, 0.5);
    }

    @keyframes Gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>