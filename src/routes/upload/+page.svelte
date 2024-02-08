<script>
    import { enhance } from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import Dropzone from "svelte-file-dropzone";
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    export let data;

    let { session, supabase, books } = data;
    $: ({ session, supabase } = data);

    let previewUrl = '';
    let fileName = '';
    let selectedBook;
    let chapterTitle = '';
    let selectedOption = 'book';

    function handleFilesSelect(e) {
        const { acceptedFiles } = e.detail;
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type.startsWith('image/') && file.size <= 2.5 * 1024 * 1024) {
                previewUrl = URL.createObjectURL(file);
                fileName = file.name;
                toast.push('Cover selected: ' + fileName, {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
            } else {
                toast.push('Error: Invalid file type or size', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        }
    }

    function handleOptionChange(e) {
        selectedOption = e.target.value;
    }

    function handleEditorChange({ detail }) {
        content = detail;
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
                    {#if fileName}
                        <span class="text-light text-opacity-75 mt-2">Selected file: {fileName}</span>
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
                    <div class="row justify-content-center text-center mt-3 bg-danger bg-opacity-25 mx-auto rounded-3">
                        <div class="col-12">
                            <p class="h3 pt-2">Book:</p>
                        </div>
                    </div>
                    <div class="row mt-3 justify-content-center">
                        <div class="col">
                            <form>
                                <div class="row mx-auto">
                                    <div class="col-12 mb-3 bg-danger bg-opacity-10 p-3 rounded-3">
                                            <label for="title" class="form-label" data-bs-toggle="tooltip" title="Your book's public title"><i class="fas fa-book"></i> Title</label>
                                            <input type="text" class="form-control bg-black bg-opacity-50" id="title" placeholder="Title" required>
                                    </div>
                                    <div class="col-12 mb-3 bg-danger bg-opacity-10 p-3 rounded-3">
                                            <label for="description" class="form-label" data-bs-toggle="tooltip" title="Your book's public short description"><i class="fas fa-info-circle"></i> Description</label>
                                            <textarea class="form-control bg-black bg-opacity-50" id="description" rows="3" placeholder="Description" required></textarea>
                                    </div>
                                    <div class="col-12 px-0">
                                        <button type="submit" class="btn btn-lg btn-outline-danger w-100">Submit</button>
                                    </div>
                                </div>
                            </form>
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
                    <div class="row mt-3 justify-content-center">
                        <div class="col">
                            <form>
                                <div class="row">
                                    <div class="col-12 mb-2">
                                        <label for="book" class="form-label"><i class="fas fa-book"></i> Book</label>
                                        <select class="form-select" id="book" bind:value={selectedBook} required>
                                            {#each books as book (book.id)}
                                                <option value={book.id}>{book.title}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="col-12 mb-2">
                                            <label for="title" class="form-label"><i class="fas fa-heading"></i> Title</label>
                                            <input type="text" class="form-control" id="title" bind:value={chapterTitle} placeholder="Title" required>
                                    </div>
                                    <div class="col-12 mb-2">
                                            <label for="chapter-editor" class="form-label"><i class="fas fa-edit"></i> Content</label>
                                            <textarea class="form-control" id="chapter-editor" rows="10" required></textarea>
                                    </div>
                                    <div class="col-12">
                                        <button type="submit" class="btn btn-lg btn-outline-primary w-100">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>