<script>
    /** @type {{url?: string, username?: string, size?: string, classes?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        size = '100px',
        classes = '',
        image_proxy = null
    } = $props();

    let finalAvatarUrl = $derived(image_proxy && url !== null && url !== '' && !url.startsWith(image_proxy) ? image_proxy + url + '?width=250': url);
    let isAvatarLoaded = $derived(url !== '' && url !== null && finalAvatarUrl !== null && finalAvatarUrl !== '');
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
{#if !isAvatarLoaded}
    <div class="spinner-border text-light mt-2 mb-1" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{:else}
    <img src={finalAvatarUrl} alt='{username} avatar' class="rounded-circle avatar {classes}" width={size} height={size}>
{/if}

<style>
    .avatar {
        transition: all 0.15s ease-in-out;
    }

    .avatar:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        scale: 1.1;
    }
</style>