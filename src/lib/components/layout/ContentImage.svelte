<script>
    import { run } from 'svelte/legacy';

    /** @type {{src?: any, alt?: any, image_proxy?: any}} */
    let { src = $bindable(null), alt = null, image_proxy = null } = $props();

    run(() => {
        if (src && src !== '' && image_proxy) {
            if (!src.startsWith(image_proxy)) src = image_proxy + src + '?width=1920';
        }
    });

    //$: isImageLoaded = false;
</script>

<img {src} {alt} class="img-fluid rounded-4" style="max-height: 82vh">

<!--
<img {src} {alt} class="{isImageLoaded ? '' : 'd-none'} img-fluid rounded-4" on:load={() => isImageLoaded = true} style="max-height: 82vh">
{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100"></div>
    </div>
{/if}
-->