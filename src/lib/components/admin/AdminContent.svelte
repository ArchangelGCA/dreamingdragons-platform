<script>
    import autoAnimate from "@formkit/auto-animate";
    import AdminDialog from "$lib/components/admin/AdminDialog.svelte";
    import { toast } from "$lib/components/svelte-toast";
    import { createProfilePath } from '$lib/utils/slugs.js';
    import { resolveImageUrl } from '$lib/utils/images.js';
    import { formatAdminDate, postAdminAction } from '$lib/utils/admin.js';
    import { notifyError, notifySuccess, notifyWorking } from "$lib/utils/admin-notify.js";
    /** @type {{item: any, image_proxy: any}} */
    let { item, image_proxy, editContent, deleteContent } = $props();

    const maxChars = 100;
    let showFullDescription = $state(false);
    let busy = $state(false);
    let sendWarning = $state(false);
    let warningMessage = $state('');
    let deleteBookOpen = $state(false);
    let editOpen = $state(false);
    let pendingChapter = $state(null);
    let editItem = $state({
        title: item.title,
        description: item.description,
        cover_url: item.cover_url,
        profiles: {
            username: item.profiles.username
        }
    });
    // Chapter bodies are NOT in the list payload (perf) — lazy-load on expand.
    let chapterTexts = $state({});
    let chapterLoading = $state({});
    let chapterErrors = $state({});

    let description = $derived(item.description ?? '');

    async function runAction(action, formData, verb) {
        if (busy) return null;
        busy = true;
        const toastId = notifyWorking(verb);
        try {
            const result = await postAdminAction(action, formData);
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                notifySuccess(result.data.body.message);
                return result;
            }
            notifyError(result.data?.body?.message ?? 'Something went wrong.');
            return null;
        } catch {
            toast.pop(toastId);
            notifyError('Something went wrong.');
            return null;
        } finally {
            busy = false;
        }
    }

    function warningFields(formData) {
        formData.append('sendWarning', String(sendWarning));
        formData.append('warningMessage', warningMessage);
    }

    function openEditModal() {
        editItem = { ...item };
        editOpen = true;
    }

    async function saveBookChanges() {
        if (!editItem.title?.trim() || !editItem.description?.trim() || !editItem.cover_url?.trim()) {
            notifyError('Title, description and cover URL are all required.');
            return;
        }

        const data = new FormData();
        data.append('bookId', item.id);
        data.append('title', editItem.title);
        data.append('description', editItem.description);
        data.append('coverUrl', editItem.cover_url);

        const result = await runAction('edit_book', data, `Saving ${item.title}...`);
        if (result) {
            editOpen = false;
            editContent({ id: item.id, ...editItem });
        }
    }

    async function confirmDelete() {
        const data = new FormData();
        data.append('bookId', item.id);
        data.append('bookCover', item.cover_url);
        data.append('ownerId', item.owner_id);
        warningFields(data);
        const result = await runAction('delete_book', data, `Deleting ${item.title}...`);
        if (result) {
            deleteBookOpen = false;
            sendWarning = false;
            warningMessage = '';
            deleteContent(item.id);
        }
    }

    async function confirmDeleteChapter() {
        if (!pendingChapter) return;
        const data = new FormData();
        data.append('chapterId', pendingChapter.id);
        data.append('ownerId', pendingChapter.owner_id);
        warningFields(data);
        const result = await runAction('delete_chapter', data, `Deleting ${pendingChapter.title}...`);
        if (result) {
            const removedId = pendingChapter.id;
            pendingChapter = null;
            sendWarning = false;
            warningMessage = '';
            deleteContent(removedId);
        }
    }

    async function loadChapterText(chapter) {
        if (chapterTexts[chapter.id] || chapterLoading[chapter.id]) return;
        // Already embedded (backwards compat) — nothing to fetch.
        if (chapter.text) {
            chapterTexts = { ...chapterTexts, [chapter.id]: chapter.text };
            return;
        }
        chapterLoading = { ...chapterLoading, [chapter.id]: true };
        chapterErrors = { ...chapterErrors, [chapter.id]: '' };
        try {
            const formData = new FormData();
            formData.append('chapterId', chapter.id);
            const result = await postAdminAction('get_chapter_text', formData);
            if (result.type === 'success' && result.data.status === 200) {
                chapterTexts = { ...chapterTexts, [chapter.id]: result.data.body.chapter?.text ?? '' };
            } else {
                chapterErrors = { ...chapterErrors, [chapter.id]: result.data?.body?.message ?? 'Could not load chapter.' };
            }
        } catch {
            chapterErrors = { ...chapterErrors, [chapter.id]: 'Could not load chapter.' };
        } finally {
            chapterLoading = { ...chapterLoading, [chapter.id]: false };
        }
    }
</script>

<div class="admin-card overflow-hidden h-100 d-flex flex-column">
    <a href="/content/{item.id}" target="_blank" rel="noopener noreferrer" aria-label="Open {item.title}">
        {#if item.cover_url}
            {@const optimizedCoverUrl = resolveImageUrl(item.cover_url, image_proxy)}
            <img src={optimizedCoverUrl} class="card-img-top admin-cover" alt={item.title} loading="lazy" decoding="async" />
        {:else}
            <img src="/favicon.webp" class="card-img-top admin-cover" alt={item.title} loading="lazy" decoding="async" />
        {/if}
    </a>
    <div class="card-body d-flex flex-column flex-grow-1">
        <h5 class="card-title h6">
            <a href="/content/{item.id}" target="_blank" rel="noopener noreferrer" aria-label="Open tale"><i class="fas fa-link" aria-hidden="true"></i></a>
            {item.title}
        </h5>
        <p class="small mb-1">
            By <a href={createProfilePath(item.profiles.username, item.profiles.id)} target="_blank" rel="noopener noreferrer">{item.profiles.username}</a>
            <span class="badge rounded-pill chip-purple ms-1 tnum">{item.chapters.length} ch.</span>
        </p>
        <p class="card-text small" use:autoAnimate>
            {#if showFullDescription}
                {@html description}
            {:else}
                {@html description.substring(0, maxChars)}
                {#if description.length > maxChars}...{/if}
            {/if}
            {#if description.length > maxChars}
                <button class="btn btn-link btn-sm p-0 ms-1" onclick={() => showFullDescription = !showFullDescription}>
                    {#if showFullDescription}Show less{:else}Show more{/if}
                </button>
            {/if}
        </p>
        <div class="d-flex gap-2 mb-2">
            <button class="btn btn-sm btn-outline-secondary flex-fill {item.chapters.length === 0 ? 'disabled' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#chapters-{item.id}" aria-expanded="false" aria-controls="chapters-{item.id}">
                Chapters ({item.chapters.length})
            </button>
            <button class="btn btn-sm btn-outline-secondary flex-fill" type="button" data-bs-toggle="collapse" data-bs-target="#profile-{item.id}" aria-expanded="false" aria-controls="profile-{item.id}">
                Owner
            </button>
        </div>
        <div class="collapse" id="chapters-{item.id}">
            <div class="accordion" id="accordionChapters-{item.id}">
                {#each item.chapters as chapter (chapter.id)}
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading-{chapter.id}">
                            <button class="accordion-button collapsed small" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-{chapter.id}" aria-expanded="false" aria-controls="collapse-{chapter.id}" onclick={() => loadChapterText(chapter)}>
                                {chapter.title}
                            </button>
                        </h2>
                        <div id="collapse-{chapter.id}" class="accordion-collapse collapse" aria-labelledby="heading-{chapter.id}" data-bs-parent="#accordionChapters-{item.id}">
                            <div class="accordion-body">
                                <button class="btn btn-outline-danger btn-sm w-100" onclick={() => pendingChapter = chapter}>
                                    <i class="fas fa-trash-can me-1" aria-hidden="true"></i>Delete chapter
                                </button>
                                <hr />
                                {#if chapterLoading[chapter.id]}
                                    <p class="text-secondary small mb-0"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading chapter…</p>
                                {:else if chapterErrors[chapter.id]}
                                    <p class="text-danger small mb-0">{chapterErrors[chapter.id]}</p>
                                {:else if chapterTexts[chapter.id]}
                                    {@html chapterTexts[chapter.id]}
                                {:else}
                                    <p class="text-secondary small mb-0">Expand to load the full text.</p>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="collapse" id="profile-{item.id}">
            <p class="small mb-0">Owner: <a href={createProfilePath(item.profiles.username, item.profiles.id)} target="_blank" rel="noopener noreferrer">{item.profiles.username}</a></p>
        </div>
        <div class="d-flex gap-2 mt-auto pt-2">
            <button class="btn btn-purple btn-sm flex-fill" onclick={openEditModal}>
                <i class="fas fa-pen me-1" aria-hidden="true"></i>Edit
            </button>
            <button class="btn btn-danger btn-sm flex-fill" onclick={() => deleteBookOpen = true}>
                <i class="fas fa-trash-can me-1" aria-hidden="true"></i>Delete
            </button>
        </div>
    </div>
    <div class="card-footer small text-secondary tnum">Created {formatAdminDate(item.created_at)}</div>
</div>

<AdminDialog
    open={deleteBookOpen}
    title="Delete “{item.title}”?"
    confirmLabel="Delete tale"
    {busy}
    onClose={() => { if (!busy) deleteBookOpen = false; }}
    onConfirm={confirmDelete}
>
    <p>The tale, its chapters and its cover file are permanently removed.</p>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="sendWarning-{item.id}" bind:checked={sendWarning} />
        <label class="form-check-label" for="sendWarning-{item.id}">Send warning to the owner</label>
    </div>
    {#if sendWarning}
        <textarea class="form-control mt-2" rows="3" maxlength="1000" bind:value={warningMessage} placeholder="Warning message…"></textarea>
    {/if}
</AdminDialog>

<AdminDialog
    open={pendingChapter !== null}
    title="Delete “{pendingChapter?.title ?? ''}”?"
    confirmLabel="Delete chapter"
    {busy}
    onClose={() => { if (!busy) pendingChapter = null; }}
    onConfirm={confirmDeleteChapter}
>
    <p>The chapter is permanently removed from “{item.title}”.</p>
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="sendChapterWarning-{item.id}" bind:checked={sendWarning} />
        <label class="form-check-label" for="sendChapterWarning-{item.id}">Send warning to the owner</label>
    </div>
    {#if sendWarning}
        <textarea class="form-control mt-2" rows="3" maxlength="1000" bind:value={warningMessage} placeholder="Warning message…"></textarea>
    {/if}
</AdminDialog>

<AdminDialog
    open={editOpen}
    title="Edit tale"
    tone="primary"
    confirmLabel="Save changes"
    {busy}
    onClose={() => { if (!busy) editOpen = false; }}
    onConfirm={saveBookChanges}
>
    <div class="mb-3">
        <label for="title-{item.id}" class="form-label small">Title</label>
        <input type="text" class="form-control" id="title-{item.id}" maxlength="200" bind:value={editItem.title} />
    </div>
    <div class="mb-3">
        <label for="description-{item.id}" class="form-label small">Description</label>
        <textarea class="form-control" id="description-{item.id}" rows="3" bind:value={editItem.description}></textarea>
    </div>
    <div class="mb-0">
        <label for="cover_url-{item.id}" class="form-label small">Cover URL</label>
        <input type="text" class="form-control" id="cover_url-{item.id}" bind:value={editItem.cover_url} />
    </div>
</AdminDialog>

<style>
    .admin-cover {
        aspect-ratio: 16 / 9;
        object-fit: cover;
    }
</style>
