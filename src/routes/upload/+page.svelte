<script>
    import {deserialize} from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {onMount} from "svelte";
    import Editor from '@tinymce/tinymce-svelte';
    import {invalidateAll} from "$app/navigation";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    let conf = {
        skin: 'oxide-dark',
        content_css: 'dark',
        block_unsupported_drop: true,
        branding: false,
        plugins: 'link autolink wordcount charmap code fullscreen',
        default_link_target: '_blank',
        images_upload_handler: () => Promise.reject({
            remove: true,
            message: 'You can\'t upload images in the description.',
        }),
        toolbar_mode: 'sliding',
        toolbar: [
            {
                name: 'history',
                items: ['undo', 'redo']
            },
            {
                name: 'links',
                items: ['link']
            },
            {
                name: 'formatting',
                items: ['bold', 'italic']
            },
            {
                name: 'alignment',
                items: ['alignleft', 'aligncenter', 'alignright', 'alignjustify']
            },
            {
                name: 'indentation',
                items: ['outdent', 'indent']
            },
            {
                name: 'tools',
                items: ['wordcount', 'charmap', 'code', 'fullscreen']
            }
        ],
        setup: function (editor) {
            editor.on('init', function () {
                const promotionLink = document.querySelector('.tox-promotion-link');
                if (promotionLink) {
                    promotionLink.remove();
                }
            });
        },
    };

    export let data;

    let { session, supabase, books } = data;
    $: ({ session, supabase } = data);

    let previewUrl = '';
    let fileName = '';
    let editorContent = '';
    $: selectedOption = 'book';

    // Function to load image preview
    function loadImagePreview(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                previewUrl = reader.result;
            };
            reader.readAsDataURL(file);
            fileName = file.name;
        }
    }

    function handleEditorChange(event) {
        editorContent = event.getContent();
    }

    function handleOptionChange(e) {
        selectedOption = e.target.value;
    }

    async function handleBookUpload(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const toastId = toast.push('Uploading...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/postbook', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                })
                event.target.reset();
                previewUrl = '';
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else {
            toast.push('Error: Upload failed' , {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    async function handleChapterUpload(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        formData.append('content', editorContent);

        const toastId = toast.push('Uploading...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/postchapter', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                })
                event.target.reset();
                editorContent = '';
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else {
            toast.push('Error: Upload failed' , {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
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
                    <div class="row mt-3 mx-0 py-2 justify-content-center border border-danger border-opacity-50 rounded-3">
                        <div class="col">
                            <form method="POST" enctype="multipart/form-data" action="?/postbook" on:submit={handleBookUpload}>
                                <div class="row mx-auto mt-1">
                                    <div class="col-12 mb-2 bg-danger bg-opacity-10 p-3 px-2 px-md-3 rounded-3">
                                        <label for="file" class="form-label" title="Your book's cover image" use:tooltip={{animation: 'fade'}}><i class="fas fa-image"></i> Cover</label>
                                        <input class="form-control form-control-lg mb-2" type="file" id="file" name="image" accept="image/*" on:change={loadImagePreview} required />
                                        <span class="text-light text-opacity-50" use:tooltip={{animation: 'fade'}} title="Max size: 2.5MB">Max size: 2.5MB - Recommended 15:10 aspect ratio or 1500x1000  max </span>
                                        {#if previewUrl}
                                            <img src={previewUrl} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh;" />
                                        {/if}
                                        {#if fileName}
                                            <span class="text-light text-opacity-75">Selected file: {fileName}</span>
                                        {/if}
                                    </div>
                                    <div class="col-12 col-md-6 mb-2 mb-md-2 px-0 pe-md-2">
                                        <div class="col-12 h-100 bg-danger bg-opacity-10 p-3 px-2 px-md-3 rounded-3">
                                            <label for="title" class="form-label" use:tooltip={{animation: 'fade'}} title="Your book's public title"><i class="fas fa-book"></i> Title</label>
                                            <input type="text" class="form-control bg-black bg-opacity-50" name="title" id="title" placeholder="Title" required>
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6 mb-2 bg-danger bg-opacity-10 p-3 px-2 px-md-3 rounded-3">
                                        <label for="description" class="form-label" use:tooltip={{animation: 'fade'}} title="Your book's public short description"><i class="fas fa-info-circle"></i> Description</label>
                                        <textarea class="form-control bg-black bg-opacity-50" name="description" id="description" rows="3" placeholder="Description" required></textarea>
                                    </div>
                                    <div class="col-12 mb-1 mt-1 px-0">
                                        <button type="submit" class="btn btn-lg btn-outline-danger w-100">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                {/if}
                {#if selectedOption === 'chapter'}
                    <hr>
                    <div class="row justify-content-center text-center mt-3 bg-primary bg-opacity-25 mx-auto rounded-3">
                        <div class="col-12">
                            <p class="h3 pt-2">Chapter:</p>
                        </div>
                    </div>
                    <div class="row mx-auto mt-3 py-2 justify-content-center border border-primary-subtle rounded-4">
                        <div class="col">
                            <form method="POST" enctype="multipart/form-data" action="?/postchapter" on:submit={handleChapterUpload}>
                                <div class="row mx-auto">
                                    <div class="col-12 bg-primary bg-opacity-10 rounded-3 mt-1 mb-2 p-3 px-2 px-md-3">
                                        <label for="book" class="form-label" use:tooltip={{animation: 'fade'}} title="Your target's book"><i class="fas fa-book"></i> Book</label>
                                        <select class="form-select bg-black" name="book" id="book" required>
                                            {#each books as book (book.id)}
                                                <option value={book.id}>{book.title}</option>
                                            {/each}
                                        </select>
                                    </div>
                                    <div class="col-12 bg-primary bg-opacity-10 rounded-3 mb-2 p-3 px-2 px-md-3">
                                        <label for="title" class="form-label" use:tooltip={{animation: 'fade'}} title="Your chapter's title"><i class="fas fa-heading"></i> Title</label>
                                        <input type="text" class="form-control bg-black bg-opacity-50" name="title" id="title" placeholder="Title" required>
                                    </div>
                                    <div class="col-12 bg-primary bg-opacity-10 rounded-3 mb-2 p-3 px-2 px-md-3">
                                        <p class="mb-2" use:tooltip={{animation: 'fade'}} title="Your chapter's text"><i class="fas fa-edit"></i> Text</p>
                                        <Editor {conf}
                                                scriptSrc="tinymce/tinymce.min.js"
                                                bind:value={editorContent}
                                        />
                                    </div>
                                    <div class="col-12 mb-1 mt-1 px-0">
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