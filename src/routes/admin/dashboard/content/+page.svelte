<script>
    import AdminContent from "$lib/components/admin/AdminContent.svelte";
    import {invalidateAll} from "$app/navigation";

    export let data;
    let { content, supabase } = data;
    $: ({content, chapters} = data)

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

    // For each item in content, format created_at date
    content = content.map(item => {
        item.created_at = formatDate(item.created_at);
        return item;
    });

    async function handleDelete() {
        await invalidateAll();
        // Delete modal-backdrop fade show elements
        const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
        if (modalBackdrop.length > 0) {
            modalBackdrop[0].remove();
        }
    }

</script>

<div class="container py-3" style="height: 100vh">
    <div class="row mb-2">
        <div class="col text-center">
            <h2>Manage Content</h2>
        </div>
    </div>

    <div class="row">
        {#each content as item (item.id)}
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <AdminContent {item} on:delete={handleDelete}/>
            </div>
        {/each}
    </div>
</div>