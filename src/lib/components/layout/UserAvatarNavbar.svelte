<script>
    /** @type {{url?: string, username?: string, size?: string, classes?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        size = '100px',
        classes = '',
        image_proxy = null
    } = $props();

    let finalAvatarUrl = $derived(image_proxy && url !== null && url !== '' && !url.startsWith(image_proxy) ? image_proxy + url : url);
    let isAvatarLoaded = $derived(url !== '' && url !== null && finalAvatarUrl !== null && finalAvatarUrl !== '');
    
    let avatarSrcSet = $derived.by(() => {
        if (!isAvatarLoaded) return '';
        const baseUrl = finalAvatarUrl;
        return `${baseUrl}?width=375 2x, ${baseUrl}?width=250 1x`;
    });

    // Get the first letter of the username for the fallback avatar
    let initial = $derived(username && username.length > 0 ? username.charAt(0).toUpperCase() : '?');
    
    // Parse size to get numeric value for font size calculation
    let sizeNum = $derived(parseInt(size) || 100);
    let fontSize = $derived(Math.round(sizeNum * 0.45));
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
{#if !isAvatarLoaded}
    <div 
        class="avatar-fallback d-flex align-items-center justify-content-center rounded-circle {classes}"
        style="width: {size}; height: {size}; font-size: {fontSize}px;"
        title="{username}"
        aria-label="{username}'s avatar"
    >
        <span class="avatar-initial">{initial}</span>
    </div>
{:else}
    <img 
        srcset={avatarSrcSet}
        src="{finalAvatarUrl}?width=250"
        alt='{username} avatar' 
        class="rounded-circle avatar {classes}" 
        width={size} 
        height={size}
        loading="lazy">
{/if}

<style>
    .avatar {
        transition: all 0.15s ease-in-out;
    }

    .avatar:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        scale: 1.1;
    }

    .avatar-fallback {
        background: linear-gradient(135deg, #5c00a6 0%, #8b00d4 50%, #5c00a6 100%);
        border: 2px solid rgba(196, 0, 255, 0.4);
        box-shadow: 0 0 0.3rem 0.1rem rgba(92, 0, 166, 0.4);
        transition: all 0.15s ease-in-out;
        user-select: none;
    }

    .avatar-fallback:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        scale: 1.1;
        border-color: rgba(196, 0, 255, 0.7);
    }

    .avatar-initial {
        color: #ffffff;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        line-height: 1;
    }
</style>