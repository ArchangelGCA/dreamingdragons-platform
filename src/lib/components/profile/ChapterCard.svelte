<script>
    import {toast} from "$lib/components/svelte-toast";
    import { tooltip } from "svelte-tooltip-gca";
    import {deserialize} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import { createChapterPath } from "$lib/utils/slugs.js";
    import PopularBadge from "$lib/components/pages/PopularBadge.svelte";
    import PopularGlow from "$lib/components/pages/PopularGlow.svelte";

    /** @type {{content: any, image_proxy: any, index: any, user_id: any, bookTitle?: string}} */
    let {
        content,
        image_proxy,
        index,
        bookTitle = 'Book' // Default if not provided for backward compatibility
    } = $props();

    let likeActionActive = false;
    let finalLinkImage = $derived(image_proxy && !content.chapter_image_url.startsWith(image_proxy) ? image_proxy + content.chapter_image_url + '?width=750&quality=80' : content.chapter_image_url);
    
    // Generate SEO-friendly URL
    let chapterUrl = $derived(createChapterPath(bookTitle, content.book_id, content.title, content.id));

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
        data.append('chapterId', content.id);

        const response = await fetch('?/like_chapter', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200) {
                if (!content.is_liked) {
                    toast.push('Chapter liked ❤️', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                } else {
                    toast.push('Chapter unliked 💔', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                }
                await invalidateAll();
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            //content.is_liked = !content.is_liked;

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

<PopularGlow likes={content.chapter_likes?.length ?? 0} class="rounded-4 w-100">
<div class="card border-0 bg-black bg-opacity-50 img-home w-100 rounded-4" use:tooltip={{...tooltipConfig, content: 'View'}}
     >
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        <!-- Popular Badge for chapters -->
        <PopularBadge likes={content.chapter_likes?.length ?? 0} size="sm" position="top-left" />
        {#if finalLinkImage}
            <a href="{chapterUrl}">
                <img src={finalLinkImage} alt="Chapter {content.title}" class="w-100 h-100 content-image to-scale rounded-bottom-4" loading="lazy"
                     style="object-fit: cover; position: absolute; top: 0; left: 0;">
                <div class="chapter-number-over">{index}</div>
            </a>
        {:else}
            <div class="chapter-number">{content.id}</div>
        {/if}
    </div>
    <a href="{chapterUrl}" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-4 ps-3 pb-1 pt-2 mx-0">
                <div class="col-9 my-auto">
                    <span class="h5 text-light">{content.title}</span>
                </div>
                <div class="col-3 mb-1 text-end">
                    <button class="btn btn-link text-decoration-none p-0 w-auto me-4" onclick={handleHeartClick} use:tooltip={{...tooltipConfig, content: content.is_liked ? 'Unlike' : 'Like'}}>
                        <span class="heart-icon {content.is_liked ? 'liked' : 'unliked'}">
                            <i class="fas fa-heart fa-3x"></i>
                            <span class="likes-counter">{content.chapter_likes.length}</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </a>
</div>
</PopularGlow>

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
        background:
            radial-gradient(220px 90px at 50% 120%, rgba(255, 123, 43, 0.45) 0%, rgba(196, 0, 255, 0.25) 45%, transparent 75%),
            linear-gradient(180deg, hsla(273, 100%, 22%, 0.55) 0%, hsl(273, 75%, 16%) 100%);
        border-top: 1px solid rgba(255, 171, 94, 0.22);
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