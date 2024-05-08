<script>
    import Editor from "@tinymce/tinymce-svelte";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "@svelte-plugins/tooltips";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import Seo from "sk-seo";

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
    const { chapter, books, supabase, tooltipConfig } = data;

    let editorContent = chapter.text;
    let tags = chapter.chapter_tags.map(tag => tag.tags.name);
    let suggestions = [];
    let hasDoneTagAction = false;
    let editActive = false;
    let title = chapter.title;

    async function handleEdit(event){
        event.preventDefault();

        if (editActive) return;

        editActive = true;
        const formData = new FormData(event.target);
        formData.append('content', editorContent);

        const toastId = toast.push('Saving...', {
            duration: 15000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/editchapter', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            if (result.data.status === 200) {

                const chapterUrl = '/content/' + chapter.book_id + "/" + chapter.id;

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + chapterUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
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
            hasDoneTagAction = true;
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
                suggestions = [];
                hasDoneTagAction = true;
                return;
            }
        }

        hasDoneTagAction = false;
    }

    async function fetchTags(e) {

        if (hasDoneTagAction) {
            return;
        }

        const tag = e.target.value.trim();
        if (!tag || tag === '') {
            suggestions = [];
            return;
        }
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
    }

    function addTagSuggestion(tag) {
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
        suggestions = [];
        document.getElementById('inputTag').value = '';
    }
</script>

<Seo index="false" />

<div class="container-md mt-4 mb-3">
    <div class="row text-center">
        <div class="col px-0">
            <p class="h1 rounded-4 animate-background py-2">Edit Chapter (Alpha)</p>
        </div>
    </div>
    <div class="row mt-3 mx-0 justify-content-center text-center">
        <div class="col px-0">
            <form method="POST" enctype="multipart/form-data" action="?/postchapter" on:submit={handleEdit}>
                <div class="row">
                    <div class="col-12 rounded-3 px-0">
                        <p class="fs-5 text-start mb-1 ms-1"><i class="fas fa-book"></i> Tale</p>
                        <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Target Tale">
                            <select class="form-select form-select-lg form-select-custom" name="book" id="book" required>
                                {#each books as book (book.id)}
                                    {#if book.id === chapter.book_id}
                                        <option class="option-custom" value={book.id} selected>{book.title}</option>
                                    {:else}
                                        <option class="option-custom" value={book.id}>{book.title}</option>
                                    {/if}
                                {/each}
                            </select>
                            <label for="book"><i class="fas fa-book"></i> Tale</label>
                        </div>
                    </div>
                    <div class="col-12 rounded-3 mb-2 px-0 mt-2">
                        <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Chapter title">
                            <input type="text" class="form-control form-control-lg form-control-custom" name="title" id="title" placeholder="Title" bind:value={title} required>
                            <label for="title" class="form-label"><i class="fas fa-heading"></i> Title</label>
                        </div>
                    </div>
                    <div class="col-12 px-0">
                        <Editor {conf}
                                scriptSrc="../../tinymce/tinymce.min.js"
                                bind:value={editorContent}
                        />
                    </div>
                    <div class="col-12 mt-2 px-0 rounded-3">
                        <p class="fs-6 text-start mb-1 ms-1"><i class="fas fa-tags"></i> Tags:</p>
                        <div class="d-flex flex-wrap text-start border border-light-subtle rounded-3 p-1 py-1" use:autoAnimate use:tooltip={{...tooltipConfig}} title="Tip: use a , or press space/enter to add tag">
                            {#each tags as tag}
                                <div class="badge tag-custom rounded-4 pe-2 my-auto me-1">
                                    <span>{tag}</span>
                                    <button class="button-tags text-danger-emphasis ms-1" type="button" on:click={() => removeTag(tag)}>x</button>
                                </div>
                            {/each}
                            <input class="input-tags my-auto ms-1" type="text" id="inputTag" placeholder="Add tags" on:keydown={addTag} on:keyup={fetchTags}/>
                            {#each suggestions as suggestion (suggestion)}
                                <button class="dropdown-item" on:click|preventDefault={() => addTagSuggestion(suggestion)}>{suggestion}</button>
                            {/each}
                            <!-- Hidden inputs -->
                            <input type="hidden" name="tags" value={tags} />
                            <input type="hidden" name="chapterId" value={chapter.id} />
                            <input type="hidden" name="bookId" value={chapter.book_id} />
                        </div>
                    </div>
                    <div class="col-12 mb-1 mt-2 px-0">
                        <button type="submit" class="btn btn-lg animate-button w-100" use:tooltip={{...tooltipConfig}} title="Click to submit">Save Changes</button>
                    </div>
                    <div class="col-12 mt-3 px-0 rounded-3">
                        <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a>.</p>
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