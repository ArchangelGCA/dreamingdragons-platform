<script>
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import {PUBLIC_PROFILE_ICON_RESIZE_WIDTH} from "$env/static/public";

    /** @type {{size?: number, url: any}} */
    let {size = 10, url, upload} = $props();

    let avatarUrl = $derived(url);
    let uploading = $state(false);
    let files = $state();
    let isImageLoaded = $state(false);

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

<div class="row">
    <div class="col-auto text-center">
        {#if avatarUrl}
            {#if !isImageLoaded}
                <div class="placeholder-glow m-0 p-0">
                    <div class="placeholder rounded-circle bg-light-subtle rounded-3 w-100 h-100">
                        <img
                                src={avatarUrl}
                                alt={avatarUrl ? 'Avatar' : 'No image'}
                                loading="lazy"
                                class="avatar image rounded-circle"
                                style="height: {size}em; width: {size}em;"
                                onload={() => isImageLoaded = true}
                        />
                    </div>
                </div>
            {:else}
                <img
                        src={avatarUrl}
                        alt={avatarUrl ? 'Avatar' : 'No image'}
                        loading="lazy"
                        class="avatar image rounded-circle"
                        style="height: {size}em; width: {size}em;"
                />
            {/if}
        {:else}
            <div class="img-thumbnail mx-auto" style="height: {size}em; width: {size}em;"></div>
        {/if}
    </div>
    <div class="col-auto my-auto">
        <label class="btn btn-purple p-2 rounded-3" for="single" style="font-size: 0.9em;">
            <i class="fa-solid fa-camera mx-1"></i> {uploading ? 'Uploading ...' : 'Change Avatar'}
        </label>
        <input class="d-none"
               type="file"
               id="single"
               accept="image/*"
               bind:files
               onchange={uploadAvatar}
               disabled={uploading}
        />
        <br>
        <small class="text-light text-opacity-50"
               style="font-size: 0.75em;">Recommended: {PUBLIC_PROFILE_ICON_RESIZE_WIDTH}x{PUBLIC_PROFILE_ICON_RESIZE_WIDTH}px</small>
        <input type="hidden" name="avatarUrl" value={url}/>
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