<script>
    import {tooltip} from "svelte-tooltip-gca";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import { createProfilePath } from '$lib/utils/slugs.js';
    import { resolveImageUrl } from '$lib/utils/images.js';

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

    // Get the first letter of the username for the fallback avatar
    let initial = $derived(username && username.length > 0 ? username.charAt(0).toUpperCase() : '?');
    
    // Parse size to get numeric value for font size calculation
    let sizeNum = $derived(parseInt(size) || 100);
    let fontSize = $derived(Math.round(sizeNum * 0.45));

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
<div class="d-flex justify-content-center" use:tooltip={{...tooltipConfig, content: `${username}'s Profile`}}>
    {#if link}
        <a href={createProfilePath(username, id)} class="text-decoration-none" draggable="false"
           aria-label="View profile of {username}">
            {#if !isAvatarLoaded}
                <div 
                    class="avatar-fallback d-flex align-items-center justify-content-center rounded-circle"
                    style="width: {size}; height: {size}; font-size: {fontSize}px;"
                >
                    <span class="avatar-initial">{initial}</span>
                </div>
            {:else}
                {@const baseUrl = resolveImageUrl(url, image_proxy)}
                <img
                    src={baseUrl}
                    alt='{username} Avatar'
                    class="rounded-circle avatar-style"
                    style="width: {size}; height: {size};"
                    loading="lazy"
                    decoding="async"
                    draggable="false">
            {/if}
        </a>
    {:else}
        {#if !isAvatarLoaded}
            <div
                class="avatar-fallback d-flex align-items-center justify-content-center rounded-circle"
                style="width: {size}; height: {size}; font-size: {fontSize}px;"
            >
                <span class="avatar-initial">{initial}</span>
            </div>
        {:else}
            {@const baseUrl = resolveImageUrl(url, image_proxy)}
            <img
                src={baseUrl}
                alt='{username} Avatar'
                class="rounded-circle avatar-style"
                style="width: {size}; height: {size};"
                loading="lazy"
                decoding="async"
                draggable="false">
        {/if}
    {/if}
</div>

<style>
    .avatar-style {
        box-shadow: none;
        transition: all 0.15s ease-in-out;
        object-fit: cover;
        flex-shrink: 0;
    }

    .avatar-style:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
    }

    .avatar-fallback {
        background: var(--dd-deep-2);
        border: 2px solid rgba(var(--dd-bright-rgb), 0.4);
        transition: all 0.15s ease-in-out;
        user-select: none;
        flex-shrink: 0;
    }

    .avatar-fallback:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
        border-color: rgba(var(--dd-bright-rgb), 0.7);
    }

    .avatar-initial {
        color: var(--text-color);
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        line-height: 1;
    }
</style>