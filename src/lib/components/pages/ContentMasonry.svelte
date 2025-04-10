<script>
    import {tooltip} from "@svelte-plugins/tooltips";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import autoAnimate from "@formkit/auto-animate";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    /** @type {{book: any, image_proxy: any}} */
    let {book = $bindable(), image_proxy} = $props();

    let width = 500;
    let finalLinkImage = $derived(image_proxy && !book.cover_url.startsWith(image_proxy) ? image_proxy + book.cover_url : book.cover_url);
    let finalBookTitle = $derived(book.title.length > 20 ? book.title.substring(0, 18) + '...' : book.title);
    let finalUsername = $derived(book.profiles.username.length > 16 ? book.profiles.username.substring(0, 15) + '...' : book.profiles.username);
    let isImageLoaded = $state(false);

</script>

<div>
    <div class="card border-0">
        <a href="/content/{book.id}" aria-label="Content: {finalBookTitle}">
            <!-- 1x is for desktop, 2x is for mobile -->
            <div class="card-img" use:autoAnimate>
                {#if !isImageLoaded}
                    <div class="placeholder-glow m-0 p-0" style="height: 25vh;">
                        <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                            <img
                                    srcset="{finalLinkImage + `?width=${width}&quality=80`} 2x,
                            {finalLinkImage + `?width=${width}&quality=80`} 1x"
                                    src={finalLinkImage + `?width=${width}&quality=80`}
                                    alt="Cover: {finalBookTitle}"
                                    style="width: 1px; height: 1px;"
                                    onload={() => isImageLoaded = true}
                            >
                        </div>
                    </div>
                {:else}
                    <img
                            srcset="{finalLinkImage + `?width=${width}&quality=80`} 2x,
                            {finalLinkImage + `?width=${width}&quality=80`} 1x"
                            src={finalLinkImage + `?width=${width}&quality=80`}
                            alt="Cover: {finalBookTitle}"
                            class="img-fluid rounded-3"
                            width={width}
                    >
                {/if}
            </div>
            <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
                <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-2 pt-md-3 mx-0">
                    <div class="col-12 px-0 px-md-2">
                        <button class="btn btn-link p-0 link-light link-custom text-decoration-none text-wrap"
                                href="/content/{book.id}"
                                use:tooltip={{...tooltipConfig}} title="Click to view"><span
                                class="text-title">{finalBookTitle}</span></button>
                        <p class="card-text"><small class="text-description"><span>
                            <UserAvatarNavbar url={book.profiles.avatar_url} username={book.profiles.username}
                                              {image_proxy} size="25px"/>
                        </span>
                            <button
                                    class="btn btn-link p-0 link-light link-custom text-decoration-none"
                                    href="/profile/{book.profiles.id}"
                                    use:tooltip={{...tooltipConfig}} title="Visit profile">{finalUsername}</button>
                        </small></p>
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
