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

    export let url = '';
    export let username = '';
    export let id = '';
    export let size = '100px';
    export let image_proxy = null;

    //let avatarUrl = '';
    let isAvatarLoaded = false;
    let isDragging = false;
    let dragTimeout;

    /*$: if (url && url !== '' && !isAvatarLoaded) {
        avatarUrl = url;
        if (image_proxy){
            if (!avatarUrl.startsWith(image_proxy)) avatarUrl = image_proxy + avatarUrl + '?width=250';
        }
        isAvatarLoaded = true;
    } else if ((!url || url === '') && avatarUrl !== '') {
        avatarUrl = '';
        isAvatarLoaded = false;
    }*/

    $: if (url && url !== ''){
        isAvatarLoaded = true;
    } else {
        isAvatarLoaded = false;
    }

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
    <a href={`/profile/${id}`} class="text-decoration-none" use:tooltip={{...tooltipConfig}} title="{username}'s Profile" draggable="false" on:click={handleClick} on:pointerdown={handlePointerDown}
       on:pointermove={handlePointerMove} on:pointerup={handlePointerUp} on:pointerleave={handlePointerLeave} aria-label="View profile of {username}">
        {#if !isAvatarLoaded}
            <div class="placeholder-glow" style="width: {size}; height: {size};">
                <div class="placeholder rounded-circle w-100 h-100"></div>
            </div>
        {:else}
            <img src={!url.startsWith(image_proxy) ? (image_proxy + url + '?width=250') : url} alt={username} class="rounded-circle avatar-style" width={size} height={size}>
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