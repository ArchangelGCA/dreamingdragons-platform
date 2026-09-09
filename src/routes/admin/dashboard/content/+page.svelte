<script>
    import AdminContent from "$lib/components/admin/AdminContent.svelte";
    import AdminPagination from "$lib/components/admin/AdminPagination.svelte";
    import autoAnimate from "@formkit/auto-animate";
    import {invalidateAll, goto} from "$app/navigation";

    /** @type {{data: any}} */
    let { data } = $props();
    let content = $derived(data.content ?? []);
    let page = $derived(data.page ?? 1);
    let totalPages = $derived(data.totalPages ?? 1);
    let total = $derived(data.total ?? 0);
    let q = $derived(data.q ?? '');
    // Writable derived: typing assigns locally, navigation re-evaluates from data.
    let searchInput = $derived(data.q ?? '');

    function submitSearch(event) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set('q', searchInput.trim());
        params.set('page', '1');
        goto(`?${params.toString()}`, { keepFocus: true });
    }

    async function handleDelete() {
        await invalidateAll();
        const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
        if (modalBackdrop.length > 0) {
            modalBackdrop[0].remove();
        }
    }

    async function handleEditContent() {
        await invalidateAll();
        const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
        if (modalBackdrop.length > 0) {
            modalBackdrop[0].remove();
        }
    }
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Tales</h2>
        <p class="text-secondary small mb-0">{total} matching · page {page} of {totalPages}</p>
    </div>
</div>

<form class="row g-2 mb-3" onsubmit={submitSearch} role="search" aria-label="Search tales">
    <div class="col-12">
        <div class="input-group">
            <input
                class="form-control"
                type="search"
                placeholder="Search by tale title…"
                aria-label="Search by tale title"
                autocomplete="off"
                bind:value={searchInput}
            />
            <button class="btn btn-purple" type="submit">
                <i class="fas fa-search" aria-hidden="true"></i><span class="visually-hidden">Search</span>
            </button>
        </div>
    </div>
</form>

{#if content.length === 0}
    <div class="text-center py-5">
        <i class="fas fa-book-open fa-3x mb-3 text-secondary" aria-hidden="true"></i>
        <h3 class="h5">No tales found</h3>
        <p class="text-secondary small mb-0">Try a different search.</p>
    </div>
{:else}
    <div class="row" use:autoAnimate>
        {#each content as item (item.id)}
            <div class="col-12 col-md-6 col-xl-4 mb-4">
                <AdminContent {item} image_proxy={data.image_proxy} deleteContent={handleDelete} editContent={handleEditContent}/>
            </div>
        {/each}
    </div>
{/if}

<AdminPagination {page} {totalPages} {total} label="tales" baseParams={{ q }} />
