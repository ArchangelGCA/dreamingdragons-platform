<script>
    import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES } from "$env/static/public";
    import {deserialize} from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import Editor from '@tinymce/tinymce-svelte';
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from '@formkit/auto-animate';
    import { tooltip } from "@svelte-plugins/tooltips";
    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        },
        theme: 'text-center w-auto'
    };

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

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    let previewUrl = '';
    let fileName = '';
    let editorContent = '';
    let selectedOption = 'book';
    let suggestions = [];

    let tags = [];
    async function addTag(e) {
        if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            if (tags.includes(suggestions[0])) {
                toast.push('Tag already added', {
                    theme: {
                        '--toastBackground': '#ffcc00',
                        '--toastColor': '#000'
                    }
                });
                return;
            }
            tags = [...tags, suggestions[0]];
            e.target.value = '';
            suggestions = [];
            return;
        }
        if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                if (tags.includes(tag)) {
                    toast.push('Tag already added', {
                        theme: {
                            '--toastBackground': '#ffcc00',
                            '--toastColor': '#000'
                        }
                    });
                    e.target.value = '';
                    return;
                }
                tags = [...tags, tag];
                e.target.value = '';
                return;
            }
        }

        const tag = e.target.value.trim();
        if (tag) {
            const formData = new FormData();
            formData.append('tag', tag);

            const response = await fetch('?/tagsuggestions', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    suggestions = result.data.body.map(tag => tag.name);
                } else {
                    toast.push('Error: ' + result.data.body.message, {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                }
            } else {
                toast.push('Error: Tag suggestions failed' , {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        }
    }

    function removeTag(tag) {
        tags = tags.filter(t => t !== tag);
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

    function addTagSuggestionBook(tag) {
        tags = [...tags, tag];
        suggestions = [];
        document.getElementById('inputTagBook').value = '';
    }

    function addTagSuggestionChapter(tag) {
        tags = [...tags, tag];
        suggestions = [];
        document.getElementById('inputTagChapter').value = '';
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

                const bookId = result.data.body.book_id;
                const bookUrl = '/content/' + bookId;

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + bookUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                event.target.reset();
                tags = [];
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

                const bookId = result.data.body.book_id;
                const chapterId = result.data.body.chapter_id;
                const bookUrl = '/content/' + bookId + "/" + chapterId;

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + bookUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                })
                event.target.reset();
                tags = [];
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
                    <p class="h1 text-center mt-3 mb-0 py-2 bg-light-subtle bg-opacity-25 rounded-4 animate-background">Upload content</p>
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
                    <div use:autoAnimate>
                        {#if selectedOption === 'book'}
                            <div class="row justify-content-center text-center mt-4 rounded-3">
                                <div class="col-12">
                                    <p class="h2 pt-2">Create Book:</p>
                                </div>
                            </div>
                            <div class="row mt-3 mx-0 justify-content-center">
                                <div class="col px-0">
                                    <form method="POST" enctype="multipart/form-data" action="?/postbook" on:submit={handleBookUpload}>
                                        <div class="row mx-auto mt-1">
                                            <div class="col-12 mb-2 form-animated-background border border-2 border-dark-subtle p-3 px-2 px-md-3 rounded-3 d-flex flex-column justify-content-center" style="min-height: 30vh">
                                                <label for="file" class="form-label" title="Book's cover image" use:tooltip={{...tooltipConfig}}><i class="fas fa-image"></i> Cover</label>
                                                <input class="form-control form-control-lg bg-dark bg-opacity-50 mb-2" type="file" id="file" name="image" accept="image/*" on:change={loadImagePreview} required/>
                                                <span class="text-light text-opacity-50" use:tooltip={{...tooltipConfig}} title="Max size: {maxFileSizeMB}MB">Max upload size: {maxFileSizeMB}MB - Max resolution: {PUBLIC_COVER_MAX_WIDTH}x{PUBLIC_COVER_MAX_HEIGHT} </span>
                                                {#if previewUrl}
                                                    <img src={previewUrl} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh; width: auto; object-fit: contain" />
                                                {/if}
                                                {#if fileName}
                                                    <span class="text-light text-opacity-75">Selected file: {fileName}</span>
                                                {/if}
                                            </div>
                                            <div class="col-12 px-0">
                                                <p class="fs-5 text-start mb-1 mt-3 ms-1"><i class="fas fa-book"></i> Title:</p>
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Book's public title">
                                                    <input type="text" class="form-control form-control-custom" name="title" id="title" placeholder="Title" required>
                                                    <label for="title"><i class="fas fa-heading"></i> Title</label>
                                                </div>
                                            </div>
                                            <div class="col-12 mt-2 px-0 rounded-3" use:tooltip={{...tooltipConfig}} title="Book's description">
                                                <textarea class="form-control form-control-custom" name="description" id="description" rows="3" placeholder="Description" required></textarea>
                                            </div>
                                            <div class="col-12 mt-2 px-0 rounded-3">
                                                <p class="fs-6 text-start mb-1 ms-1"><i class="fas fa-tags"></i> Tags:</p>
                                                <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate>
                                                    {#each tags as tag}
                                                        <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                                            <span>{tag}</span>
                                                            <button class="button-tags text-danger-emphasis ms-1" type="button" on:click={() => removeTag(tag)}>x</button>
                                                        </div>
                                                    {/each}
                                                    <input class="input-tags my-auto ms-1" type="text" id="inputTagBook" placeholder="Add tags" on:keydown={addTag} />
                                                    {#each suggestions as suggestion (suggestion)}
                                                        <button class="dropdown-item" on:click|preventDefault={() => addTagSuggestionBook(suggestion)}>{suggestion}</button>
                                                    {/each}
                                                    <!-- Hidden input bind with tags -->
                                                    <input type="hidden" name="tags" value={tags} />
                                                </div>
                                            </div>
                                            <div class="col-12 mb-1 mt-2 px-0">
                                                <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                            </div>
                                            <div class="col-12 mt-3 px-0 rounded-3">
                                                <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/legal/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a> and <a href="/legal/privacy-policy" target="_blank" class="link-secondary text-decoration-none">privacy policy</a>.</p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        {/if}
                        {#if selectedOption === 'chapter'}
                            <div class="row justify-content-center text-center mt-4 rounded-3">
                                <div class="col-12">
                                    <p class="h2 pt-2">Create Chapter:</p>
                                </div>
                            </div>
                            <div class="row mx-auto mt-2 justify-content-center">
                                <div class="col">
                                    <form method="POST" enctype="multipart/form-data" action="?/postchapter" on:submit={handleChapterUpload}>
                                        <div class="row">
                                            <div class="col-12 rounded-3 mt-1 px-0">
                                                <p class="fs-5 text-start mb-1 ms-1"><i class="fas fa-book"></i> Book</p>
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Target's book">
                                                    <select class="form-select form-select-lg form-select-custom" name="book" id="book" required>
                                                        {#each books as book (book.id)}
                                                            <option class="option-custom" value={book.id}>{book.title}</option>
                                                        {/each}
                                                    </select>
                                                    <label for="book"><i class="fas fa-book"></i> Book</label>
                                                </div>
                                            </div>
                                            <div class="col-12 rounded-3 mb-2 px-0 mt-2">
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Chapter's title">
                                                    <input type="text" class="form-control form-control-lg form-control-custom" name="title" id="title" placeholder="Title" required>
                                                    <label for="title" class="form-label"><i class="fas fa-heading"></i> Title</label>
                                                </div>
                                            </div>
                                            <div class="col-12 px-0">
                                                <Editor {conf}
                                                        scriptSrc="tinymce/tinymce.min.js"
                                                        bind:value={editorContent}
                                                />
                                            </div>
                                            <div class="col-12 mt-2 px-0 rounded-3">
                                                <p class="fs-6 text-start mb-1 ms-1"><i class="fas fa-tags"></i> Tags:</p>
                                                <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate>
                                                    {#each tags as tag}
                                                        <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                                            <span>{tag}</span>
                                                            <button class="button-tags text-danger-emphasis ms-1" type="button" on:click={() => removeTag(tag)}>x</button>
                                                        </div>
                                                    {/each}
                                                    <input class="input-tags my-auto ms-1" type="text" id="inputTagChapter" placeholder="Add tags" on:keydown={addTag} />
                                                    {#each suggestions as suggestion (suggestion)}
                                                        <button class="dropdown-item" on:click|preventDefault={() => addTagSuggestionChapter(suggestion)}>{suggestion}</button>
                                                    {/each}
                                                    <!-- Hidden input bind with tags -->
                                                    <input type="hidden" name="tags" value={tags} />
                                                </div>
                                            </div>
                                            <div class="col-12 mb-1 mt-2 px-0">
                                                <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                            </div>
                                            <div class="col-12 mt-3 px-0 rounded-3">
                                                <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a>.</p>
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
    </div>
</div>

<style>
    .animate-button {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
    }

    .animate-button:hover {
        box-shadow: 0 0 18px #5c00a6;
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

    .animate-background {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
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
        transition: 0.15s ease-in-out all;
    }

    .form-control-custom:hover {
        background-color: rgba(92, 0, 166, 0.5);
    }

    .form-control-custom:focus {
        outline: none;
        box-shadow: 0 0 8px #5c00a6;
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.5), rgb(11, 0, 134));
    }

    .form-select-custom {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.65), rgb(11, 0, 134));
        color: #dcd6f7;
        border: none;
        transition: 0.15s ease-in-out all;
    }

    .form-select-custom:hover {
        background-color: rgba(92, 0, 166, 0.5);
    }

    .tag-custom {
        background-color: rgba(92, 0, 166, 0.86);
        color: #dcd6f7;
        border: none;
        transition: 0.15s ease-in-out all;
    }

    .tag-custom:hover {
        background-color: rgba(92, 0, 166, 0.5);
    }

    .option-custom {
        background-color: rgb(47, 0, 89);
        color: #c2c2c2;
    }

    .button-tags {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    .input-tags {
        all: unset;
    }

    @keyframes Gradient {
        0% {background-position: 0 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0 50%;}
    }

    @keyframes ColorShift {
        0% {background: #000;}
        50% {background: rgba(61, 0, 108, 0.45);}
        100% {background: #000;}
    }
</style>