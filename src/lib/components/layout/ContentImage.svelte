<script>
    /** @type {{src?: any, alt?: any, image_proxy?: any}} */
    let {
        src = '',
        alt = 'image',
        size = 1920,
        image_proxy = null
    } = $props();

    let finalImageUrl = $derived(image_proxy && src && src !== '' && !src.startsWith(image_proxy) ? image_proxy + src : src);
    let isImageLoaded = $state(false);
    
    let imageSrcSet = $derived.by(() => {
        if (!finalImageUrl) return '';
        const baseUrl = finalImageUrl;
        return `${baseUrl}?width=${Math.round(size * 1.5)}&quality=85 2x, ${baseUrl}?width=${size}&quality=85 1x`;
    });
</script>

{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100">
            <img 
                srcset={imageSrcSet}
                src="{finalImageUrl}?width={size}&quality=85" 
                {alt} 
                class="img-fluid rounded-4" 
                style="width: 1px; height: 1px"
                loading="lazy" 
                onload={() => isImageLoaded = true}>
        </div>
    </div>
{:else}
    <img 
        srcset={imageSrcSet}
        src="{finalImageUrl}?width={size}&quality=85" 
        {alt} 
        class="img-fluid rounded-4" 
        style="max-height: 82vh;"
        loading="lazy">
{/if}