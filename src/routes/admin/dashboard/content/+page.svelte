<script>
    import AdminContent from "$lib/components/admin/AdminContent.svelte";
    import autoAnimate from "@formkit/auto-animate";
    import {invalidateAll} from "$app/navigation";

    /** @type {{data: any}} */
    let { data } = $props();
    let {content, image_proxy} = $state(data);
    $effect.pre(() => {
        ({content, image_proxy} = data)
    });

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
        <h2>Manage Content</h2>
    </div>
</div>

<div class="row" use:autoAnimate>
    {#each content as item (item.id)}
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <AdminContent {item} {image_proxy} deleteContent={handleDelete} editContent={handleEditContent}/>
        </div>
    {/each}
</div>
