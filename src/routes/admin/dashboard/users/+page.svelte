<script>
    import AdminUser from "$lib/components/admin/AdminUser.svelte";
    import AdminPagination from "$lib/components/admin/AdminPagination.svelte";
    import AdminPageHeader from "$lib/components/admin/AdminPageHeader.svelte";
    import AdminEmpty from "$lib/components/admin/AdminEmpty.svelte";
    import { goto } from "$app/navigation";

    /** @type {{data: any}} */
    let { data } = $props();
    let profiles = $derived(data.profiles ?? []);
    let page = $derived(data.page ?? 1);
    let totalPages = $derived(data.totalPages ?? 1);
    let total = $derived(data.total ?? 0);
    let q = $derived(data.q ?? '');
    let status = $derived(data.status ?? 'all');

    // Writable derived: typing assigns locally, navigation re-evaluates from data.
    let searchInput = $derived(data.q ?? '');

    function submitSearch(event) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set('q', searchInput.trim());
        if (status && status !== 'all') params.set('status', status);
        params.set('page', '1');
        goto(`?${params.toString()}`, { keepFocus: true });
    }

    function setStatus(next) {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (next && next !== 'all') params.set('status', next);
        params.set('page', '1');
        goto(`?${params.toString()}`, { keepFocus: true });
    }
</script>

<AdminPageHeader title="Users" subtitle="Warn, block and manage creator accounts." meta="{total} matching · page {page} of {totalPages}">
    {#snippet actions()}
        <form class="row g-2 align-items-end" onsubmit={submitSearch} role="search" aria-label="Search users">
            <div class="col-12 col-md-7">
                <label class="form-label small mb-1" for="user-search">Search by username</label>
                <div class="input-group">
                    <input
                        id="user-search"
                        class="form-control"
                        type="search"
                        placeholder="e.g. archangel"
                        autocomplete="off"
                        bind:value={searchInput}
                    />
                    <button class="btn btn-purple" type="submit" aria-label="Search">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div class="col-12 col-md-5">
                <label class="form-label small mb-1" for="user-status">Filter</label>
                <select id="user-status" class="form-select" value={status} onchange={(e) => setStatus(e.currentTarget.value)}>
                    <option value="all">All users</option>
                    <option value="active">Can upload</option>
                    <option value="blocked">Upload blocked</option>
                    <option value="warned">Warned</option>
                </select>
            </div>
        </form>
    {/snippet}
</AdminPageHeader>

{#if profiles.length === 0}
    <AdminEmpty icon="fa-users-slash" title="No users found" hint="Try a different search or filter." />
{:else}
    <div class="row">
        <div class="col">
            {#each profiles as profile (profile.id)}
                <AdminUser {profile} image_proxy={data.image_proxy} />
            {/each}
        </div>
    </div>
{/if}

<AdminPagination {page} {totalPages} {total} label="users" baseParams={{ q, status }} />
