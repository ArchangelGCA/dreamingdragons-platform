<script>
    import {toast} from "$lib/components/svelte-toast";
    import AdminPageHeader from "$lib/components/admin/AdminPageHeader.svelte";
    import AdminStat from "$lib/components/admin/AdminStat.svelte";
    import autoAnimate from "@formkit/auto-animate";
    import {isPlausibleEmail, postAdminAction} from "$lib/utils/admin.js";
    import {notifyError, notifySuccess, notifyWorking} from "$lib/utils/admin-notify.js";

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

    async function handleAdd(e) {
        e.preventDefault();
        if (isAdding) return;

        const email = String(emailInput ?? '').trim();
        if (!isPlausibleEmail(email)) {
            notifyError('Enter a valid email address.');
            return;
        }

        isAdding = true;
        const toastId = notifyWorking('Adding user...');

        try {
            const formData = new FormData();
            formData.append('email', email);
            const result = await postAdminAction('addUserToAudience', formData);
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                audience = [...audience, { email, unsubscribed: false }];
                emailInput = '';
                notifySuccess(result.data.body.message);
            } else {
                notifyError(result.data?.body?.message ?? 'Could not add user.');
            }
        } catch {
            toast.pop(toastId);
            notifyError('Could not add user.');
        } finally {
            isAdding = false;
        }
    }

    async function handleAddOne(email) {
        if (isAdding) return;
        if (!isPlausibleEmail(email)) {
            notifyError('Invalid email address.');
            return;
        }
        isAdding = true;
        try {
            const formData = new FormData();
            formData.append('email', email);
            const result = await postAdminAction('addUserToAudience', formData);
            if (result.type === 'success' && result.data.status === 200) {
                audience = [...audience, { email, unsubscribed: false }];
                users = users.filter((u) => u.email !== email);
                notifySuccess(result.data.body.message);
            } else {
                notifyError(result.data?.body?.message ?? 'Could not add user.');
            }
        } finally {
            isAdding = false;
        }
    }

    async function handleAddAll(e) {
        e.preventDefault();
        if (isAdding || !users?.length) return;

        isAdding = true;
        const toastId = notifyWorking('Adding all users...');
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
            users = [];
            notifySuccess('All fetched users added.');
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
        const toastId = notifyWorking('Fetching users...');

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
                notifySuccess(
                    users.length + ' users ready to add.' + (usersCapped ? ' (fetch capped at 2,000 — repeat to cover more)' : '')
                );
            } else {
                notifyError(result.data?.body?.message ?? 'Could not fetch users.');
            }
        } catch {
            toast.pop(toastId);
            notifyError('Could not fetch users.');
        } finally {
            isFetchingUsers = false;
        }
    }
</script>

<AdminPageHeader title="Newsletter" subtitle="Grow the Resend audience from verified creators." />

<div class="row g-3 mb-3">
    <div class="col-6">
        <AdminStat icon="fa-users" label="Contacts" value={audience.length} href="/admin/dashboard/newsletter" linkLabel="Audience list" tip="Total contacts in Resend" />
    </div>
    <div class="col-6">
        <AdminStat icon="fa-envelope-circle-check" label="Subscribed" value={subscribedCount} href="/admin/dashboard/newsletter" linkLabel="Subscribed" tip="Contacts still subscribed" accent="success" />
    </div>
</div>

<div class="row g-3">
    <div class="col-12 col-md-6">
        <div class="admin-card p-3">
            <h3 class="h6">Add user</h3>
            <form onsubmit={handleAdd}>
                <label for="email" class="form-label small">Email</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="email" placeholder="creator@example.com" required bind:value={emailInput} maxlength="254" />
                    <button type="submit" class="btn btn-purple" disabled={isAdding}>{isAdding ? 'Adding…' : 'Add'}</button>
                </div>
            </form>
        </div>
    </div>
    <!-- Fetch verified users from platform, and do actions like adding them to audience -->
    <div class="col-12 col-md-6">
        <div class="admin-card p-3" use:autoAnimate>
            <h3 class="h6">Fetch creators</h3>
            <p class="small text-secondary">Verified, eligible creators not yet in the audience.</p>
            <form onsubmit={fetchUsers}>
                <button type="submit" class="btn btn-purple w-100" disabled={isFetchingUsers}>{isFetchingUsers ? 'Fetching…' : 'Fetch'}</button>
            </form>
            <!-- Show fetched users and a button to add them to audience -->
            {#if users && users.length > 0}
                <div class="mt-3" style="overflow-y: auto; max-height: 50vh">
                    <h4 class="h6 text-center">Ready <span class="tnum">({users.length})</span>{usersCapped ? ' · capped' : ''}</h4>
                    <ul class="list-group">
                        {#each users as user (user.id)}
                            <li class="list-group-item d-flex justify-content-between align-items-center gap-2">
                                <span class="text-truncate small">{user.username}</span>
                                <button class="btn btn-sm btn-purple flex-shrink-0" onclick={() => handleAddOne(user.email)} disabled={isAdding}>Add</button>
                            </li>
                        {/each}
                    </ul>
                </div>
                <!-- Button to add all fetched users to audience -->
                <button class="btn btn-purple mt-3 w-100" onclick={handleAddAll} disabled={isAdding}>Add all users</button>
                <!-- Progress bar -->
                {#if progress >= 0 && isAdding}
                    <div class="progress mt-3" role="progressbar" aria-label="Adding all users" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style="background-color: var(--dd-track);">
                        <div class="progress-bar" style="width: {progress}%; background-color: var(--dd-accent);"></div>
                    </div>
                {/if}
            {:else if users && users.length === 0}
                <p class="small text-secondary mt-3 mb-0">Everyone eligible is already in the audience.</p>
            {/if}
        </div>
    </div>
</div>
