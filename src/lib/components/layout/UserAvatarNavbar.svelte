<script>
    export let url = '';
    export let username = '';
    export let size = '100px';

    export let classes = '';
    export let image_proxy = null;

    let avatarUrl = '';
    let isAvatarLoaded = false;

    $: if (url && url !== '' && !isAvatarLoaded) {
        avatarUrl = url;
        if (image_proxy){
            if (!avatarUrl.startsWith(image_proxy)) avatarUrl = image_proxy + avatarUrl + '?width=250';
        }
        isAvatarLoaded = true;
    } else if ((!url || url === '') && avatarUrl !== '') {
        avatarUrl = '';
        isAvatarLoaded = false;
    }
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
{#if !isAvatarLoaded}
    <div class="spinner-border text-light mt-2 mb-1" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{:else}
    <img src={avatarUrl} alt='{username} avatar' class="rounded-circle avatar {classes}" width={size} height={size}>
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