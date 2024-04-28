<script>
    export let url = '';
    export let username = '';
    export let size = '100px';

    export let classes = '';

    let avatarUrl = '';
    let isAvatarLoaded = false;

    $: if (url && url !== '' && !isAvatarLoaded) {
        avatarUrl = url;
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
    <img src={avatarUrl} alt={username} class="rounded-circle {classes}" width={size} height={size}>
{/if}