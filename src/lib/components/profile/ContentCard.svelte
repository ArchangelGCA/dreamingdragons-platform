<script>
    import {onMount} from "svelte";

    export let content;
    let isLoading = true;
    let backgroundImage = '';

    async function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }

    function handleHeartClick() {
        console.log('Heart clicked');
    }

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    onMount(async () => {
        try {
            await loadImage(content.book_cover_url);
            backgroundImage = `url(${content.book_cover_url})`;
        } catch (error) {
            console.error('Failed to load image', error);
        } finally {
            isLoading = false;
        }
    });
</script>

<div class="card border-0 bg-placeholder img-home w-100" data-aos="fade-up">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background"
         style="background-image: {backgroundImage}; background-size: cover; background-position: center; height: 45vh;">
        {#if isLoading}
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {/if}
    </div>
    <div class="card-body border-top border-light-subtle pb-2">
        <div class="row justify-content-center">
            <div class="col-9">
                <span class="h5">{content.book_title}</span>
                <p class="card-text"><small class="text-muted">Posted by {content.username}</small></p>
            </div>
            <div class="col-3 mb-1 text-end">
                <button class="btn btn-link text-decoration-none p-0 w-auto me-4" on:click={handleHeartClick}>
                    <i class="fas fa-heart fa-3x"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .btn-link {
        color: inherit;
        text-decoration: none;
    }
</style>