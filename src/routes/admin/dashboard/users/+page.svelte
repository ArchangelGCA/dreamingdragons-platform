<script>
    import AdminUser from "$lib/components/admin/AdminUser.svelte";

    /** @type {{data: any}} */
    let { data } = $props();
    let {profiles, image_proxy} = $state(data);
    $effect(() => {
        ({profiles} = data);
    });
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Manage Users</h2>
    </div>
</div>
<div class="row">
    <div class="col">
        {#each profiles as profile (profile.id)}
            <AdminUser {profile} {image_proxy}/>
        {/each}
    </div>
</div>

