<script>
    import { enhance } from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import Dropzone from "svelte-file-dropzone";
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    export let data;

    let { session, supabase } = data;
    $: ({ session, supabase } = data);

    let files = {
        accepted: [],
        rejected: []
    };

    let previewUrl = '';
    let selectedOption = 'book';

    function handleFilesSelect(e) {
        const { acceptedFiles, fileRejections } = e.detail;
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type.startsWith('image/') && file.size <= 2.5 * 1024 * 1024) {
                files.accepted = [file];
                files.rejected = [...files.rejected, ...fileRejections];
                previewUrl = URL.createObjectURL(file);
            } else {
                files.rejected = [...files.rejected, ...acceptedFiles, ...fileRejections];
            }
        }
    }

    function handleOptionChange(e) {
        selectedOption = e.target.value;
    }

</script>

<div class="row justify-content-center">
    <div class="col">
        <div class="row justify-content-center">
            <div class="col-12">
                <p class="h1 text-center mt-3 mb-0 py-2 bg-light-subtle bg-opacity-25 rounded-4">Upload content</p>
            </div>
        </div>
        <hr>
        <div class="row justify-content-center mb-3">
            <div class="col-12 text-center">
                <Dropzone
                        accept="image/*"
                        maxSize={2.5 * 1024 * 1024}
                        multiple="false"
                        containerClasses="bg-dark rounded-4 p-3 border-light-subtle"
                        on:drop={handleFilesSelect}
                >
                    <span class="text-light text-opacity-75">Optional: Drop your cover image here or click to browse</span>
                    <span class="text-light text-opacity-50" data-bs-toggle="tooltip" title="Max size: 2.5MB">Max size: 2.5MB - Recommended 15:10 aspect ratio or 1500x1000  max </span>
                    {#if previewUrl}
                        <img src={previewUrl} alt="Preview" class="img-thumbnail mt-2 rounded-4" style="max-height: 50vh;" />
                    {/if}
                </Dropzone>
            </div>
        </div>
        <div class="row justify-content-center text-center mb-3">
            <div class="col-12 text-center">
                <select class="form-select" aria-label="Select upload type" bind:value={selectedOption} on:change={handleOptionChange}>
                    <option value="book">Book</option>
                    <option value="chapter">Chapter</option>
                </select>
                {#if selectedOption === 'book'}
                    <hr>
                    <div class="row justify-content-center text-center mt-3 bg-light-subtle bg-opacity-25 mx-auto rounded-3">
                        <div class="col-12">
                            <p class="h3 pt-2">Book:</p>
                        </div>
                    </div>
                {/if}
                {#if selectedOption === 'chapter'}
                    <hr>
                    <div class="row justify-content-center text-center mt-3 bg-light-subtle bg-opacity-25 mx-auto rounded-3">
                        <div class="col-12">
                            <p class="h3 pt-2">Chapter:</p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>