<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import { tooltip } from "$lib/utils/tooltip.js";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    /** @type {{content: any, image_proxy: any}} */
    let { content, image_proxy, invalidateCard } = $props();
    let likeActionActive = false;
    let finalLinkImage = $derived(image_proxy && !content.cover_url.startsWith(image_proxy) ? image_proxy + content.cover_url + '?width=750&quality=80' : content.cover_url);

    function handleMouseEnter(e) {
        e.target.parentElement.querySelector('.to-scale').style.transform = 'scale(1.1)';
    }

    function handleMouseLeave(e) {
        e.target.parentElement.querySelector('.to-scale').style.transform = 'scale(1.0)';
    }

    async function handleHeartClick(e) {
        e.preventDefault();

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;

        const data = new FormData();
        data.append('contentId', content.id);

        content.is_liked = !content.is_liked;

        if (content.is_liked) {
            content.likes++;
        } else {
            content.likes--;
        }

        const response = await fetch('?/like', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                invalidateCard();
            } else {
                content.is_liked = !content.is_liked;
                content.likes--;

                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            content.is_liked = !content.is_liked;
            content.likes--;

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

<div class="card border-0 bg-dark bg-opacity-50 img-home w-100 rounded-4" use:tooltip={{...tooltipConfig}} title="View">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        <img src={finalLinkImage} alt="Book cover" class="w-100 h-100 to-scale" loading="lazy" style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <a href="/content/{content.id}" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-4 p-3 pb-2 mx-0">
                <div class="col-9 my-auto">
                    <button class="btn btn-link p-0 link-light text-decoration-none text-wrap " href="/content/{content.id}" use:tooltip={{...tooltipConfig}} title="Click to view"><span class="h5">{content.title}</span></button>
                    <!--<p class="card-text"><small class="text-muted">Posted by <a class="link-light text-decoration-none" href="/profile/{content.owner_id}" use:tooltip={{...tooltipConfig}} title="Visit profile">{content.owner_username}</a></small></p>-->
                </div>
                <div class="col-3 text-end my-auto">
                    <button class="btn btn-link text-decoration-none p-0 w-auto me-4" onclick={handleHeartClick} use:tooltip={{...tooltipConfig}} title={content.is_liked ? 'Unlike' : 'Like'}>
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

<style>

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