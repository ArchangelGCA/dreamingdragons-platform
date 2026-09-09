<script>
    import AdminUser from "$lib/components/admin/AdminUser.svelte";
    import AdminPagination from "$lib/components/admin/AdminPagination.svelte";
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

<div class="row mb-2">
    <div class="col text-center">
        <h2>Users</h2>
        <p class="text-secondary small mb-0">{total} matching · page {page} of {totalPages}</p>
    </div>
</div>

<form class="row g-2 align-items-end mb-2" onsubmit={submitSearch} role="search" aria-label="Search users">
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
            <button class="btn btn-purple" type="submit">
                <i class="fas fa-search" aria-hidden="true"></i><span class="visually-hidden">Search</span>
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

{#if profiles.length === 0}
    <div class="text-center py-5">
        <i class="fas fa-users-slash fa-3x mb-3 text-secondary" aria-hidden="true"></i>
        <h3 class="h5">No users found</h3>
        <p class="text-secondary small mb-0">Try a different search or filter.</p>
    </div>
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
