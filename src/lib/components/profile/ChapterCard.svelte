<script>
    import {onMount} from "svelte";
    import {toast} from "@zerodevx/svelte-toast";
    import { tooltip } from "@svelte-plugins/tooltips";

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: '#5c00a6',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    export let content;
    export let index;
    let isLoading = true;
    let likes = content.chapter_likes_count;

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
    }
</script>

<div class="card border-0 bg-placeholder img-home w-100 rounded-4" data-aos="fade-up" use:tooltip={{...tooltipConfig}}
     title="View">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-top-4"
         style="height: 45vh; overflow: hidden;">
        {#if isLoading}
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {/if}
        {#if content.chapter_image_url}
            <img src={content.chapter_image_url} alt="Chapter image" class="w-100 h-100 content-image" loading="lazy"
                 style="object-fit: cover; position: absolute; top: 0; left: 0;" on:load={handleImageLoad}>
        {:else}
            <div class="chapter-number">{content.chapter_id}</div>
        {/if}
    </div>
    <div class="card-body border-top border-light-subtle pb-2 rounded-bottom-4">
        <div class="row justify-content-center">
            <div class="col-9 my-auto">
                <span class="h5"><b class="fw-bolder text-primary-emphasis">{index}</b> - {content.chapter_title}</span>
            </div>
            <div class="col-3 mb-1 text-end">
                <span class="likes-icon text-primary-emphasis" use:tooltip={{...tooltipConfig}} title="Likes">
                    <i class="fas fa-heart fa-3x"></i>
                    <span class="likes-counter">{likes}</span>
                </span>
            </div>
        </div>
    </div>
</div>

<style>
    .chapter-number {
        font-size: 3rem;
        color: #fff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .content-image {
        transition: 0.2s all ease-in-out;
    }

    .content-image:hover {
        /* also change luminance, but only to its edges, giving a cool effect to its edges */
        filter: brightness(1.3);
        transform: scale(1.1);
    }

    .likes-icon {
        position: relative;
        display: inline-block;
    }

    .likes-icon .fas.fa-heart {
        font-size: 3rem;
    }

    .likes-icon .likes-counter {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 1rem;
    }
</style>