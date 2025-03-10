<script>
    import { tooltip } from "@svelte-plugins/tooltips";

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        },
        theme: 'text-center w-auto'
    };

    /** @type {{url?: string, username?: string, id?: string, size?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        id = '',
        size = '100px',
        image_proxy = null
    } = $props();

    let isAvatarLoaded = $derived(url && url !== '');
    let isDragging = false;
    let dragTimeout;

    // Prevent clicking while dragging.
    function handlePointerDown() {
        isDragging = false;
        clearTimeout(dragTimeout);
    }

    function handlePointerMove() {
        isDragging = true;
    }

    function handlePointerUp() {
        dragTimeout = setTimeout(() => {
            isDragging = false;
        }, 100);
    }

    function handlePointerLeave() {
        dragTimeout = setTimeout(() => {
            isDragging = false;
        }, 100);
    }

    function handleClick(event) {
        if (isDragging) {
            event.preventDefault();
        }
    }
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
<div class="d-flex justify-content-center">
    <a href={`/profile/${id}`} class="text-decoration-none" draggable="false" onclick={handleClick} onpointerdown={handlePointerDown}
       onpointermove={handlePointerMove} onpointerup={handlePointerUp} onpointerleave={handlePointerLeave} aria-label="View profile of {username}" use:tooltip={{...tooltipConfig}} title="{username}'s Profile">
        {#if !isAvatarLoaded}
            <div class="placeholder-glow" style="width: {size}; height: {size};">
                <div class="placeholder rounded-circle w-100 h-100"></div>
            </div>
        {:else}
            <img src={!url.startsWith(image_proxy) ? (image_proxy + url + '?width=250') : url} alt='{username} Avatar' class="rounded-circle avatar-style" width={size} height={size} draggable="false">
        {/if}
    </a>
</div>

<style>
    .avatar-style {
        box-shadow: 0 0 0 0 rgba(92, 0, 166, 0.75);
        transition: all 0.15s ease-in-out;
    }

    .avatar-style:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
    }
</style>