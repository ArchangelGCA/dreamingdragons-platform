<script>
    import { PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES } from "$env/static/public";
    import {deserialize} from '$app/forms';
    import {toast} from "@zerodevx/svelte-toast";
    import Editor from '@tinymce/tinymce-svelte';
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from '@formkit/auto-animate';
    import { tooltip } from "@svelte-plugins/tooltips";

    let conf = {
        skin: 'oxide-dark',
        content_css: 'dark',
        license_key: 'gpl',
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

    let { books, can_upload, tooltipConfig } = data;

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    let previewUrl = '';
    let fileName = '';
    let editorContent = '';
    let selectedOption = 'book';
    let inputTag = '';
    let suggestions = [];
    let activeUpload = false;
    let editorContentTale = '';
    let activePreviousChapterTags = false;
    let selectedBook;
    let chaptersNumber = 0;
    let discordLink = 'https://discord.gg/hrrD3KPdTe';
    let isDragging = false;

    $: if (selectedBook) {
        if (books && books.length > 0) {
            chaptersNumber = books.find(book => book.id === selectedBook).chapters;
        }
    }

    let tags = [];
    async function addTag(e) {
        if (e.type === 'click') {
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
                    return;
                }
                tags = [...tags, tag];
                e.target.value = '';
                suggestions = [];
                inputTag = '';
            }
        } else if (e.key === 'Tab' && suggestions.length > 0) {
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
        } else if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
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
                suggestions = [];
            }
        } else {
            const tag = e.target.value.trim();
            if (tag) {
                await fetchTags(e.target.value.trim());
            }
        }
    }

    async function fetchTags(tag) {
        if (!tag) {
            suggestions = [];
        } else {
            const formData = new FormData();
            formData.append('tag', tag);

            const response = await fetch('?/tagsuggestions', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    suggestions = result.data.body.map(tag => tag.name).filter(suggestion => !tags.includes(suggestion));
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
        suggestions = [];
        inputTag = '';
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

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    function handleDragEnter(event) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event) {
        event.preventDefault();
        isDragging = false;
    }

    function handleDrop(event) {
        event.preventDefault();
        isDragging = false;
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // Check if file is an image, if not return
            if (!files[0].type.startsWith('image/')) {
                toast.push('Error: File is not an image', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                return;
            }
            loadImagePreview({ target: { files: [files[0]] } });
            // Set the files to the input
            document.getElementById('file').files = files;
        }
    }

    async function fetchPreviousChapterTags(){

        if (activePreviousChapterTags) return;

        activePreviousChapterTags = true;

        const book = document.getElementById('book').value;

        // IF no book is selected, return
        if (!book) {
            activePreviousChapterTags = false;
            toast.push('You must select a Content!', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        const formData = new FormData();
        formData.append('book_id', book);

        const toastId = toast.push('Fetching previous chapter tags... 🔗', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/previouschaptertags', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                if (result.data.body.length <= 0){
                    toast.push('No previous chapters or tags found... ☹️', {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                } else {
                    // Add to tags array (but only those that are not already in the array) and also count how many tags were added
                    let addedTags = 0;
                    result.data.body.forEach(tag => {
                        if (!tags.includes(tag)) {
                            tags = [...tags, tag];
                            addedTags++;
                        }
                    });
                    if (addedTags > 0) {
                        toast.push(addedTags + ' Tags added successfully! 🤩', {
                            theme: {
                                '--toastBackground': '#4caf50',
                                '--toastColor': '#fff'
                            }
                        });
                    } else {
                        toast.push('No tags were added... 🤔', {
                            theme: {
                                '--toastBackground': '#ff4d4d',
                                '--toastColor': '#fff'
                            }
                        });
                    }
                }
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

        activePreviousChapterTags = false;
    }

    async function handleBookUpload(event) {
        event.preventDefault();

        if (activeUpload) return;

        activeUpload = true;

        const formData = new FormData(event.target);
        formData.append('description', editorContentTale);

        const file = formData.get('image');
        if (!file) {
            toast.push('Error: No image selected', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.push('Error: File is not an image', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            return;
        }

        if (file.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES) {
            toast.push('Error: File is too large', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            return;
        }

        // New image from file
        const image = new Image();

        image.onload = () => {
            if (image.width > PUBLIC_COVER_MAX_WIDTH || image.height > PUBLIC_COVER_MAX_HEIGHT) {
                toast.push('Error: Image resolution is too high', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                activeUpload = false;
            }
        };

        // Due to previous check.
        if (!activeUpload) return;

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
                fileName = '';
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

        activeUpload = false;
    }

    async function handleChapterUpload(event) {
        event.preventDefault();

        if (activeUpload) return;

        activeUpload = true;

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
                const chapterUrl = '/content/' + bookId + "/" + chapterId;

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + chapterUrl + '" target="_blank">here</a>.', {
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

        activeUpload = false;
    }
</script>

<div class="container-md px-0">
    <!-- Alert  -->
    {#if !can_upload}
        <div class="row justify-content-center">
            <div class="col-12">
                <div class="alert alert-danger text-center mt-3 mb-0" role="alert">
                    <p class="h4">You aren't allowed to upload!</p>
                    <p class="h5">If you think this is an error, please contact us on <a href="{discordLink}">Discord</a>.</p>
                </div>
            </div>
        </div>
    {/if}
    <!-- Upload Page -->
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
                        <button type="button" class="btn btn-lg btn-dark border border-0 {selectedOption === 'book' ? 'active' : ''}" on:click={() => selectedOption = 'book'} use:tooltip={{...tooltipConfig}} title="Create Tale">
                            <i class="fas fa-book"></i> Tale
                        </button>
                        <button type="button" class="btn btn-lg btn-dark border border-0 {selectedOption === 'chapter' ? 'active' : ''}" on:click={() => selectedOption = 'chapter'} use:tooltip={{...tooltipConfig}} title="Create chapter">
                            <i class="fas fa-file-alt"></i> Chapter
                        </button>
                    </div>
                    <div use:autoAnimate>
                        {#if selectedOption === 'book'}
                            <div class="row justify-content-center text-center mt-4 rounded-3">
                                <div class="col-12">
                                    <p class="h2 pt-2">Create Tale:</p>
                                </div>
                            </div>
                            <div class="row mt-3 mx-0 justify-content-center">
                                <div class="col px-0">
                                    <form method="POST" enctype="multipart/form-data" action="?/postbook" on:submit={handleBookUpload}>
                                        <div class="row mx-auto mt-1">
                                            <div class="col-12 mb-2 form-animated-background border border-2 border-dark-subtle p-3 px-2 px-md-3 rounded-3 d-flex flex-column justify-content-center drop-zone" style="min-height: 30vh"
                                                 on:dragover={handleDragOver}
                                                 on:drop={handleDrop}
                                                 on:dragenter={handleDragEnter}
                                                 on:dragleave={handleDragLeave}
                                                 class:dragging={isDragging}
                                                 role="button" aria-label="File upload drop zone" tabindex="0">
                                                <label for="file" class="form-label" title="Tale image" use:tooltip={{...tooltipConfig}}><i class="fas fa-image"></i> Image</label>
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
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Tale title">
                                                    <input type="text" class="form-control form-control-custom" name="title" id="title" placeholder="Title" required>
                                                    <label for="title"><i class="fas fa-heading"></i> Title</label>
                                                </div>
                                            </div>
                                            <div class="col-12 mt-2 px-0 rounded-3" use:tooltip={{...tooltipConfig}} title="Tale description">
                                                <div class="col-12 px-0">
                                                    <Editor {conf}
                                                            scriptSrc="tinymce/tinymce.min.js"
                                                            bind:value={editorContentTale}
                                                    />
                                                </div>
                                            </div>
                                            <div class="col-12 mt-2 px-0 rounded-3">
                                                <p class="fs-6 text-start mb-1 ms-1"><i class="fas fa-tags"></i> Tags:</p>
                                                <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate use:tooltip={{...tooltipConfig}} title="Tip: use a , or press space/enter to add tag">
                                                    {#each tags as tag}
                                                        <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                                            <span>{tag}</span>
                                                            <button class="button-tags text-danger-emphasis ms-1" type="button" on:click|preventDefault={() => removeTag(tag)}>x</button>
                                                        </div>
                                                    {/each}
                                                    <input class="input-tags my-auto ms-1" type="text" bind:value={inputTag} placeholder="Add tags" on:keydown={addTag} on:keyup={addTag}/>
                                                    {#each suggestions as suggestion (suggestion)}
                                                        <button class="dropdown-item" on:click|preventDefault={addTag} value={suggestion}>{suggestion}</button>
                                                    {/each}
                                                    <!-- Hidden input bind with tags -->
                                                    <input type="hidden" name="tags" value={tags} />
                                                </div>
                                            </div>
                                            <div class="col-12 mb-1 mt-2 px-0">
                                                {#if !can_upload}
                                                    <button type="submit" class="btn btn-lg animate-button w-100" disabled use:tooltip={{...tooltipConfig}} title="Uploads are disabled for your profile!">You can't upload!</button>
                                                {:else}
                                                    <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                                {/if}
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
                                        <div class="row" use:autoAnimate>
                                            <div class="col-12 rounded-3 mt-1 px-0">
                                                <p class="fs-5 text-start mb-1 ms-1"><i class="fas fa-book"></i> Tale</p>
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Target Tale">
                                                    <select class="form-select form-select-lg form-select-custom" name="book" id="book" bind:value={selectedBook} required>
                                                        {#each books as book (book.id)}
                                                            <option class="option-custom" value={book.id}>{book.title}</option>
                                                        {/each}
                                                    </select>
                                                    <label for="book"><i class="fas fa-book"></i> Tale</label>
                                                </div>
                                            </div>
                                            <div class="col-12 rounded-3 mb-2 px-0 mt-2">
                                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Chapter title">
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
                                                <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate use:tooltip={{...tooltipConfig}} title="Tip: use a , or press space/enter to add tag">
                                                    {#each tags as tag}
                                                        <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                                            <span>{tag}</span>
                                                            <button class="button-tags text-danger-emphasis ms-1" type="button" on:click|preventDefault={() => removeTag(tag)}>x</button>
                                                        </div>
                                                    {/each}
                                                    <input class="input-tags my-auto ms-1" type="text" bind:value={inputTag} placeholder="Add tags" on:keydown={addTag} on:keyup={addTag}/>
                                                    {#each suggestions as suggestion (suggestion)}
                                                        <button class="dropdown-item" on:click|preventDefault={addTag} value={suggestion}>{suggestion}</button>
                                                    {/each}
                                                    <!-- Hidden input bind with tags -->
                                                    <input type="hidden" name="tags" value={tags} />
                                                </div>
                                            </div>
                                            {#if chaptersNumber > 0}
                                                <div class="col-12 px-0">
                                                    <button class="btn btn-sm btn-dark mt-2 pt-1 w-100" type="button" on:click|preventDefault={fetchPreviousChapterTags} use:tooltip={{...tooltipConfig}} title="Fetch previous chapter tags (if any is found)">Fetch previous chapter tags</button>
                                                </div>
                                            {/if}
                                            <div class="col-12 mb-1 mt-2 px-0">
                                                {#if !can_upload}
                                                    <button type="submit" class="btn btn-lg animate-button w-100" disabled use:tooltip={{...tooltipConfig}} title="Uploads are disabled for your profile!">Submit</button>
                                                {:else}
                                                    <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Submit</button>
                                                {/if}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="col-12 mt-3 mb-1 rounded-3">
                    <p class="text-danger-emphasis text-center mb-1">NO AI/NSFW!</p>
                    <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/legal/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a> and <a href="/legal/privacy-policy" target="_blank" class="link-secondary text-decoration-none">privacy policy</a>.</p>
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

    .drop-zone {
        position: relative;
        border: 2px dashed rgb(92, 0, 166) !important;
    }

    .drop-zone.dragging {
        background-color: rgb(47, 0, 89) !important;
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