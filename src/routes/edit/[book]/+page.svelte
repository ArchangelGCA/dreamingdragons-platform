<script>
    import {PUBLIC_COVER_MAX_WIDTH, PUBLIC_COVER_MAX_HEIGHT, PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES } from "$env/static/public";
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import Editor from "@tinymce/tinymce-svelte";
    import {conf} from "$lib/utils/gcatinymce.js"

    /** @type {{data: any}} */
    let { data } = $props();

    let { book, image_proxy } = $state(data);
    $effect(() => {
        ({book, image_proxy} = data);
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
                        {#if previewUrl !== null}
                            <img src={previewUrl} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh; width: auto; object-fit: contain" loading="lazy" />
                        {:else}
                            {@const optimizedCoverUrl = image_proxy && book.cover_url && !book.cover_url.startsWith(image_proxy) ? image_proxy + book.cover_url : book.cover_url}
                            <img src={optimizedCoverUrl + '?width=800&quality=80'} alt="Preview" class="img-thumbnail mt-2 mb-2 rounded-4" style="max-height: 50vh; width: auto; object-fit: contain" loading="lazy" />
                        {/if}
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