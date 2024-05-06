<script>
    import {onMount} from "svelte";

    export let url;
    export let alt;

    onMount(() => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            isImageLoaded = true;
            console.log('Image loaded');
            console.log('url', url);
            console.log('alt', alt);
        }
    })

    let isImageLoaded = false;
</script>

{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-75 h-100"></div>
    </div>
{:else}
    <img src="{url}" alt="{alt}" class="img-fluid rounded-4" style="max-height: 82vh" loading="lazy">
{/if}