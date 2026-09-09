<script>
    import { resolveImageUrl } from '$lib/utils/images.js';
    /** @type {{src?: any, alt?: any, image_proxy?: any}} */
    let {
        src = '',
        alt = 'image',
        size = 1920,
        image_proxy = null
    } = $props();

    // image_proxy deprecated: serve original at best quality.
    let finalImageUrl = $derived(resolveImageUrl(src, image_proxy));
    let isImageLoaded = $state(false);
</script>

{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100">
            <img
                src={finalImageUrl}
                {alt}
                class="img-fluid rounded-4"
                style="width: 1px; height: 1px"
                loading="lazy"
                decoding="async"
                onload={() => isImageLoaded = true}>
        </div>
    </div>
{:else}
    <img
        src={finalImageUrl}
        {alt}
        class="img-fluid rounded-4"
        style="max-height: 82vh;"
        loading="lazy"
        decoding="async">
{/if}