<script>
    import AdminUser from "$lib/components/admin/AdminUser.svelte";

    export let data;
    let {profiles, supabase} = data;
    $: ({profiles, supabase} = data);

</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Manage Users</h2>
    </div>
</div>
<div class="row">
    <div class="col">
        {#each profiles as profile (profile.id)}
            <AdminUser {profile} {supabase}/>
        {/each}
    </div>
</div>

