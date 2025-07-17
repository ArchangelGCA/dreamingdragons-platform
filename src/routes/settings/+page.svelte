<script>
    import {deserialize} from '$app/forms';
    import Avatar from '$lib/components/profile/Avatar.svelte';
    import {toast} from "$lib/components/svelte-toast";
    import Cover from "$lib/components/profile/Cover.svelte";
    import {invalidateAll} from "$app/navigation";
    import {onMount} from "svelte";
    import {browser} from "$app/environment";

    let analyticsEnabled = $state();

    onMount(() => {
        if (browser) {
            analyticsEnabled = window.localStorage.getItem('analyticsEnabled') === 'true';
        }
    });

    /** @type {{data: any}} */
    let {data} = $props();

    let {
        session,
        profile = {full_name: '', username: '', website: '', avatar_url: '', cover_url: ''},
    } = $state(data);
    $effect(() => {
        ({session, profile} = data);
    });

    let avatarUrl = $derived(profile ? profile.avatar_url : '');
    let coverUrl = $derived(profile ? profile.cover_url : '');
    let loading = $state(false);
    let password = $state('');
    let loadingPassword = $state(false);
    let isActiveUpdate = false;
    let isActiveShowFavourites = false;
    let isActiveNewsletter = false;

    async function handleProfileUpdate(e) {
        e.preventDefault();
        if (isActiveUpdate) return;
        isActiveUpdate = true;

        // Get data from form
        const formData = new FormData(e.target);

        const response = await fetch('?/update', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#c800ff',
                    }
                });
                await invalidateAll();
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

    async function handleNewsletter(e) {
        e.preventDefault();
        if (isActiveNewsletter) return;
        isActiveNewsletter = true;

        const formData = new FormData();
        formData.append('newsletter', !profile.newsletter);

        const response = await fetch('?/newsletter', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
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

        await invalidateAll();
        isActiveNewsletter = false;
    }

    async function handleShowFavourites(e) {
        e.preventDefault();
        if (isActiveShowFavourites) return;
        isActiveShowFavourites = true;

        const formData = new FormData();
        formData.append('showFavourites', profile.show_favourites ? 'false' : 'true');

        const response = await fetch('?/showfavourites', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
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

        await invalidateAll();
        isActiveShowFavourites = false;
    }

    async function handlePasswordUpdate(e) {
        e.preventDefault();
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
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                        '--toastProgressBackground': '#c800ff',
                    }
                });
                password = '';
                await invalidateAll();
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
</script>

<div class="container py-2" style="min-height: 70vh">
    <div class="row">
        <div class="col">
            <p class="h2 fw-bolder">Settings</p>
        </div>
    </div>
    {#if !session}
        <div class="row">
            <div class="col">
                <div class="alert alert-danger" role="alert">
                    You are not logged in. Please <a href="/login">login</a> to view more settings.
                </div>
            </div>
        </div>
    {/if}

    {#if session}
        <!-- Avatar -->
        <div class="row mt-2 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Profile Picture</p>
                <p class="text-muted">Update your profile picture</p>
            </div>
            <div class="col-12">
                <form class="form" method="post" action="?/update">
                    <Avatar url={avatarUrl} size={6}
                            upload={() => {invalidateAll()}}/>
                </form>
            </div>
        </div>
        <!-- Cover -->
        <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 mt-3">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Cover Picture</p>
                <p class="text-muted">Update your profile cover image</p>
            </div>
            <div class="col-12">
                <Cover url={coverUrl} uploadComplete={() => {invalidateAll()}}/>
            </div>
        </div>
        <!-- Account details - Profile -->
        <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 pb-2 mt-3">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Account Details</p>
                <p class="text-muted">Update your account details</p>
            </div>
            <div class="col-12 mt-2">
                <form class="form" method="post" action="?/update" onsubmit={handleProfileUpdate}>
                    <div class="row gy-1">
                        <div class="col-12 mb-3">
                            <label for="email" class="form-label">Email 📧</label>
                            <input id="email" type="text" bind:value={session.user.email} disabled
                                   class="form-control"/>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="fullName" class="form-label">Full Name 🪧</label>
                            <input id="fullName" name="fullName" type="text" bind:value={profile.full_name}
                                   class="form-control"/>
                            <input type="hidden" name="fullName" value={profile.full_name}/>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="username" class="form-label">Username<span class="text-danger-emphasis">*</span>
                                🪟</label>
                            <input id="username" name="username" type="text" bind:value={profile.username}
                                   class="form-control"/>
                            <input type="hidden" name="username" value={profile.username}/>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="website" class="form-label">Website 🌐</label>
                            <input id="website" name="website" type="url" bind:value={profile.website}
                                   class="form-control"/>
                            <input type="hidden" name="website" value={profile.website}/>
                        </div>
                        <div class="col-12 mb-3">
                            <input
                                    type="submit"
                                    class="btn btn-purple"
                                    value={loading ? 'Loading...' : 'Save'}
                                    disabled={loading}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <!-- Security -->
        <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 mt-3">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Galleries</p>
                <p class="text-muted">Manage your galleries</p>
            </div>
            <div class="col-12 mt-2">
                <a href="/settings/galleries" class="btn btn-purple text-decoration-none pb-1 rounded-3">
                    Manage Galleries
                </a>
            </div>
        </div>
        <!-- Security -->
        <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 mt-3">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Security</p>
                <p class="text-muted">Manage your password and security settings</p>
            </div>
            <!-- Collapse Password Button -->
            <div class="col-12 mt-2">
                <button class="btn btn-purple pb-1 rounded-3" type="button" data-bs-toggle="collapse"
                        data-bs-target="#passwordCollapse" aria-expanded="false" aria-controls="collapseExample">
                    Change Password
                </button>
            </div>
            <div class="collapse" id="passwordCollapse">
                <!-- Warning saying to make sure to use strong password -->
                <div class="col-12 mt-3">
                    <div class="alert alert-warning" role="alert">
                        Make sure to use a strong password that you haven't used before.
                    </div>
                </div>
                <div class="col-12 mt-2">
                    <form class="form" method="post" action="?/updatepassword" onsubmit={handlePasswordUpdate}>
                        <div class="row gy-1">
                            <div class="col-12 mb-2">
                                <label for="password" class="form-label">New Password 🔒</label>
                                <input id="password" name="password" type="password" class="form-control"
                                       bind:value={password}/>
                            </div>
                            <div class="col-12">
                                <input
                                        type="submit"
                                        class="btn btn-purple"
                                        value={loadingPassword ? 'Loading...' : 'Update Password'}
                                        disabled={loadingPassword}
                                />
                            </div>
                            <input type="hidden" name="password" value={password}/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    {/if}
    <!-- Privacy Settings -->
    <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 mt-3">
        <div class="col-12">
            <p class="h4 fw-bold mb-0">Privacy Settings</p>
            <p class="text-muted">Manage your privacy preferences</p>
        </div>
        <div class="col-12 mt-2">
            {#if session}
                <div class="row justify-content-between mb-2 my-auto">
                    <div class="col-auto my-auto">
                        <span class="fw-semibold">Show Favorites</span>
                    </div>
                    <div class="col-auto">
                        <div class="form-check form-switch">
                            <input class="form-check-input fs-5" type="checkbox" id="showFavouritesSwitch"
                                   bind:checked={profile.show_favourites} onclick={handleShowFavourites}>
                            <input type="hidden" name="showFavourites" value={profile.show_favourites}/>
                        </div>
                    </div>
                </div>
                <div class="row justify-content-between mb-2">
                    <div class="col-auto my-auto">
                        <span class="fw-semibold">Newsletter</span>
                    </div>
                    <div class="col-auto">
                        <div class="form-check form-switch">
                            <input class="form-check-input fs-5" type="checkbox" id="newsletterSwitch"
                                   bind:checked={profile.newsletter} onclick={handleNewsletter}>
                            <input type="hidden" name="newsletter" value={profile.newsletter}/>
                        </div>
                    </div>
                </div>
            {/if}
            <div class="row justify-content-between mb-2">
                <div class="col-auto my-auto">
                    <span class="fw-semibold">Necessary Cookies</span>
                </div>
                <div class="col-auto">
                    <div class="form-check form-switch">
                        <input class="form-check-input fs-5" type="checkbox" id="necessaryCookiesSwitch" checked
                               disabled>
                    </div>
                </div>
            </div>
            <div class="row justify-content-between">
                <div class="col-auto my-auto">
                    <span class="fw-semibold">Analytics</span>
                </div>
                <div class="col-auto">
                    <div class="form-check form-switch">
                        <input class="form-check-input fs-5" type="checkbox" id="analyticsSwitch"
                               bind:checked={analyticsEnabled} onclick={handleAnalytics}>
                        <input type="hidden" name="analyticsEnabled" value={analyticsEnabled}/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {#if session}
        <!-- Logout -->
        <div class="row mt-4 border border-light border-opacity-10 bg-black bg-opacity-10 rounded-4 p-3 py-4 mt-3">
            <div class="col-12">
                <p class="h4 fw-bold mb-0">Logout</p>
                <p class="text-muted">Sign out from your account</p>
            </div>
            <div class="col-12 mt-2">
                <form class="form" method="post" action="?/logout" onsubmit={handleSignOut}>
                    <div class="row gy-1">
                        <div class="col-12">
                            <label class="btn btn-logout" for="logout">
                                <i class="fa-solid fa-right-from-bracket me-1"></i> {loading ? 'Loading ...' : 'Logout'}
                            </label>
                            <input
                                    class="d-none"
                                    type="submit"
                                    id="logout"
                                    disabled={loading}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    {/if}
</div>

<style>

    .btn-purple {
        background-color: #5c00a6;
        color: #fff;
    }

    .btn-purple:hover {
        background-color: #4a0086;
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

    /*
    .bg-animated-gradient {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
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

    .form-check-label {
        color: #f6e6ff;
    }
    */

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