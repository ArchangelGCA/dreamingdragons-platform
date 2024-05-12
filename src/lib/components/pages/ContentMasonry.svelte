<script>
    import {tooltip} from "@svelte-plugins/tooltips";

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
</script>

<div>
    <div class="card border-0">
        <div class="d-none"> <!-- Added this as a workaround for warning but also to add more context for SEO -->
            <p>{book_description}</p>
            <p>Posted on {created_at}</p>
            <p>Avatar {owner_avatar_url}</p>
            <p>Likes {likes_count}</p>
        </div>
        <a href="/content/{book_id}">
            <div class="card-img">
                <img
                        srcset="{book_cover_url + '?width=350&quality=80'} 2x,
                        {book_cover_url + '?width=500&quality=80'} 1x"
                        src={book_cover_url + '?width=500&quality=80'}
                        alt="Book cover"
                        loading="lazy"
                        class="img-fluid rounded-3"
                >
            </div>
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-3 mx-0">
                <div class="col-12">
                    <a class="link-light link-custom text-decoration-none text-wrap" href="/content/{book_id}"
                       use:tooltip={{...tooltipConfig}} title="Click to view"><span class="h5">{book_title}</span></a>
                    <p class="card-text"><small class="text-muted">Posted by <a
                            class="link-light link-custom text-decoration-none" href="/profile/{owner_id}"
                            use:tooltip={{...tooltipConfig}} title="Visit profile">{owner_username}</a></small></p>
                </div>
            </div>
        </div>
        </a>
    </div>
</div>

<style>
    .overlay-custom {
        transition: 0.15s all ease-in-out;
        opacity: 0;
    }

    .overlay-custom:hover {
        opacity: 1 !important;
        backdrop-filter: brightness(1.2);
    }

    .custom-overlay-content {
        background: radial-gradient(circle at center, rgba(92, 0, 166, 0.6) 0%, rgb(92, 0, 166) 100%);
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
</style>
