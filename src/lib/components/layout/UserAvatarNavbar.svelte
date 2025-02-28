<script>
    /** @type {{url?: string, username?: string, size?: string, classes?: string, image_proxy?: any}} */
    let {
        url = '',
        username = '',
        size = '100px',
        classes = '',
        image_proxy = null
    } = $props();

    let avatarUrl = $derived(url && url !== '' ? url : '');
    let finalAvatarUrl = $derived(image_proxy && avatarUrl !== null && avatarUrl !== '' && !avatarUrl.startsWith(image_proxy) ? image_proxy + avatarUrl : avatarUrl);
    let isAvatarLoaded = $derived(url !== '' && url !== null && avatarUrl !== null && avatarUrl !== '' && finalAvatarUrl !== null && finalAvatarUrl !== '');

    /*$effect.pre(() => {
        if (url && url !== '' && !isAvatarLoaded) {
            //avatarUrl = url;
            if (image_proxy){
                //if (!avatarUrl.startsWith(image_proxy)) avatarUrl = image_proxy + avatarUrl + '?width=250';
            }
            isAvatarLoaded = true;
        } else if ((!url || url === '') && avatarUrl !== '') {
            //avatarUrl = '';
            isAvatarLoaded = false;
        }
    });*/
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