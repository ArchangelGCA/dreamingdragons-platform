<script>
    import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES } from "$env/static/public";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "@svelte-plugins/tooltips";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import Editor from "@tinymce/tinymce-svelte";

    let conf = {
        skin: 'oxide-dark',
        content_css: 'dark',
        license_key: 'gpl',
        block_unsupported_drop: true,
        branding: false,
        plugins: 'link autolink wordcount charmap code fullscreen lists searchreplace',
        default_link_target: '_blank',
        images_upload_handler: () => Promise.reject({
            remove: true,
            message: 'You can\'t upload images in the description.',
        }),
        menubar: false,
        toolbar_mode: 'floating',
        toolbar: "undo redo | blocks headings | bold italic underline strikethrough | alignment | link code blockquote | bullist numlist | forecolor backcolor | searchreplace",
        toolbar_groups: {
            alignment: {
                icon: 'align-left',
                tooltip: 'Alignment',
                items: 'alignleft aligncenter alignright alignjustify'
            },
            headings: {
                icon: 'heading1',
                tooltip: 'Headings',
                items: 'p h1 h2 h3 h4 h5 h6'
            },
            formatting: {
                icon: 'bold',
                tooltip: 'Formatting',
                items: 'bold italic underline | superscript subscript'
            }
        },
        setup: function (editor) {
            editor.on('init', function () {
                const promotionLink = document.querySelector('.tox-promotion-link');
                if (promotionLink) {
                    promotionLink.remove();
                }
            });
            editor.ui.registry.addIcon('paragraph', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M208,36H96a68,68,0,0,0,0,136h36v36a12,12,0,0,0,24,0V60h16V208a12,12,0,0,0,24,0V60h12a12,12,0,0,0,0-24ZM132,148H96a44,44,0,0,1,0-88h36Z"></path></svg>')
            editor.ui.registry.addIcon('search', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-search"><path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>')
            editor.ui.registry.addIcon('heading1', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M236,112v96a12,12,0,0,1-24,0V134.42L206.66,138a12,12,0,0,1-13.32-20l24-16A12,12,0,0,1,236,112ZM144,44a12,12,0,0,0-12,12v48H52V56a12,12,0,0,0-24,0V176a12,12,0,0,0,24,0V128h80v48a12,12,0,0,0,24,0V56A12,12,0,0,0,144,44Z"></path></svg>')
            editor.ui.registry.addIcon('link', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '  <path d="M14.8284 12L16.2426 13.4142L19.071 10.5858C20.6331 9.02365 20.6331 6.49099 19.071 4.9289C17.509 3.3668 14.9763 3.3668 13.4142 4.9289L10.5858 7.75732L12 9.17154L14.8284 6.34311C15.6095 5.56206 16.8758 5.56206 17.6568 6.34311C18.4379 7.12416 18.4379 8.39049 17.6568 9.17154L14.8284 12Z" fill="currentColor" />' +
                '  <path d="M12 14.8285L13.4142 16.2427L10.5858 19.0711C9.02372 20.6332 6.49106 20.6332 4.92896 19.0711C3.36686 17.509 3.36686 14.9764 4.92896 13.4143L7.75739 10.5858L9.1716 12L6.34317 14.8285C5.56212 15.6095 5.56212 16.8758 6.34317 17.6569C7.12422 18.4379 8.39055 18.4379 9.1716 17.6569L12 14.8285Z" fill="currentColor" />' +
                '  <path d="M14.8285 10.5857C15.219 10.1952 15.219 9.56199 14.8285 9.17147C14.4379 8.78094 13.8048 8.78094 13.4142 9.17147L9.1716 13.4141C8.78107 13.8046 8.78107 14.4378 9.1716 14.8283C9.56212 15.2188 10.1953 15.2188 10.5858 14.8283L14.8285 10.5857Z" fill="currentColor" />' +
                '</svg>')
        },
    };

    /** @type {{data: any}} */
    let { data } = $props();

    let { book, supabase, tooltipConfig } = $state(data);
    $effect(() => {
        ({book} = data);
    });

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    let previewUrl = $state(null);
    let fileName = $state(null);
    let suggestions = $state([]);
    let files = $state();
    let inputTag = $state('');
    let editActive = false;

    async function handleEdit(event){
        event.preventDefault();

        if (editActive) return;

        editActive = true;
        const formData = new FormData(event.target);
        formData.append('description', book.description);

        const toastId = toast.push('Uploading...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/editbook', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            if (result.data.status === 200) {

                const bookUrl = '/content/' + book.id;

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + bookUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                await invalidateAll();
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
        editActive = false;
    }

    async function addTag(e) {
        if (e.type === 'click') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                if (book.tags.includes(tag)) {
                    toast.push('Tag already added', {
                        theme: {
                            '--toastBackground': '#ffcc00',
                            '--toastColor': '#000'
                        }
                    });
                    return;
                }
                //tags = [...tags, tag];
                book.tags.push(tag);
                e.target.value = '';
                suggestions = [];
                inputTag = '';
            }
        } else if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            if (book.tags.includes(suggestions[0])) {
                toast.push('Tag already added', {
                    theme: {
                        '--toastBackground': '#ffcc00',
                        '--toastColor': '#000'
                    }
                });
                return;
            }
            //tags = [...tags, suggestions[0]];
            book.tags.push(suggestions[0]);
            e.target.value = '';
            suggestions = [];
        } else if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                if (book.tags.includes(tag)) {
                    toast.push('Tag already added', {
                        theme: {
                            '--toastBackground': '#ffcc00',
                            '--toastColor': '#000'
                        }
                    });
                    e.target.value = '';
                    return;
                }
                //tags = [...tags, tag];
                book.tags.push(tag);
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
                    suggestions = result.data.body.map(tag => tag.name).filter(suggestion => !book.tags.includes(suggestion));
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

    function removeTag(e) {
        // Get value from button
        const tag = e.target.value;
        //tags = tags.filter(t => t !== tag);
        book.tags = book.tags.filter(t => t !== tag);
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

</script>
<div class="container-md mt-4 mb-3 px-0">
    <div class="row text-center">
        <div class="col">
            <p class="h1 rounded-4 animate-background py-2">Edit Tale (Alpha)</p>
        </div>
    </div>
    <div class="row mt-3 mx-0 justify-content-center text-center">
        <div class="col px-0">
            <form method="POST" enctype="multipart/form-data" action="?/editbook" onsubmit={handleEdit}>
                <div class="row mx-auto mt-1">
                    <div class="col-12 mb-2 form-animated-background border border-2 border-dark-subtle p-3 px-2 px-md-3 rounded-3 d-flex flex-column justify-content-center" style="min-height: 30vh">
                        <label for="file" class="form-label" title="Tale image" use:tooltip={{...tooltipConfig}}><i class="fas fa-image"></i> Cover</label>
                        <input class="form-control form-control-lg bg-dark bg-opacity-50 mb-2" type="file" id="file" name="image" accept="image/*" onchange={loadImagePreview} bind:files />
                        <span class="text-light text-opacity-50" use:tooltip={{...tooltipConfig}} title="Max size: {maxFileSizeMB}MB">Max upload size: {maxFileSizeMB}MB - Max resolution: {PUBLIC_COVER_MAX_WIDTH}x{PUBLIC_COVER_MAX_HEIGHT} </span>
                        <img src={previewUrl !== null ? previewUrl : book.cover_url} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh; width: auto; object-fit: contain" />
                        <span class="text-light text-opacity-75">Selected file: {fileName !== null ? fileName : book.cover_url.substring(book.cover_url.lastIndexOf('/') + 1)}</span>
                    </div>
                    <div class="col-12 px-0">
                        <p class="fs-5 text-start mb-1 mt-3 ms-1"><i class="fas fa-book"></i> Title:</p>
                        <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Tale title">
                            <input type="text" class="form-control form-control-custom" name="title" id="title" placeholder="Title" bind:value={book.title} required>
                            <label for="title"><i class="fas fa-heading"></i> Title</label>
                        </div>
                    </div>
                    <div class="col-12 mt-2 px-0 rounded-3" use:tooltip={{...tooltipConfig}} title="Tale description">
                        <div class="col-12 px-0">
                            <Editor {conf}
                                    scriptSrc="../tinymce/tinymce.min.js"
                                    bind:value={book.description}
                            />
                        </div>
                    </div>
                    <div class="col-12 mt-2 px-0 rounded-3">
                        <p class="fs-6 text-start mb-1 ms-1"><i class="fas fa-tags"></i> Tags:</p>
                        <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate use:tooltip={{...tooltipConfig}} title="Tip: use a , or press space/enter to add tag">
                            {#each book.tags as tag}
                                <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                    <span>{tag}</span>
                                    <button class="button-tags text-danger-emphasis ms-1" type="button" onclick={removeTag} value={tag}>x</button>
                                </div>
                            {/each}
                            <input class="input-tags my-auto ms-1" type="text" bind:value={inputTag} placeholder="Add tags" onkeydown={addTag} onkeyup={addTag}/>
                            {#each suggestions as suggestion (suggestion)}
                                <button class="dropdown-item" onclick={addTag} value={suggestion}>{suggestion}</button>
                            {/each}
                            <!-- Hidden inputs -->
                            <input type="hidden" name="tags" bind:value={book.tags} />
                            <input type="hidden" name="bookId" value={book.id} />
                        </div>
                    </div>
                    <div class="col-12 mb-1 mt-2 px-0">
                        <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Save Changes</button>
                    </div>
                    <div class="col-12 mt-3 px-0 rounded-3">
                        <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/legal/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a> and <a href="/legal/privacy-policy" target="_blank" class="link-secondary text-decoration-none">privacy policy</a>.</p>
                    </div>
                </div>
            </form>
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

    .tag-custom {
        background-color: rgba(92, 0, 166, 0.86);
        color: #dcd6f7;
        border: none;
        transition: 0.15s ease-in-out all;
    }

    .tag-custom:hover {
        background-color: rgba(92, 0, 166, 0.5);
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