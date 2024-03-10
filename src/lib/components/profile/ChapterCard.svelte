<script>
    import {onMount} from "svelte";
    import {toast} from "@zerodevx/svelte-toast";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {deserialize} from "$app/forms";

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    export let content;
    export let index;
    let isLoading = true;
    let likes = content.chapter_likes_count;
    let liked = content.is_liked;
    let likeActionActive = false;

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

    function handleMouseEnter(e) {
        e.target.parentElement.querySelector('.to-scale').style.transform = 'scale(1.1)';
    }

    function handleMouseLeave(e) {
        e.target.parentElement.querySelector('.to-scale').style.transform = 'scale(1.0)';
    }

    async function handleHeartClick(e){
        e.preventDefault();

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;

        const data = new FormData();
        data.append('chapterId', content.chapter_id);

        liked = !liked;

        if (liked) {
            likes++;
        } else {
            likes--;
        }

        const response = await fetch('?/like_chapter', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                // isLiked = !isLiked;
            } else {
                liked = !liked;
                likes--;

                toast.push('Error during action: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            liked = !liked;
            likes--;

            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        likeActionActive = false;
    }
</script>

<div class="card border-0 bg-placeholder img-home w-100 rounded-4" use:tooltip={{...tooltipConfig}}
     title="View">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        {#if isLoading}
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {/if}
        {#if content.chapter_image_url}
            <a href="/content/{content.book_id}/{content.chapter_id}">
                <img src={content.chapter_image_url} alt="Chapter {content.chapter_title}" class="w-100 h-100 content-image to-scale rounded-bottom-4" loading="lazy"
                     style="object-fit: cover; position: absolute; top: 0; left: 0;" on:load={handleImageLoad}>
                <div class="chapter-number-over">{index}</div>
            </a>
        {:else}
            <div class="chapter-number">{content.chapter_id}</div>
        {/if}
    </div>
    <a href="/content/{content.book_id}/{content.chapter_id}" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-4 ps-3 pb-1 pt-2 mx-0">
                <div class="col-9 my-auto">
                    <span class="h5 text-light">{content.chapter_title}</span>
                </div>
                <div class="col-3 mb-1 text-end">
                    <button class="btn btn-link text-decoration-none p-0 w-auto me-4" on:click|stopPropagation={handleHeartClick} use:tooltip={{...tooltipConfig}} title={liked ? 'Unlike' : 'Like'}>
                        <span class="heart-icon {liked ? 'liked' : 'unliked'}">
                            <i class="fas fa-heart fa-3x"></i>
                            <span class="likes-counter">{likes}</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </a>
    <!--<div class="card-body pb-2 rounded-bottom-4">
        <div class="row justify-content-center">
            <div class="col-9 my-auto">
                <span class="h5">{content.chapter_title}</span>
            </div>
            <div class="col-3 mb-1 text-end">
                <button class="btn btn-link text-decoration-none p-0 w-auto me-4" on:click={handleHeartClick} use:tooltip={{...tooltipConfig}} title={liked ? 'Unlike' : 'Like'}>
                    <span class="likes-icon {liked ? 'liked' : 'unliked'}">
                        <i class="fas fa-heart fa-3x"></i>
                        <span class="likes-counter">{likes}</span>
                    </span>
                </button>
            </div>
        </div>
    </div>-->
</div>

<style>
    .card {
        transition: 0.12s all ease-in-out;
    }

    .card:hover {
        box-shadow: 0 0 10px 0 rgb(211, 26, 103);
    }

    .chapter-number {
        font-size: 3rem;
        color: #fff;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .chapter-number-over {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(74, 0, 126, 0.75);
        color: white;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 50%;
        padding-top: 1px;
        font-size: 20px;
        transition: 0.2s all ease-in-out;
    }

    .chapter-number-over:hover {
        background-color: rgba(74, 0, 126, 1);
    }

    .content-image {
        transition: 0.2s all ease-in;
    }

    .content-image:hover {
        filter: brightness(1.3);
        transform: scale(1.1);
    }

    .overlay-custom {
        transition: 0.15s all ease-in-out;
        opacity: 0;
    }

    .overlay-custom:hover{
        opacity: 1 !important;
        backdrop-filter: brightness(1.2) ;
    }

    .custom-overlay-content {
        background: radial-gradient(circle at center, rgba(92, 0, 166, 0.3) 0%, rgba(92, 0, 166, 0.95) 100%);
    }

    .to-scale {
        transition: transform 0.12s ease-in;
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

    .heart-icon {
        position: relative;
        display: inline-block;
    }

    .heart-icon .fas.fa-heart {
        font-size: 3rem;
    }

    .heart-icon .likes-counter {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 1rem;
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