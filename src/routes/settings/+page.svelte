<script>
    import { enhance } from '$app/forms';
    import Avatar from '$lib/components/profile/Avatar.svelte';
    import {toast} from "@zerodevx/svelte-toast";

    export let data;

    let { session, supabase, profile } = data;
    $: ({ session, supabase, profile } = data);

    let profileForm;
    let fullName = '';
    let username = '';
    let website = '';
    let avatarUrl = '';
    let loading = false;
    let isAccordionOpen = false;
    let isAvatarAccordionOpen = false;

    if (profile !== null) {
        try {
            fullName = profile.full_name;
        } catch (e) {
            fullName = '';
        }
        try {
            username = profile.username;
        } catch (e2) {
            username = '';
        }
        try {
            website = profile.website;
        } catch (e3) {
            website = '';
        }
        try {
            avatarUrl = profile.avatar_url;
        } catch (e4) {
            avatarUrl = '';
        }
    }

    const handleSubmit = () => {
        loading = true;
        return async () => {
            loading = false;
            toast.push('Profile updated!', {
                theme: {
                    '--toastBackground': '#029fcc',
                    '--toastProgressBackground': '#38d971',
                    '--toastProgressText': '#ffffff',
                    '--toastText': '#868686',
                },
            });
        };
    };

    const handleSignOut = () => {
        loading = true
        return async ({ update }) => {
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
</script>

<div class="container-fluid px-0" style="min-height: 70vh">
    <div class="row mt-3 mb-3 mx-1">
        <div class="col-12 bg-light-subtle bg-opacity-0 rounded-4 pt-2 mx-auto">
            <h1 class="text-center">Profile Settings</h1>
        </div>
    </div>
    <hr class="mx-1 mb-0">
    <div class="row mx-1">
        <div class="col-12 col-md-6">
            <div class="row justify-content-center pt-2 pb-0 pb-md-2">
                <!-- Avatar Accordion -->
                <div class="col-12 px-1">
                    <div class="accordion" id="avatarAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="avatarHeading">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#avatarCollapse" aria-expanded={isAvatarAccordionOpen} aria-controls="avatarCollapse" on:click={() => isAvatarAccordionOpen = !isAvatarAccordionOpen}>
                                    Avatar
                                </button>
                            </h2>
                            <div id="avatarCollapse" class="accordion-collapse collapse" aria-labelledby="avatarHeading" data-bs-parent="#avatarAccordion">
                                <div class="accordion-body">
                                    <form class="form" method="post" action="?/update" use:enhance={handleSubmit} bind:this={profileForm}>
                                        <input type="hidden" name="fullName" value={fullName} />
                                        <input type="hidden" name="username" value={username} />
                                        <input type="hidden" name="website" value={website} />
                                        <div class="row justify-content-center">
                                            <Avatar {supabase} bind:url={avatarUrl} size={10} on:upload={() => {profileForm.requestSubmit();}}/>
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
            <div class="row justify-content-center pt-2 pb-2">
                <div class="col-12 px-1">
                    <div class="accordion" id="profileAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="profileHeading">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#profileCollapse" aria-expanded={isAccordionOpen} aria-controls="profileCollapse" on:click={() => isAccordionOpen = !isAccordionOpen}>
                                    Profile Details
                                </button>
                            </h2>
                            <div id="profileCollapse" class="accordion-collapse collapse" aria-labelledby="profileHeading" data-bs-parent="#profileAccordion">
                                <div class="accordion-body">
                                    <form class="form" method="post" action="?/update" use:enhance={handleSubmit} bind:this={profileForm}>
                                        <div class="row">
                                            <div class="col-12 mb-3">
                                                <label for="email" class="form-label">Email</label>
                                                <input id="email" type="text" value={session.user.email} disabled class="form-control" />
                                            </div>

                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="fullName" class="form-label">Full Name</label>
                                                <input id="fullName" name="fullName" type="text" value={fullName} class="form-control" />
                                            </div>

                                            <div class="col-12 col-md-6 mb-3">
                                                <label for="username" class="form-label">Username</label>
                                                <input id="username" name="username" type="text" value={username} class="form-control" />
                                            </div>

                                            <div class="mb-3">
                                                <label for="website" class="form-label">Website</label>
                                                <input id="website" name="website" type="url" value={website} class="form-control" />
                                            </div>
                                        </div>

                                        <!-- Hidden input for avatar url -->
                                        <input type="hidden" name="avatarUrl" value={avatarUrl} />

                                        <div class="mb-3">
                                            <input
                                                    type="submit"
                                                    class="btn btn-success w-100"
                                                    value={loading ? 'Loading...' : 'Update'}
                                                    disabled={loading}
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row border-top border-light-subtle pt-3 mx-1">
        <div class="col px-1">
            <form method="post" action="?/signout" use:enhance={handleSignOut}>
                <div class="mb-3">
                    <button class="btn btn-outline-danger w-100" disabled={loading}>Sign Out</button>
                </div>
            </form>
        </div>
    </div>
</div>