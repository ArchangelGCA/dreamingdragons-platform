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
<div class="d-flex justify-content-center">
    <a href={`/profile/${id}`} class="text-decoration-none" use:tooltip={{...tooltipConfig}} title="{username}'s Profile">
        {#if !isAvatarLoaded}
            <div class="placeholder-glow" style="width: {size}; height: {size};">
                <div class="placeholder rounded-circle w-100 h-100"></div>
            </div>
        {:else}
            <img src={avatarUrl} alt={username} class="rounded-circle avatar-style" width={size} height={size}>
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