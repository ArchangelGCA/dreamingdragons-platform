<script>
    import {tooltip} from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import {invalidateAll} from "$app/navigation";

    export let data;

    let {panic, tooltipConfig} = data;
    $: ({panic, tooltipConfig} = data);
    let isPanicAction = false;


    async function handlePanic() {
        if (isPanicAction) return;
        isPanicAction = true;

        let toastId = null;
        let response = null;

        const formData = new FormData();

        if (panic.length === 0 || !panic[0].is_active) {
            toastId = toast.push('Enabling panic mode...', {
                theme: {
                    '--toastBackground': '#bd135a',
                    '--toastColor': 'white',
                },
                duration: 5000,
            });

            response = await fetch('?/enable_panic', {
                method: 'POST',
                body: formData
            });
        } else {
            toastId = toast.push('Disabling panic mode...', {
                theme: {
                    '--toastBackground': '#bd135a',
                    '--toastColor': 'white',
                },
                duration: 5000,
            });

            response = await fetch('?/disable_panic', {
                method: 'POST',
                body: formData
            });
        }

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });
                invalidateAll();
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during toggle action', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        isPanicAction = false;
    }
</script>

<div class="row text-center mb-2 mt-1">
    <div class="col-md-12">
        <h2>Admin Dashboard (ALPHA)</h2>
    </div>
</div>
<div class="row mb-3">
    <div class="col-md-12">
        <div class="card bg-black bg-opacity-25 text-white border-purple">
            <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 purple"></i>
                <h5 class="card-title">Panic Mode: <span
                        class="{panic[0].is_active ? 'text-danger' : 'text-warning'}">{panic[0].is_active ? 'Enabled' : 'Disabled'}</span>
                </h5>
                <button class="btn btn-panic {isPanicAction ? 'disabled': ''}" on:click={handlePanic}
                        use:tooltip={{...tooltipConfig}}
                        title="Toggle panic mode">{panic[0].is_active ? 'Disable Panic Mode' : 'Enable Panic Mode'}</button>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-lg-6 col-md-12 mb-3">
        <div class="card bg-black bg-opacity-25 text-white border-purple">
            <div class="card-body text-center">
                <i class="fas fa-users fa-3x mb-3 purple"></i>
                <h5 class="card-title">Manage Users</h5>
                <p class="card-text">Click here to manage users</p>
                <a href="/admin/dashboard/users" class="btn btn-users">Go to Users</a>
            </div>
        </div>
    </div>
    <div class="col-lg-6 col-md-12 mb-3">
        <div class="card bg-black bg-opacity-25 text-white border-purple-content">
            <div class="card-body text-center">
                <i class="fas fa-file-alt fa-3x mb-3 purple-content"></i>
                <h5 class="card-title">Manage Content</h5>
                <p class="card-text">Click here to manage content</p>
                <a href="/admin/dashboard/content" class="btn btn-content">Go to Content</a>
            </div>
        </div>
    </div>
</div>

<style>
    .purple {
        color: #bd135a;
    }

    .border-purple {
        border-color: #bd135a;
    }

    .btn-users {
        background-color: #bd135a;
        color: white;
    }

    .btn-users:hover {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }

    .btn-users:active {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }

    .purple-content {
        color: #7f13bd;
    }

    .border-purple-content {
        border-color: #7f13bd;
    }

    .btn-content {
        background-color: #7f13bd;
        color: white;
    }

    .btn-content:hover {
        background-color: rgba(127, 19, 189, 0.75);
        color: white;
    }

    .btn-content:active {
        background-color: rgba(127, 19, 189, 0.75);
        color: white;
    }

    .btn-panic {
        background-color: #bd135a;
        color: white;
    }

    .btn-panic:hover {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }

    .btn-panic:active {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }
</style>