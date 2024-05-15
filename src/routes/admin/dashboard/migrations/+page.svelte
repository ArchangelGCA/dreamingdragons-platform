<script>
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";
    import Seo from "sk-seo";

    let isMigrating = false;

    async function handleMigrationAvatars() {
        if (isMigrating) return;
        if (!confirm('Are you sure you want to migrate avatars?')) return;

        isMigrating = true;

        const toastId = toast.push('Migrating avatars...', {
            theme: {
                '--toastBackground': '#851919',
                '--toastBody': '#fff',
                '--toastProgress': '#fff',
            },
            duration: 100000,
        });

        const formData = new FormData();

        const response = await fetch('?/migrate_avatars', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Avatars migrated successfully!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            } else {
                toast.push('Failed to migrate avatars!', {
                    theme: {
                        '--toastBackground': '#ff0000',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            }
        } else {
            toast.push('Failed to migrate avatars!', {
                theme: {
                    '--toastBackground': '#ff0000',
                    '--toastBody': '#fff',
                    '--toastProgress': '#fff',
                },
            });
        }

        isMigrating = false;
    }

    async function handleMigrationCovers(){
        if (isMigrating) return;
        if (!confirm('Are you sure you want to migrate covers?')) return;

        isMigrating = true;

        const toastId = toast.push('Migrating covers...', {
            theme: {
                '--toastBackground': '#851919',
                '--toastBody': '#fff',
                '--toastProgress': '#fff',
            },
            duration: 100000,
        });

        const formData = new FormData();

        const response = await fetch('?/migrate_covers', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Covers migrated successfully!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            } else {
                toast.push('Failed to migrate covers!', {
                    theme: {
                        '--toastBackground': '#ff0000',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            }
        } else {
            toast.push('Failed to migrate covers!', {
                theme: {
                    '--toastBackground': '#ff0000',
                    '--toastBody': '#fff',
                    '--toastProgress': '#fff',
                },
            });
        }

        isMigrating = false;
    }

    const seo = {
        title: 'Admin - Migrations',
        description: 'Admin Migrations dashboard for Roses in The Flames platform.',
        siteName: 'Roses in The Flames - Platform',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA',
        index: false
    };
</script>

<Seo {...seo} />

<div class="row mb-2">
    <div class="col text-center">
        <h2>Migrations</h2>
        <p class="text-danger alert alert-danger">DO NOT USE! MIGRATIONS HAVE ALREADY BEEN RAN!</p>
    </div>
</div>

<div class="row gy-3">
    <div class="col-12">
        <div class="card">
            <div class="card-header">⚠️ Migrate Avatars</div>
            <div class="card-body text-center">
                <p class="card-text">Migrate avatars from the old system to the new system.</p>
                <button type="button" class="btn btn-purple disabled" disabled on:click={handleMigrationAvatars}>Migrate Avatars</button>
            </div>
        </div>
    </div>
    <!-- migrate covers -->
    <div class="col-12">
        <div class="card">
            <div class="card-header">⚠️ Migrate Covers</div>
            <div class="card-body text-center">
                <p class="card-text">Migrate covers from the old system to the new system.</p>
                <button type="button" class="btn btn-purple disabled" disabled on:click={handleMigrationCovers}>Migrate Covers</button>
            </div>
        </div>
    </div>
</div>

<style>
    .btn-purple {
        background-color: #6f42c1;
        border-color: #6f42c1;
    }

    .btn-purple:hover {
        background-color: #5a3ac5;
        border-color: #5438c4;
    }
</style>