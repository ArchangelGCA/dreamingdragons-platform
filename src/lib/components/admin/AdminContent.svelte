<script>
    import autoAnimate from "@formkit/auto-animate";
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";
    import {createEventDispatcher} from "svelte";
    export let item;

    const dispatch = createEventDispatcher();

    const maxChars = 100;
    let showFullDescription = false;
    let deleteBookActionActive = false;
    let deleteChapterActionActive = false;
    let editBookActionActive = false;
    let sendWarning = false;
    let warningMessage = '';
    let editItem = {
        title: item.title,
        description: item.description,
        cover_url: item.cover_url,
        profiles: {
            username: item.profiles.username
        }
    };

    function formatDate(date) {
        if (date === null) {
            return date;
        }
        const finalDate = new Date(date);
        if (finalDate === "Invalid Date" || isNaN(finalDate)) {
            return date;
        }
        return finalDate.toLocaleString();
    }

    item.created_at = formatDate(item.created_at);

    function openEditModal() {
        editItem = { ...item };
    }

    async function saveBookChanges() {
        if (editBookActionActive) return;
        if (editItem.title === '' || editItem.description === '' || editItem.cover_url === '') {
            toast.push('Please fill all fields', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
            return;
        }

        editBookActionActive = true;

        const toastId = toast.push('Editing content ' + item.title + '...', {
            duration: 100000,
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': '#fff',
            }
        });

        const data = new FormData();
        data.append('bookId', item.id);
        data.append('title', editItem.title);
        data.append('description', editItem.description);
        data.append('coverUrl', editItem.cover_url);

        const response = await fetch('?/edit_book', {
            method: 'POST',
            body: data
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Content ' + item.title +  ' edited! 📝', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });

                document.getElementById('editModal-' + item.id).style.display = 'none';

                dispatch('editContent', { id: item.id, ...editItem });
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }


        editBookActionActive = false;
    }

    async function confirmDelete() {
        if (deleteBookActionActive) return;

        deleteBookActionActive = true;

        // Makes waiting toast
        const toastId = toast.push('Deleting content ' + item.title + '...', {
            duration: 100000,
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': '#fff',
            }
        });

        const data = new FormData();
        data.append('bookId', item.id);
        data.append('bookCover', item.cover_url);
        data.append('sendWarning', sendWarning);
        data.append('warningMessage', warningMessage);
        data.append('ownerId', item.owner_id);
        const response = await fetch('?/delete_book', {
            method: 'POST',
            body: data
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Content ' + item.title +  ' deleted! 🗑️', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });

                dispatch('delete', item.id);
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        deleteBookActionActive = false;
    }

    async function confirmDeleteChapter(chapter) {
        if (deleteChapterActionActive) return;

        deleteChapterActionActive = true;

        const toastId = toast.push('Deleting chapter ' + chapter.title + '...', {
            duration: 100000,
            theme: {
                '--toastBackground': '#5c00a6',
                '--toastColor': '#fff',
            }
        });

        const data = new FormData();
        data.append('chapterId', chapter.id);
        data.append('sendWarning', sendWarning);
        data.append('warningMessage', warningMessage);
        data.append('ownerId', chapter.owner_id);
        const response = await fetch('?/delete_chapter', {
            method: 'POST',
            body: data
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Chapter ' + chapter.title +  ' deleted! 🗑️', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });

                dispatch('delete', chapter.id);
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        deleteChapterActionActive = false;
    }

    $: item.created_at = formatDate(item.created_at);
</script>

<div class="card">
    <a href="/content/{item.id}" target="_blank">
        <img src={item.cover_url} class="card-img-top" alt={item.title} />
    </a>
    <div class="card-body">
        <h5 class="card-title"><a href="/content/{item.id}" target="_blank"><i class="fas fa-solid fa-link"></i></a> {item.title}</h5>
        <p class="card-text">By: <a href="/profile/{item.profiles.id}" target="_blank">{item.profiles.username}</a></p>
        <p class="card-text" use:autoAnimate>
            {#if showFullDescription}
                {@html item.description}
            {:else}
                {@html item.description.substring(0, maxChars)}
                {#if item.description.length > maxChars}...{/if}
            {/if}
            {#if item.description.length > maxChars}
                <button class="btn btn-link" on:click={() => showFullDescription = !showFullDescription}>
                    {#if showFullDescription} Show Less {:else} Show More {/if}
                </button>
            {/if}
        </p>
        <div class="row justify-content-center text-center">
            <div class="col-12 col-md-6">
                <button class="btn btn-link {item.chapters.length === 0 ? 'disabled' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#chapters-{item.id}">
                    Show Chapters {#if item.chapters.length > 0} ({item.chapters.length}) {/if}
                </button>
            </div>
            <div class="col-12 col-md-6">
                <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#profile-{item.id}">
                    Show Profile
                </button>
            </div>
        </div>
        <div class="collapse" id="chapters-{item.id}">
            <div class="accordion" id="accordionChapters-{item.id}">
                {#each item.chapters as chapter (chapter.id)}
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-{chapter.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-{chapter.id}" aria-expanded="false" aria-controls="collapse-{chapter.id}">
                                {chapter.title}
                            </button>
                        </h2>
                        <div id="collapse-{chapter.id}" class="accordion-collapse collapse" aria-labelledby="heading-{chapter.id}" data-bs-parent="#accordionChapters-{item.id}">
                            <div class="accordion-body">
                                <div class="row text-center mt-1">
                                    <div class="col">
                                        <button class="btn btn-danger btn-sm w-100" data-bs-toggle="modal" data-bs-target="#deleteChapterModal-{chapter.id}">
                                            <i class="fas fa-trash-alt"></i> Delete
                                        </button>
                                    </div>
                                </div>
                                <hr>
                                {@html chapter.text}
                            </div>
                        </div>
                    </div>
                    <div class="modal fade" id="deleteChapterModal-{chapter.id}" tabindex="-1" aria-labelledby="deleteChapterModalLabel-{chapter.id}" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="deleteChapterModalLabel-{chapter.id}">Confirm Delete</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body" use:autoAnimate>
                                    <p>Are you sure you want to delete Chapter -> <b>{chapter.title}</b>?</p>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="sendChapterWarning-{chapter.id}" bind:checked={sendWarning}>
                                        <label class="form-check-label" for="sendChapterWarning-{chapter.id}">
                                            Send warning to user
                                        </label>
                                    </div>
                                    {#if sendWarning}
                                        <textarea class="form-control mt-2" id="warningMessage-{chapter.id}" rows="3" bind:value={warningMessage} placeholder="Enter warning message here..."></textarea>
                                    {/if}
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="button" class="btn btn-danger" on:click={() => confirmDeleteChapter(chapter)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="collapse" id="profile-{item.id}">
            <div>
                <h6>{item.profiles.username}</h6>
                <p>id: <a href="/profile/{item.profiles.id}" target="_blank">{item.profiles.id}</a></p>
            </div>
        </div>
    </div>
    <div class="card-footer">
        <small class="text-muted">Created at: {item.created_at}</small>
        <div class="row mt-1">
            <div class="col-6 text-center">
                <button class="btn btn-primary btn-sm w-100" on:click={openEditModal} data-bs-toggle="modal" data-bs-target="#editModal-{item.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="col-6">
                <button class="btn btn-danger btn-sm w-100" data-bs-toggle="modal" data-bs-target="#deleteModal-{item.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="deleteModal-{item.id}" tabindex="-1" aria-labelledby="deleteModalLabel-{item.id}" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteModalLabel-{item.id}">Confirm Delete</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" use:autoAnimate>
                <p>Are you sure you want to delete -> <b>{item.title}</b>?</p>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="sendWarning-{item.id}" bind:checked={sendWarning}>
                    <label class="form-check-label" for="sendWarning-{item.id}">
                        Send warning to user
                    </label>
                </div>
                {#if sendWarning}
                    <textarea class="form-control mt-2" id="warningMessage-{item.id}" rows="3" bind:value={warningMessage} placeholder="Enter warning message here..."></textarea>
                {/if}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" on:click={confirmDelete}>Delete</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="editModal-{item.id}" tabindex="-1" aria-labelledby="editModalLabel-{item.id}" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editModalLabel-{item.id}">Edit Content</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form>
                    <div class="mb-3">
                        <label for="title-{item.id}" class="form-label">Title</label>
                        <input type="text" class="form-control" id="title-{item.id}" bind:value={editItem.title}>
                    </div>
                    <div class="mb-3">
                        <label for="description-{item.id}" class="form-label">Description</label>
                        <textarea class="form-control" id="description-{item.id}" rows="3" bind:value={editItem.description}></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="cover_url-{item.id}" class="form-label">Cover URL</label>
                        <input type="text" class="form-control" id="cover_url-{item.id}" bind:value={editItem.cover_url}>
                    </div>
                    <div class="mb-3">
                        <label for="username-{item.id}" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username-{item.id}" bind:value={editItem.profiles.username} disabled>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" on:click={saveBookChanges}>Save changes</button>
            </div>
        </div>
    </div>
</div>