<script>
    import {onMount} from "svelte";
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";

    export let content;
    let isLoading = true;
    let isLiked = content.is_liked;

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
        const imgElement = document.querySelector('.img-home img');
        if (imgElement && imgElement.complete) {
            handleImageLoad();
        }
    });

    function handleImageLoad() {
        if (!isLoading) return;
        isLoading = false;
        console.log('Image loaded');
    }

    async function handleHeartClick() {
        const data = new FormData();
        data.append('contentId', content.book_id);

        const response = await fetch('?/like', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                isLiked = !isLiked;
            } else {
                toast.push('Error during action: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during action', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }
    }
</script>

<div class="card border-0 bg-placeholder img-home w-100" data-aos="fade-up">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background"
         style="height: 45vh; overflow: hidden;">
        {#if isLoading}
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {/if}
        <img src={content.book_cover_url} alt="Book cover" class="w-100 h-100" loading="lazy" style="object-fit: cover; position: absolute; top: 0; left: 0;" on:load={handleImageLoad}>
    </div>
    <div class="card-body border-top border-light-subtle pb-2">
        <div class="row justify-content-center">
            <div class="col-9">
                <span class="h5">{content.book_title}</span>
                <p class="card-text"><small class="text-muted">Posted by {content.username}</small></p>
            </div>
            <div class="col-3 mb-1 text-end">
                <button class="btn btn-link text-decoration-none p-0 w-auto me-4" on:click={handleHeartClick}>
                    <i class="fas fa-heart fa-3x {isLiked ? 'liked' : 'unliked'}"></i>
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

    .liked {
        color: #bd135a;
        animation: heart-pulse 0.3s ease-in-out;
        transition: 0.15s all ease-in-out;
    }

    .liked:hover {
        transform: scale(1.1);
    }

    .unliked {
        transform: scale(0.8);
        color: #ffffff;
        animation: heart-unpulse 0.3s ease-in-out;
        transition: 0.15s all ease-in-out;
    }

    .unliked:hover {
        color: #bd135a;
        transform: scale(0.9);
    }

    @keyframes heart-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes heart-unpulse {
        0% { transform: scale(0.8); }
        50% { transform: scale(1); }
        100% { transform: scale(0.8); }
    }
</style>