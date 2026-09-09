<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import {isPlausibleEmail, postAdminAction} from "$lib/utils/admin.js";

    let {data} = $props();
    // Writable derived: local adds assign locally, server data re-evaluates on navigation.
    let audience = $derived(data.audience ?? []);
    let subscribedCount = $derived(audience.filter((user) => !user.unsubscribed).length);

    let isAdding = $state(false);
    let isFetchingUsers = $state(false);
    let users = $state(null);
    let usersCapped = $state(false);
    let progress = $state(-1);
    let emailInput = $state('');
    let delay = 300;

    function notify(message, ok = true) {
        toast.push(message, {
            theme: {
                '--toastBackground': ok ? '#5c00a6' : '#f44336',
                '--toastColor': 'white',
            },
            duration: 5000,
        });
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (isAdding) return;

        const email = String(emailInput ?? '').trim();
        if (!isPlausibleEmail(email)) {
            notify('Enter a valid email address.', false);
            return;
        }

        isAdding = true;
        const toastId = toast.push('Adding user...', {
            theme: { '--toastBackground': '#5c00a6', '--toastColor': 'white' },
            duration: 5000,
        });

        try {
            const formData = new FormData();
            formData.append('email', email);
            const result = await postAdminAction('addUserToAudience', formData);
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                audience = [...audience, { email, unsubscribed: false }];
                emailInput = '';
                notify(result.data.body.message);
            } else {
                notify(result.data?.body?.message ?? 'Could not add user.', false);
            }
        } catch {
            toast.pop(toastId);
            notify('Could not add user.', false);
        } finally {
            isAdding = false;
        }
    }

    async function handleAddOne(email) {
        if (isAdding) return;
        if (!isPlausibleEmail(email)) {
            notify('Invalid email address.', false);
            return;
        }
        isAdding = true;
        try {
            const formData = new FormData();
            formData.append('email', email);
            const result = await postAdminAction('addUserToAudience', formData);
            if (result.type === 'success' && result.data.status === 200) {
                audience = [...audience, { email, unsubscribed: false }];
                notify(result.data.body.message);
            } else {
                notify(result.data?.body?.message ?? 'Could not add user.', false);
            }
        } finally {
            isAdding = false;
        }
    }

    async function handleAddAll(e) {
        e.preventDefault();
        if (isAdding || !users?.length) return;

        isAdding = true;
        const toastId = toast.push('Adding all users...', {
            theme: { '--toastBackground': '#5c00a6', '--toastColor': 'white' },
            duration: 100000,
        });
        progress = 0;

        try {
            for (let i = 0; i < users.length; i += 1) {
                const user = users[i];
                const formData = new FormData();
                formData.append('email', user.email);
                const result = await postAdminAction('addUserToAudience', formData);
                if (result.type === 'success' && result.data.status === 200) {
                    audience = [...audience, { email: user.email, unsubscribed: false }];
                }
                progress = Math.round(((i + 1) / users.length) * 100);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        } finally {
            toast.pop(toastId);
            isAdding = false;
        }
    }

    /*
    Adds users to audience if they are not already in it
    To add users to audience, we check if their email is in audience first, and then we add them using a formData with user objects, each user object in formData should have these fields:
    {
       email:
       firstName: (defaults to null)
       lastName: (defaults to null)
       unsubscribed: (default to false)
    }
     */

    async function fetchUsers(e) {
        e.preventDefault();
        if (isFetchingUsers) return;

        isFetchingUsers = true;
        const toastId = toast.push('Fetching users...', {
            theme: { '--toastBackground': '#5c00a6', '--toastColor': 'white' },
            duration: 5000,
        });

        try {
            const result = await postAdminAction('getUsersOnPlatform', new FormData());
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                let fetched = result.data.body.users ?? [];
                // Remove unverified users
                fetched = fetched.filter((user) => user.user_metadata?.email_verified);
                // Remove placeholder / blocked accounts
                fetched = fetched.filter((user) => {
                    if (!user.username) return false;
                    if (String(user.username).startsWith('Please update')) return false;
                    if (user.can_upload === false) return false;
                    return true;
                });
                // Skip emails already in the audience
                const known = new Set(audience.map((c) => String(c.email ?? '').toLowerCase()));
                fetched = fetched.filter((user) => !known.has(String(user.email ?? '').toLowerCase()));
                users = fetched;
                usersCapped = Boolean(result.data.body.capped);
                notify(
                    users.length + ' users ready to add.' + (usersCapped ? ' (fetch capped at 2,000 — repeat to cover more)' : '')
                );
            } else {
                notify(result.data?.body?.message ?? 'Could not fetch users.', false);
            }
        } catch {
            toast.pop(toastId);
            notify('Could not fetch users.', false);
        } finally {
            isFetchingUsers = false;
        }
    }
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Audience</h2>
        <p class="text-secondary small mb-0">Newsletter contacts via Resend.</p>
    </div>
</div>

<div class="row gy-2">
    <div class="col-12 col-md-6">
        <div class="card rounded-4 bg-black bg-opacity-25 border-purple">
            <div class="card-body">
                <h3 class="card-title h6 text-secondary">Total contacts</h3>
                <p class="card-text h1 mb-0">{audience ? audience.length : 0}</p>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-6">
        <div class="card rounded-4 bg-black bg-opacity-25 border-purple">
            <div class="card-body">
                <h3 class="card-title h6 text-secondary">Subscribed</h3>
                <p class="card-text h1 mb-0">{subscribedCount}</p>
            </div>
        </div>
    </div>
</div>

<!-- Actions section, like adding a user to audience or removing it -->
<div class="row mt-3">
    <div class="col-12 text-center">
        <h3 class="h5">Actions</h3>
    </div>
</div>

<div class="row gy-2">
    <div class="col-12 col-md-6">
        <div class="card rounded-4 bg-black bg-opacity-25 border-purple">
            <div class="card-body">
                <h3 class="card-title h6">Add user</h3>
                <form onsubmit={handleAdd}>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" placeholder="Email" required bind:value={emailInput} maxlength="254">
                    </div>
                    <button type="submit" class="btn btn-purple w-100" disabled={isAdding}>{isAdding ? 'Adding...' : 'Add'}</button>
                </form>
            </div>
        </div>
    </div>
    <!-- Fetch verified users from platform, and do actions like adding them to audience -->
    <div class="col-12 col-md-6">
        <div class="card rounded-4 bg-black bg-opacity-25 border-purple">
            <div class="card-body" use:autoAnimate>
                <h3 class="card-title h6">Fetch users</h3>
                <p class="small text-secondary">Verified creators not yet in the audience.</p>
                <form onsubmit={fetchUsers}>
                    <button type="submit" class="btn btn-purple w-100" disabled={isFetchingUsers}>{isFetchingUsers ? 'Fetching...' : 'Fetch'}</button>
                </form>
                <!-- Show fetched users and a button to add them to audience -->
                {#if users && users.length > 0}
                    <div class="mt-3" style="overflow-y: auto; max-height: 50vh">
                        <h4 class="text-center h6">Ready ({users.length}){usersCapped ? ' · capped' : ''}</h4>
                        <ul class="list-group">
                            {#each users as user (user.id)}
                                <li class="list-group-item d-flex justify-content-between align-items-center gap-2">
                                    <span class="text-truncate">{user.username}</span>
                                    <button class="btn btn-sm btn-purple flex-shrink-0" onclick={() => handleAddOne(user.email)} disabled={isAdding}>Add</button>
                                </li>
                            {/each}
                        </ul>
                    </div>
                    <!-- Button to add all fetched users to audience -->
                    <button class="btn btn-purple mt-3 w-100" onclick={handleAddAll} disabled={isAdding}>Add all users</button>
                    <!-- Progress bar -->
                    {#if progress >= 0 && isAdding}
                        <div class="progress mt-3" role="progressbar" aria-label="Adding all users" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar" style="width: {progress}%"></div>
                        </div>
                    {/if}
                {:else if users && users.length === 0}
                    <p class="small text-secondary mt-3 mb-0">Everyone eligible is already in the audience.</p>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .border-purple {
        border-color: var(--primary-color) !important;
    }
</style>
