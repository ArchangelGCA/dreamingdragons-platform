<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import {tooltip} from "@svelte-plugins/tooltips";
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from "@formkit/auto-animate";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {createBookPath} from "$lib/utils/slugs.js";
    import ContentTypeBadge from "$lib/components/pages/ContentTypeBadge.svelte";

    /** @type {{content: any, image_proxy: any}} */
    let {content = $bindable(), image_proxy} = $props();
    // let width = 500;
    let likeActionActive = false;
    let finalLinkImage = $derived(image_proxy && !content.cover_url.startsWith(image_proxy) ? image_proxy + content.cover_url + '?width=750&quality=80' : content.cover_url);
    let finalBookTitle = $derived(content.title.length > 35 ? content.title.substring(0, 35) + '...' : content.title);
    let isImageLoaded = $state(false);
    let chapterCount = $derived(content.chapter_count ?? 0);
    
    // Generate SEO-friendly URL
    let bookUrl = $derived(createBookPath(content.title, content.id));

    async function handleHeartClick(e) {
        e.preventDefault();

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;

        const data = new FormData();
        data.append('contentId', content.id);


        const response = await fetch('?/like', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push(!content.is_liked ? 'Tale Liked ❤️' : 'Tale Unliked 💔', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastColor': 'white'
                    }
                });
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

<div>
    <div class="card border-0">
        <a href={bookUrl}>
            <div class="card-img position-relative" use:autoAnimate>
                <!-- Content Type Badge -->
                {#if chapterCount > 0}
                    <div class="content-badge-wrapper">
                        <ContentTypeBadge {chapterCount} size="sm" />
                    </div>
                {/if}
                {#if !isImageLoaded}
                    <div class="placeholder-glow m-0 p-0" style="height: 25vh;">
                        <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                            <img
                                    src={finalLinkImage}
                                    alt="Book cover"
                                    class="card-img"
                                    style="width: 1px; height: 1px;"
                                    onload={() => isImageLoaded = true}
                            >
                        </div>
                    </div>
                {:else}
                    <img
                            src={finalLinkImage}
                            alt="Book cover"
                            class="img-fluid rounded-3"
                    >
                {/if}
            </div>
            <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
                <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-2 pt-md-3 mx-0">
                    <div class="col-9 my-auto">
                        <button class="btn btn-link p-0 link-light link-custom text-decoration-none text-wrap"
                                href={bookUrl}
                                use:tooltip={{...tooltipConfig}} title="Click to view"><span
                                class="text-title">{finalBookTitle}</span></button>
                    </div>
                    <div class="col-3 text-center">
                        <button class="btn btn-link text-decoration-none p-0 w-auto" onclick={handleHeartClick}
                                use:tooltip={{...tooltipConfig}} title={content.is_liked ? 'Unlike' : 'Like'}>
                        <span class="heart-icon {content.is_liked ? 'liked' : 'unliked'}">
                            <i class="fas fa-heart fa-3x"></i>
                            <span class="likes-counter">{content.likes}</span>
                        </span>
                        </button>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>

<style>
    .content-badge-wrapper {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 10;
    }

    .card {
        transition: 0.12s all ease-in-out;
    }

    .card:hover {
        box-shadow: 0 0 10px 0 rgb(211, 26, 103);
    }

    .link-light {
        transition: 0.15s all ease-in-out;
    }

    .link-light:hover {
        color: #d31a67 !important;
    }

    .btn-link {
        color: inherit;
        text-decoration: none;
    }

    .overlay-custom {
        transition: 0.15s all ease-in-out;
        opacity: 0;
    }

    .overlay-custom:hover {
        opacity: 1 !important;
        backdrop-filter: brightness(1.2);
    }

    .custom-overlay-content {
        background: radial-gradient(circle at center, rgba(92, 0, 166, 0.3) 0%, rgba(92, 0, 166, 0.95) 100%);
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

    .card-img {
        overflow: hidden;
    }

    .card-img img {
        transition: transform 0.15s ease-in-out;
    }

    .card:hover .card-img img {
        transform: scale(1.1);
    }

    @keyframes heart-pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes heart-unpulse {
        0% {
            transform: scale(0.8);
        }
        50% {
            transform: scale(1);
        }
        100% {
            transform: scale(0.8);
        }
    }
</style>