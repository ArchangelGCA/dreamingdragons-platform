<script>
    import {tooltip} from "@svelte-plugins/tooltips";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    /** @type {{url?: string, username?: string, id?: string, size?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        id = '',
        size = '100px',
        image_proxy = null,
        link = true
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
<div class="d-flex justify-content-center" use:tooltip={{...tooltipConfig}} title="{username}'s Profile">
    {#if link}
        <a href={`/profile/${id}`} class="text-decoration-none" draggable="false"
           aria-label="View profile of {username}">
            {#if !isAvatarLoaded}
                <div class="placeholder-glow" style="width: {size}; height: {size};">
                    <div class="placeholder rounded-circle w-100 h-100"></div>
                </div>
            {:else}
                <img src={!url.startsWith(image_proxy) ? (image_proxy + url + '?width=250') : url}
                     alt='{username} Avatar' class="rounded-circle avatar-style" width={size} height={size}
                     draggable="false">
            {/if}
        </a>
    {:else}
        {#if !isAvatarLoaded}
            <div class="placeholder-glow" style="width: {size}; height: {size};">
                <div class="placeholder rounded-circle w-100 h-100"></div>
            </div>
        {:else}
            <img src={!url.startsWith(image_proxy) ? (image_proxy + url + '?width=250') : url}
                 alt='{username} Avatar' class="rounded-circle avatar-style" width={size} height={size}
                 draggable="false">
        {/if}
    {/if}
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