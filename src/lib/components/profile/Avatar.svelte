<script>
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import {PUBLIC_PROFILE_ICON_RESIZE_WIDTH} from "$env/static/public";

    /** @type {{size?: number, url: any}} */
    let { size = 10, url, upload } = $props();

    let avatarUrl = $derived(url);
    let uploading = $state(false);
    let files = $state();

    const uploadAvatar = async () => {
        try {
            uploading = true;

            // Check if file is selected.
            if (!files || files.length === 0) {
                toast.push('Error: No file selected', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                uploading = false;
                return;
            }

            // Check if image.
            if (!files[0].type.startsWith('image/')) {
                toast.push('Error: File is not an image', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                uploading = false;
                return;
            }

            const file = files[0];
            const fileExt = 'webp';
            const filePath = `${Math.random()}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('filePath', filePath);

            const response = await fetch('?/profileicon', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type !== 'success' || result.data.status !== 200) {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff',
                    },
                });
                uploading = false;
                return;
            }

            toast.push('Image uploaded successfully', {
                theme: {
                    '--toastBackground': '#5c00a6',
                    '--toastColor': '#fff',
                },
            });
            setTimeout(() => {
                upload();
            }, 100)
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            uploading = false;
        }
    }
</script>

<div class="col-auto text-center">
    {#if avatarUrl}
        <img
                src={avatarUrl}
                alt={avatarUrl ? 'Avatar' : 'No image'}
                loading="lazy"
                class="avatar image"
                style="height: {size}em; width: {size}em;"
        />
    {:else}
        <div class="img-thumbnail mx-auto" style="height: {size}em; width: {size}em;" ></div>
    {/if}
    <div class="col-12 text-center mt-1">
        <small class="text-light text-opacity-50">Recommended Max resolution: {PUBLIC_PROFILE_ICON_RESIZE_WIDTH}x{PUBLIC_PROFILE_ICON_RESIZE_WIDTH} - 1:1</small>
    </div>
    <input type="hidden" name="avatarUrl" value={url} />

    <div class="text-center" style="min-width: {size}em;">
        <label class="btn btn-purple w-100 mt-1" for="single">
            {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input class="d-none"
                type="file"
                id="single"
                accept="image/*"
                bind:files
                onchange={uploadAvatar}
                disabled={uploading}
        />
    </div>
</div>
<style>
    .btn-purple {
        background-color: #5c00a6;
        color: #fff;
    }

    .btn-purple:hover {
        background-color: #4a0086;
    }
</style>