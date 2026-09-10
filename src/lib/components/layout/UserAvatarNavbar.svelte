<script>
    import { resolveImageUrl } from '$lib/utils/images.js';
    /** @type {{url?: string, username?: string, size?: string, classes?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        size = '100px',
        classes = '',
        image_proxy = null
    } = $props();

    // NOTE: image_proxy is deprecated (external optimizer decommissioned).
    // Serve original at best quality; kept in props for backwards compat.
    let finalAvatarUrl = $derived(resolveImageUrl(url, image_proxy, ''));
    let isAvatarLoaded = $derived(url !== '' && url !== null && finalAvatarUrl !== null && finalAvatarUrl !== '');

    // Get the first letter of the username for the fallback avatar
    let initial = $derived(username && username.length > 0 ? username.charAt(0).toUpperCase() : '?');
    
    // Parse size to get numeric value for font size calculation
    let sizeNum = $derived(parseInt(size) || 100);
    let fontSize = $derived(Math.round(sizeNum * 0.45));
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
{#if !isAvatarLoaded}
    <div 
        class="avatar-fallback d-inline-flex align-items-center justify-content-center rounded-circle {classes}"
        style="width: {size}; height: {size}; font-size: {fontSize}px;"
        title="{username}"
        aria-label="{username}'s avatar"
    >
        <span class="avatar-initial">{initial}</span>
    </div>
{:else}
    <img
        src={finalAvatarUrl}
        alt='{username} avatar'
        class="rounded-circle avatar {classes}"
        width={size}
        height={size}
        loading="lazy"
        decoding="async">
{/if}

<style>
    .avatar {
        transition: all 0.15s ease-in-out;
    }

    .avatar:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
        scale: 1.1;
    }

    .avatar-fallback {
        background: var(--dd-deep-2);
        border: 2px solid rgba(var(--dd-bright-rgb), 0.4);
        transition: all 0.15s ease-in-out;
        user-select: none;
    }

    .avatar-fallback:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
        scale: 1.1;
        border-color: rgba(var(--dd-bright-rgb), 0.7);
    }

    .avatar-initial {
        color: var(--text-color);
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        line-height: 1;
    }
</style>