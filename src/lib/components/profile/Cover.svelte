<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import {PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH} from "$env/static/public"
    import autoAnimate from "@formkit/auto-animate";

    /** @type {{url: any}} */
    let {url, uploadComplete} = $props();

    let coverUrl = $derived(url && url !== '' ? url : '');
    let uploading = $state(false);
    let files = $state();
    let isImageLoaded = $state(false);

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
        <div class="card border border-0 bg-transparent">
            <div class="position-relative cover-wrapper" use:autoAnimate>
                {#if coverUrl}
                    <div class="image-container" use:autoAnimate>
                        {#if !isImageLoaded}
                            <div class="bg-dark placeholder-glow m-0 p-0">
                                <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                                    <img src={coverUrl} alt="Cover" class="img-fluid rounded-2" onload={() => isImageLoaded = true}/>
                                </div>
                            </div>
                        {:else}
                            <img src={coverUrl} alt="Cover" class="img-fluid rounded-2"/>
                        {/if}
                        <div class="overlay-content">
                            <label class="btn btn-purple p-2" for="cover">
                                <i class="fa-solid fa-image me-1"></i> {uploading ? 'Uploading ...' : 'Change Cover'}
                            </label>
                        </div>
                    </div>
                {:else}
                    <div class="alert alert-info">
                        <p class="mb-0">You haven't setup a cover, yet!</p>
                    </div>
                    <div class="bg-dark bg-opacity-25 placeholder-glow m-0 p-0" style="height: 25vh;">
                        <div class="placeholder bg-light-subtle rounded-3 w-100 h-100"></div>
                    </div>
                    <div class="overlay-content">
                        <label class="btn btn-purple p-2" for="cover">
                            <i class="fa-solid fa-image me-1"></i> {uploading ? 'Uploading ...' : 'Change Cover'}
                        </label>
                    </div>
                {/if}
                <input type="hidden" name="coverUrl" value={url}/>
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
    </div>
    <div class="col-12 text-center mt-1">
        <small class="text-light text-opacity-50">Recommended Max resolution: {PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH}
            x{PUBLIC_PROFILE_COVER_RESIZE_MAX_WIDTH} - 16:9</small>
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

    .cover-wrapper {
        overflow: hidden;
    }

    .image-container {
        position: relative;
        display: inline-block;
    }

    .cover-wrapper img {
        object-fit: contain;
        max-height: 50vh;
        display: block;
    }

    .overlay-content {
        position: absolute;
        bottom: 10px;
        right: 10px;
    }
</style>