<script>
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";

    export let url;
    export let supabase;
    export let session;

    let coverUrl = '';
    let uploading = false;
    let files;

    const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            const url = URL.createObjectURL(data);
            coverUrl = url;
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
            }
        }
    }

    async function uploadCover() {
        try {
            uploading = true;

            if (!files || files.length === 0) {
                throw new Error('You must select an image to upload.');
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
            if (result.type !== 'success' || result.status !== 200) {
                throw new Error('Failed to compress image');
            }

            url = session.user.id + '/' + filePath;

            toast.push('Cover updated successfully!', {
                theme: {
                    '--toastBackground': '#029fcc',
                    '--toastProgressBackground': '#38d971',
                    '--toastProgressText': '#ffffff',
                    '--toastText': '#868686',
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            uploading = false;
        }
    }

    $: if (url) downloadImage(url);
</script>

<div class="row justify-content-center">
    <div class="col-12 text-center">
        {#if coverUrl}
            <img src={coverUrl} alt="Cover" class="img-fluid" style="max-height: 25vh;" />
        {:else}
            <div class="alert alert-info">
                <p class="mb-0">No custom cover uploaded yet.</p>
            </div>
        {/if}
    </div>
    <input type="hidden" name="coverUrl" value={url} />
    <div class="col-12">
        <label class="btn btn-success w-100 mt-2" for="cover">
            {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input class="d-none"
                type="file"
                id="cover"
                accept="image/*"
                bind:files
                on:change={uploadCover}
                disabled={uploading}
        />
    </div>
</div>