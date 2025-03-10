<script>
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";
    import { PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH } from "$env/static/public"

    /** @type {{url: any}} */
    let { url, uploadComplete } = $props();

    let coverUrl = $derived(url && url !== '' ? url : '');
    let uploading = $state(false);
    let files = $state();

    async function uploadCover() {
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

            const response = await fetch('?/profilecover', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type !== 'success' || result.data.status !== 200) {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                uploading = false;
                return;
            }

            toast.push('Cover updated successfully!', {
                theme: {
                    '--toastBackground': '#029fcc',
                    '--toastProgressBackground': '#38d971',
                    '--toastProgressText': '#ffffff',
                    '--toastText': '#868686',
                },
            });
            uploadComplete();
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            uploading = false;
        }
    }
</script>

<div class="row justify-content-center">
    <div class="col-12 text-center">
        {#if coverUrl}
            <img src={coverUrl} alt="Cover" class="img-fluid" style="max-height: 50vh;" />
        {:else}
            <div class="alert alert-info">
                <p class="mb-0">No custom cover uploaded yet.</p>
            </div>
        {/if}
    </div>
    <div class="col-12 text-center mt-1">
        <small class="text-light text-opacity-50">Recommended Max resolution: {PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH}x{PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH} - 16:9</small>
    </div>
    <input type="hidden" name="coverUrl" value={url} />
    <div class="col-12">
        <label class="btn btn-purple w-100 mt-1" for="cover">
            {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input class="d-none"
                type="file"
                id="cover"
                accept="image/*"
                bind:files
                onchange={uploadCover}
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