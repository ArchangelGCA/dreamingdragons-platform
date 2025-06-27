<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    /** @type {{owner_username: any, owner_id: any, book_title: any, book_id: any, book_cover_url: any, owner_avatar_url: any, image_proxy: any}} */
    let {
        owner_username = $bindable(),
        owner_id,
        book_title = $bindable(),
        book_id,
        book_cover_url = $bindable(),
        owner_avatar_url,
        image_proxy
    } = $props();

    let isDragging = false;
    let dragTimeout;
    const final_book_cover_url = $derived(image_proxy && !book_cover_url.startsWith(image_proxy) ? image_proxy + book_cover_url : book_cover_url);
    const final_book_title = $derived(book_title && book_title.length > 45 ? book_title.substring(0, 40) + '...' : book_title);
    const final_owner_username = $derived(owner_username && owner_username.length > 30 ? owner_username.substring(0, 35) + '...' : owner_username);

    // Prevent clicking while dragging.
    function handlePointerDown() {
        isDragging = false;
        clearTimeout(dragTimeout);
    }

    function handlePointerMove() {
        isDragging = true;
    }

    function handlePointerUp() {
        dragTimeout = setTimeout(() => {
            isDragging = false;
        }, 100);
    }

    function handlePointerLeave() {
        dragTimeout = setTimeout(() => {
            isDragging = false;
        }, 100);
    }

    function handleClick(event) {
        if (isDragging) {
            event.preventDefault();
        }
    }
</script>

<div class="card border-0 img-home w-100 rounded-4">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 35vh; overflow: hidden;">
        <img
                srcset="{final_book_cover_url + '?width=350&quality=80'} 2x,
                        {final_book_cover_url + '?width=500&quality=80'} 1x"
                src={final_book_cover_url + '?width=500&quality=80'}
                alt="Book cover"
                class="w-100 h-100 to-scale"
                loading="lazy"
                style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <a href="/content/{book_id}" draggable="false" onclick={handleClick} onpointerdown={handlePointerDown}
       onpointermove={handlePointerMove} onpointerup={handlePointerUp} onpointerleave={handlePointerLeave} aria-label="Content sorted by most recently updated: {final_book_title}">
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-2 pt-md-3 mx-0">
                <div class="col-12 px-0 px-md-2">
                    <button class="btn btn-link p-0 pb-1 link-light link-custom text-decoration-none text-wrap text-start" href="/content/{book_id}"
                       use:tooltip={{...tooltipConfig}} title="Click to view"><span class="text-title">{final_book_title}</span></button>
                    <p class="card-text"><small class="text-description"><span><UserAvatarNavbar url={owner_avatar_url} username={final_owner_username} {image_proxy} size="25px"/></span> <button
                            class="btn btn-link p-0 link-light link-custom text-decoration-none" href="/profile/{owner_id}"
                            use:tooltip={{...tooltipConfig}} title="Visit profile">{final_owner_username}</button></small></p>
                </div>
            </div>
        </div>
    </a>
</div>

<style>
    .card .link-custom {
        color: var(--bs-light) !important;
    }

    .card .link-custom:hover {
        color: hsl(333, 79%, 50%) !important;
    }

    .card .text-title {
        font-size: 1.2rem;
        font-weight: 400;
        line-height: 1.2;
    }

    .card .text-description {
        font-size: 0.9rem;
        color: hsla(210, 17%, 98%, 0.8) !important;
    }

    .card .to-scale {
        transition: transform 0.12s ease-in;
    }

    .card.border-0 {
        box-shadow: 0 0 0 0 hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.75);
        transition: 0.1s all ease-in-out;
    }

    .card.border-0:hover {
        box-shadow: 0 0 0.6rem 0.25rem hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.75);
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
        background: radial-gradient(circle at center, hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.6) 0%, var(--primary-color) 100%);
    }

    @media (max-width: 768px) {
        .card .text-description {
            font-size: 0.8rem;
        }

        .card .text-title {
            font-size: 0.9rem;
        }
    }
</style>