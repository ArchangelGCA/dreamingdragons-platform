<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";

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

    export let owner_username;
    export let owner_id;
    export let book_title;
    export let book_id;
    export let book_cover_url;
    export let likes_count;
    export let book_description;
    export let owner_avatar_url;
    export let created_at;
    export let image_proxy;

    $: if (image_proxy) {
        if (!book_cover_url.startsWith(image_proxy)) book_cover_url = image_proxy + book_cover_url;
    } else {
        console.log('No image proxy');
    }

    $: if (book_title.length > 45) book_title = book_title.substring(0, 40) + '...';
    $: if (owner_username.length > 30) owner_username = owner_username.substring(0, 35) + '...';
</script>

<div class="card border-0 img-home w-100 rounded-4">
    <div class="d-none"> <!-- Added this as a workaround for warning but also to add more context for SEO -->
        <p>{book_description}</p>
        <p>Posted on {created_at}</p>
        <p>Avatar {owner_avatar_url}</p>
        <p>Likes {likes_count}</p>
    </div>
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 35vh; overflow: hidden;">
        <img
                srcset="{book_cover_url + '?width=350&quality=80'} 2x,
                        {book_cover_url + '?width=500&quality=80'} 1x"
                src={book_cover_url + '?width=500&quality=80'}
                alt="Book cover"
                class="w-100 h-100 to-scale"
                loading="lazy"
                style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <a href="/content/{book_id}">
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-2 pt-md-3 mx-0">
                <div class="col-12 px-0 px-md-2">
                    <a class="link-light link-custom text-decoration-none text-wrap" href="/content/{book_id}"
                       use:tooltip={{...tooltipConfig}} title="Click to view"><span class="text-title">{book_title}</span></a>
                    <p class="card-text"><small class="text-description"><span><UserAvatarNavbar url={owner_avatar_url} username={owner_username} {image_proxy} size="25px"/></span> <a
                            class="link-light link-custom text-decoration-none" href="/profile/{owner_id}"
                            use:tooltip={{...tooltipConfig}} title="Visit profile">{owner_username}</a></small></p>
                </div>
            </div>
        </div>
    </a>
</div>

<style>
    .overlay-custom {
        transition: 0.15s all ease-in-out;
        opacity: 0;
    }

    .overlay-custom:hover{
        opacity: 1 !important;
        backdrop-filter: brightness(1.2) ;
    }

    .custom-overlay-content {
        background: radial-gradient(circle at center, rgba(92, 0, 166, 0.6) 0%, rgb(92, 0, 166) 100%);
    }

    .to-scale {
        transition: transform 0.12s ease-in;
    }

    .card {
        box-shadow: 0 0 0 0 rgba(92, 0, 166, 0.75);
        transition: 0.1s all ease-in-out;
    }

    .card:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
    }

    .link-custom {
        color: rgba(248, 249, 250) !important;
    }

    .link-custom:hover {
        color: rgb(211, 26, 103) !important;
    }

    .text-title {
        font-size: 1.2rem;
        font-weight: 400;
    }

    .text-description {
        font-size: 0.9rem;
        color: rgba(248, 249, 250, 0.8) !important;
    }

    /* On mobile, text-description should be even smaller */
    @media (max-width: 768px) {
        .text-description {
            font-size: 0.8rem;
        }

        .text-title {
            font-size: 0.9rem;
        }
    }
</style>