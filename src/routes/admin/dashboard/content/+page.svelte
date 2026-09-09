<script>
    import AdminContent from "$lib/components/admin/AdminContent.svelte";
    import AdminPagination from "$lib/components/admin/AdminPagination.svelte";
    import AdminPageHeader from "$lib/components/admin/AdminPageHeader.svelte";
    import AdminEmpty from "$lib/components/admin/AdminEmpty.svelte";
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

    async function refresh() {
        await invalidateAll();
    }
</script>

<AdminPageHeader title="Tales" subtitle="Edit or remove tales and their chapters." meta="{total} matching · page {page} of {totalPages}">
    {#snippet actions()}
        <form onsubmit={submitSearch} role="search" aria-label="Search tales">
            <div class="input-group">
                <input
                    class="form-control"
                    type="search"
                    placeholder="Search by tale title…"
                    aria-label="Search by tale title"
                    autocomplete="off"
                    bind:value={searchInput}
                />
                <button class="btn btn-purple" type="submit" aria-label="Search">
                    <i class="fas fa-search" aria-hidden="true"></i>
                </button>
            </div>
        </form>
    {/snippet}
</AdminPageHeader>

{#if content.length === 0}
    <AdminEmpty icon="fa-book-open" title="No tales found" hint="Try a different search." />
{:else}
    <div class="row" use:autoAnimate>
        {#each content as item (item.id)}
            <div class="col-12 col-md-6 col-xl-4 mb-4 d-flex">
                <AdminContent {item} image_proxy={data.image_proxy} deleteContent={refresh} editContent={refresh}/>
            </div>
        {/each}
    </div>
{/if}

<AdminPagination {page} {totalPages} {total} label="tales" baseParams={{ q }} />
