<script>
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    export let data;

    let { session, supabase, profile } = data;

    let username = '';
    let website = '';
    let avatarUrl = '';
    let finalAvatarUrl = '';
    let count = 0;

    if (profile !== null) {
        try {
            username = profile.username;
        } catch (e2) {
            username = '';
        }
        try {
            website = profile.website;
        } catch (e3) {
            website = '';
        }
        try {
            avatarUrl = profile.avatar_url;
        } catch (e4) {
            avatarUrl = '';
        }
    }

    async function downloadAvatar(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            finalAvatarUrl = URL.createObjectURL(data);
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
            }
        }
    }

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-12 px-0">
            {#if finalAvatarUrl === ''}
                <div class="row text-center justify-content-center mt-3">
                    <div class="col-auto">
                        <div class="spinner-border text-light align-self-center" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="bg-image rounded-bottom-5" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url({finalAvatarUrl}), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                    <div class="row justify-content-center align-items-end" style="height: 100%;">
                        <div class="col-auto">
                            <img src="{finalAvatarUrl}" alt="{username}" loading="lazy" class="rounded-circle bg-dark shadow" width="150px" height="150px" id="profileIcon">
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
    <div class="row justify-content-center mt-3">
        <div class="col text-center">
            <p class="h1">{username}</p>
        </div>
    </div>
    <div class="row mt-5 mb-5 justify-content-center">
        <div class="col text-center">
            <p class="h1">TODO</p>
            <i class="fa-solid fa-helmet-safety fa-5x text-warning" data-aos="zoom-in"></i>
        </div>
    </div>
</div>