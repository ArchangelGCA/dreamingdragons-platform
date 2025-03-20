<script>
    /** @type {{src?: any, alt?: any, image_proxy?: any}} */
    let {
        src = '',
        alt = 'image',
        size = 1920,
        image_proxy = null
    } = $props();

    let finalImageUrl = $derived(image_proxy && src && src !== '' && !src.startsWith(image_proxy) ? image_proxy + src + '?width=' + size : src);
    let isImageLoaded = $state(false);

    function handleImageLoad() {
        isImageLoaded = true;
    }
</script>

{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100"></div>
    </div>
    <img src={finalImageUrl} {alt} class="img-fluid rounded-4" style="width: 1px; height: 1px" onload={handleImageLoad}>
{:else}
    <img src={finalImageUrl} {alt} class="img-fluid rounded-4" style="max-height: 82vh;">
{/if}

<!--
<img {src} {alt} class="{isImageLoaded ? '' : 'd-none'} img-fluid rounded-4" on:load={() => isImageLoaded = true} style="max-height: 82vh">
{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100"></div>
    </div>
{/if}
-->