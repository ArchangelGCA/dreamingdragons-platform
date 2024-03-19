<script>
    import {onMount} from "svelte";
    import { tooltip } from "@svelte-plugins/tooltips";

    export let comment;
    export let supabase;

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

    let finalAvatarUrl = '';
    let loadedAvatar = false;
    let avatarFound = true;
    let avatarUrl = comment.profiles.avatar_url;

    async function downloadAvatar(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            finalAvatarUrl = URL.createObjectURL(data);
            loadedAvatar = true;
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
                avatarFound = false;
            }
        }
    }

    const createdAt = new Date(comment.created_at);
    const createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="row mb-3">
    <div class="col-auto">
        {#if loadedAvatar === false}
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {:else if avatarFound === true}
            <a href="/profile?id={comment.user_id}">
                <img src="{finalAvatarUrl}" alt="{comment.profiles.username}" class="img-fluid rounded-circle" style="max-height: 50px" loading="lazy">
            </a>
        {:else}
            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
        {/if}
    </div>
    <div class="col align-middle pt-1">
        <p class="mb-0"><a class="link-light text-decoration-none" href="/profile?id={comment.user_id}">{comment.profiles.username}</a> <span class="text-secondary">{createdAtFormatted}</span></p>
        <span class="text-secondary-emphasis">{comment.content}</span>
    </div>
</div>