<script>
    import AdminUser from "$lib/components/admin/AdminUser.svelte";
    import Seo from "sk-seo";

    export let data;
    let {profiles, supabase, image_proxy} = data;
    $: ({profiles, supabase} = data);

    const seo = {
        title: 'Admin - Users',
        description: 'Admin Users dashboard for Roses in The Flames platform.',
        siteName: 'Roses in The Flames - Platform',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA',
        index: false
    };
</script>

<Seo {...seo} />

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

