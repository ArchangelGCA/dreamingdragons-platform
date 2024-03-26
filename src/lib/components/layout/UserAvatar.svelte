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
    export let supabase;
    export let size = '100px';

    let avatarUrl = '';

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
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
            }
        }
    }

    $: if (url) downloadImage(url);
</script>

<!-- Circle avatar, using Bootstrap 5 classes -->
<div class="d-flex justify-content-center">
    <a href={`/profile/${id}`} class="text-decoration-none" use:tooltip={{...tooltipConfig}} title="{username}'s Profile">
        <img src={avatarUrl} alt={username} class="rounded-circle avatar-style" width={size} height={size}>
    </a>
</div>