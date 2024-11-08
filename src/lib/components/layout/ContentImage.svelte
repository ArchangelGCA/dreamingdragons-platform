<script>
    export let url;
    export let alt;

    //$: isImageLoaded = false;
</script>

<img src="{url}" alt="{alt}" class="img-fluid rounded-4" style="max-height: 82vh">

<!--
<img src="{url}" alt="{alt}" class="{isImageLoaded ? '' : 'd-none'} img-fluid rounded-4" on:load={() => isImageLoaded = true} style="max-height: 82vh">
{#if !isImageLoaded}
    <div class="placeholder-glow" style="height: 82vh">
        <div class="placeholder bg-light-subtle rounded-4 w-100 h-100"></div>
    </div>
{/if}
-->