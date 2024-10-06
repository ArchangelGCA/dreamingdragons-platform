<script>
    import {onMount} from "svelte";

    export let url;
    export let alt;

    onMount(() => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            isImageLoaded = true;
        }
    })

    let isImageLoaded = false;
</script>

{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100"></div>
    </div>
{:else}
    <!-- removed loading lazy -->
    <img src="{url}" alt="{alt}" class="img-fluid rounded-4" style="max-height: 82vh">
{/if}