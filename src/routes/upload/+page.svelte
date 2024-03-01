<script>
    import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES } from "$env/static/public";
    import {deserialize} from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {onMount} from "svelte";
    import Editor from '@tinymce/tinymce-svelte';
    import {invalidateAll} from "$app/navigation";
    import { crossfade } from 'svelte/transition';

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    const [send, receive] = crossfade({
        fallback(node, params) {
            return {
                duration: 500,
                easing: t => t,
                css: t => `opacity: ${t}`
            };
        }
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
    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: '#5c00a6',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    let previewUrl = '';
    let fileName = '';
    let editorContent = '';
    let selectedOption = 'book';
    $: if (selectedOption) {
        toast.push(`Mode: ${selectedOption}`, {
            duration: 850,
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': '#fff'
            }
        });
    }

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

<div class="container-md px-0">
    <div class="row justify-content-center">
        <div class="col">
            <div class="row justify-content-center">
                <div class="col-12">
                    <p class="h1 text-center mt-3 mb-0 py-2 bg-light-subtle bg-opacity-25 rounded-4 animate-button">Upload content</p>
                </div>
            </div>
            <hr>
            <div class="row justify-content-center text-center mb-3">
                <div class="col-12 text-center">
                    <p class="h5 text-secondary-emphasis pb-2">Choose what you want to submit:</p>
                    <div class="btn-group w-100" role="group" aria-label="Book or Chapter">
                        <button type="button" class="btn btn-lg btn-dark border border-0 {selectedOption === 'book' ? 'active' : ''}" on:click={() => selectedOption = 'book'} use:tooltip={{...tooltipConfig}} title="Create book">
                            <i class="fas fa-book"></i> Book
                        </button>
                        <button type="button" class="btn btn-lg btn-dark border border-0 {selectedOption === 'chapter' ? 'active' : ''}" on:click={() => selectedOption = 'chapter'} use:tooltip={{...tooltipConfig}} title="Create chapter">
                            <i class="fas fa-file-alt"></i> Chapter
                        </button>
                    </div>
                    {#if selectedOption === 'book'}
                        <div in:send={{duration: 500}} out:receive={{duration: 500}}>
                            <div class="row justify-content-center text-center mt-4 mx-auto rounded-3">
                                <div class="col-12">
                                    <p class="h2 pt-2">Create Book:</p>
                                </div>
                            </div>
                            <div class="row mt-3 mx-0 justify-content-center">
                                <div class="col px-0">
                                    <form method="POST" enctype="multipart/form-data" action="?/postbook" on:submit={handleBookUpload}>
                                        <div class="row mx-auto mt-1">
                                            <div class="col-12 mb-2 form-animated-background border border-2 border-dark-subtle p-3 px-2 px-md-3 rounded-3 d-flex flex-column justify-content-center" style="min-height: 30vh">
                                                <label for="file" class="form-label" title="Your book's cover image" use:tooltip={{...tooltipConfig}}><i class="fas fa-image"></i> Cover</label>
                                                <input class="form-control form-control-lg bg-dark bg-opacity-50 mb-2" type="file" id="file" name="image" accept="image/*" on:change={loadImagePreview} required />
                                                <span class="text-light text-opacity-50" use:tooltip={{...tooltipConfig}} title="Max size: {maxFileSizeMB}MB">Max upload size: {maxFileSizeMB}MB - Max resolution: {PUBLIC_COVER_MAX_WIDTH}x{PUBLIC_COVER_MAX_HEIGHT} </span>
                                                {#if previewUrl}
                                                    <img src={previewUrl} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh;" />
                                                {/if}
                                                {#if fileName}
                                                    <span class="text-light text-opacity-75">Selected file: {fileName}</span>
                                                {/if}
                                            </div>
                                            <div class="col-12 px-0">
                                                <p class="fs-5 text-start mb-1 mt-3 ms-1"><i class="fas fa-book"></i> Title:</p>
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Your book's public title">
                                                    <input type="text" class="form-control form-control-custom" name="title" id="title" placeholder="Title" required>
                                                    <label for="title">Title</label>
                                                </div>
                                            </div>
                                            <div class="col-12 mb-2 mt-2 px-0 rounded-3" use:tooltip={{...tooltipConfig}} title="Your book's description">
                                                <!--
                                                <label for="description" class="form-label" use:tooltip={{...tooltipConfig}} title="Your book's public short description"><i class="fas fa-info-circle"></i> Description</label>
                                                -->
                                                <textarea class="form-control form-control-custom" name="description" id="description" rows="3" placeholder="Description" required></textarea>
                                            </div>
                                            <div class="col-12 mb-1 mt-1 px-0">
                                                <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    {/if}
                    {#if selectedOption === 'chapter'}
                        <div in:send={{duration: 500}} out:receive={{duration: 500}}>
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
                                                <label for="book" class="form-label" use:tooltip={{...tooltipConfig}} title="Your target's book"><i class="fas fa-book"></i> Book</label>
                                                <select class="form-select bg-black" name="book" id="book" required>
                                                    {#each books as book (book.id)}
                                                        <option value={book.id}>{book.title}</option>
                                                    {/each}
                                                </select>
                                            </div>
                                            <div class="col-12 bg-primary bg-opacity-10 rounded-3 mb-2 p-3 px-2 px-md-3">
                                                <label for="title" class="form-label" use:tooltip={{...tooltipConfig}} title="Your chapter's title"><i class="fas fa-heading"></i> Title</label>
                                                <input type="text" class="form-control bg-black bg-opacity-50" name="title" id="title" placeholder="Title" required>
                                            </div>
                                            <div class="col-12 bg-primary bg-opacity-10 rounded-3 mb-2 p-3 px-2 px-md-3">
                                                <p class="mb-2" use:tooltip={{...tooltipConfig}} title="Your chapter's text"><i class="fas fa-edit"></i> Text</p>
                                                <Editor {conf}
                                                        scriptSrc="tinymce/tinymce.min.js"
                                                        bind:value={editorContent}
                                                />
                                            </div>
                                            <div class="col-12 mb-1 mt-1 px-0">
                                                <button type="submit" class="btn btn-lg btn-outline-primary animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .animate-button {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
    }

    .animate-button:hover {
        border: 2px solid #5c00a6;
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 1.5s ease infinite;
    }

    .btn.active {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 4s ease infinite;
        color: #dcd6f7;
    }

    .form-animated-background {
        background-size: 200% 200%;
        background-image: linear-gradient(270deg, #000, #3d006c, #000);
        animation: ColorShift 4s ease infinite;
    }

    .form-control-custom {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.65), rgb(11, 0, 134));
        color: #dcd6f7;
        border: none;
    }

    .form-control-custom:focus {
        outline: none;
        box-shadow: 0 0 5px #5c00a6;
    }

    @keyframes Gradient {
        0% {background-position: 0 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0 50%;}
    }

    @keyframes ColorShift {
        0% {background: #000;}
        50% {background: #3d006c;}
        100% {background: #000;}
    }
</style>