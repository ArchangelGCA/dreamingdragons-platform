<script>
    export let url = '';
    export let username = '';
    export let supabase;
    export let size = '100px';

    export let classes = '';

    let avatarUrl = '';
    let isAvatarLoaded = false;

    if (!supabase) {
        throw new Error('supabase is not defined');
    }

    const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            const url = URL.createObjectURL(data);
            avatarUrl = url;
            isAvatarLoaded = true;
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
            }
        }
    }

    $: if (url) downloadImage(url);
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
{#if !isAvatarLoaded}
    <div class="spinner-border text-light mt-2 mb-1" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
{:else}
    <img src={avatarUrl} alt={username} class="rounded-circle {classes}" width={size} height={size}>
{/if}