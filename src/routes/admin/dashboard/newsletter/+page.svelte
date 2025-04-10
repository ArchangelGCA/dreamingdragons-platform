<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";

    let {data} = $props();
    let {audience} = $derived(data);

    let isAdding = $state(false);
    let isFetchingUsers = $state(false);
    let users = $state(null);
    let progress = $state(-1);
    let delay = 300;

    async function handleAdd(e) {
        e.preventDefault();
        if (isAdding) return;

        isAdding = true;

        let toastId = null;

        toastId = toast.push('Adding user...', {
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': 'white',
            },
            duration: 5000,
        });

        const formData = new FormData();
        const email = e.target.value || e.target.querySelector('#email').value;

        formData.append('email', email);

        const response = await fetch('?/addUserToAudience', {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                audience.push(result.data.body.user);
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': 'white',
                    },
                    duration: 5000,
                });
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': 'white',
                    },
                    duration: 5000,
                });
            }
        }

        isAdding = false;
    }

    async function handleAddAll(e) {
        e.preventDefault();
        if (isAdding) return;

        isAdding = true;

        let toastId = null;

        toastId = toast.push('Adding all users...', {
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': 'white',
            },
            duration: 100000,
        });

        progress = 0;

        // Add each user, waiting for each to finish
        for (let user of users) {
            const formData = new FormData();
            formData.append('email', user.email);

            const response = await fetch('?/addUserToAudience', {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    audience.push(result.data.body.user);
                } else {
                    toast.push(result.data.body.message, {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': 'white',
                        },
                        duration: 5000,
                    });
                }
            }
            progress = Math.round((users.indexOf(user) + 1) / users.length * 100);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        toast.pop(toastId);

        isAdding = false;
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

        let toastId = null;

        toastId = toast.push('Fetching users...', {
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': 'white',
            },
            duration: 5000,
        });

        const response = await fetch('?/getUsersOnPlatform', {
            method: 'POST',
            body: new FormData()
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                // Remove unverified users
                result.data.body.users = result.data.body.users.filter(user => user.user_metadata.email_verified);
                // Remove users with username starting with "Please update"
                for (let user of result.data.body.users) {
                    if (user.username) {
                        if (user.username.startsWith('Please update')) result.data.body.users = result.data.body.users.filter(u => u.id !== user.id);
                    } else {
                        result.data.body.users = result.data.body.users.filter(u => u.id !== user.id);
                    }
                    if (user.username && user.can_upload === false) {
                        result.data.body.users = result.data.body.users.filter(u => u.id !== user.id);
                    }
                }
                users = result.data.body.users;
                toast.push(users.length + ' Users fetched successfully!', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': 'white',
                    },
                    duration: 5000,
                });
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': 'white',
                    },
                    duration: 5000,
                });
            }
        }

        isFetchingUsers = false;
    }
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Audience</h2>
    </div>
</div>

<div class="row gy-2">
    <div class="col-12 col-md-6">
        <div class="card bg-custom bg-opacity-25 rounded-3">
            <div class="card-body">
                <h3 class="card-title">Total Users</h3>
                <p class="card-text h1">{audience ? audience.length : 0}</p>
            </div>
        </div>
    </div>
    <div class="col-12 col-md-6">
        <div class="card bg-custom bg-opacity-25 rounded-3">
            <div class="card-body">
                <h3 class="card-title">Subscribed Users</h3>
                <p class="card-text h1">{audience ? audience.filter(user => !user.unsubscribed).length : 0}</p>
            </div>
        </div>
    </div>
</div>

<!-- Actions section, like adding a user to audience or removing it -->
<div class="row mt-3">
    <div class="col-12 text-center">
        <h3>Actions</h3>
    </div>
</div>

<div class="row gy-2">
    <div class="col-12 col-md-6">
        <div class="card bg-custom bg-opacity-25 rounded-3">
            <div class="card-body">
                <h3 class="card-title">Add User</h3>
                <form onsubmit={handleAdd}>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" placeholder="Email" required>
                    </div>
                    <button type="submit" class="btn btn-custom">{isAdding ? 'Adding...' : 'Add'}</button>
                </form>
            </div>
        </div>
    </div>
    <!-- Fetch verified users from platform, and do actions like adding them to audience -->
    <div class="col-12 col-md-6">
        <div class="card bg-custom bg-opacity-25 rounded-3">
            <div class="card-body" use:autoAnimate>
                <h3 class="card-title">Fetch Users (Platform)</h3>
                <form onsubmit={fetchUsers}>
                    <button type="submit" class="btn btn-custom">{isFetchingUsers ? 'Fetching...' : 'Fetch'}</button>
                </form>
                <!-- Show fetched users and a button to add them to audience -->
                {#if users && users.length > 0}
                    <div class="mt-3" style="overflow-y: auto; height: 50vh">
                        <h4 class="text-center">Users fetched</h4>
                        <ul class="list-group">
                            {#each users as user}
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    {user.username}
                                    <button class="btn btn-custom" onclick={handleAdd} value={user.email}>Add</button>
                                </li>
                            {/each}
                        </ul>
                    </div>
                    <!-- Button to add all fetched users to audience -->
                    <button class="btn btn-custom mt-3" onclick={handleAddAll}>Add all users</button>
                    <!-- Progress bar -->
                    {#if progress >= 0 && isAdding}
                        <div class="progress mt-3" role="progressbar" aria-label="Adding All">
                            <div class="progress-bar" role="progressbar" style="width: {progress}%"
                                 aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .bg-custom {
        background: #1f002e;
    }

    .btn-custom {
        background: #7F13BDFF;
        color: white;
    }

    .btn-custom:hover {
        background: #7F13BDBF;
        color: white;
    }
</style>
