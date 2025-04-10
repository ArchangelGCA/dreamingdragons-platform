<script>
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    import { tooltip } from "@svelte-plugins/tooltips";

    /** @type {{owner_username: any, owner_id: any, title: any, book_id: any, book_cover_url: any, description: any, image_proxy: any}} */
    let {
        owner_username,
        owner_id,
        title,
        book_id,
        book_cover_url,
        description,
        image_proxy
    } = $props();
</script>

<div class="card border-0 img-home w-100 rounded-4" use:tooltip={{...tooltipConfig}} title="View">
    <div class="d-none">
        {description}
    </div>
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        <img src={image_proxy && !book_cover_url.startsWith(image_proxy) ? image_proxy + book_cover_url + '?width=500&quality=80' : book_cover_url} alt="Cover of {title}" class="w-100 h-100 to-scale" loading="lazy" style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <a href="/content/{book_id}">
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-4 p-2 pt-3 mx-0">
                <div class="col-12">
                    <button class="btn btn-link p-0 link-light text-decoration-none text-wrap" href="/content/{book_id}" use:tooltip={{...tooltipConfig}} title="Click to view"><span class="h5">{title}</span></button>
                    <p class="card-text"><small class="text-muted">Posted by <button class="btn btn-link p-0 link-light text-decoration-none" href="/profile/{owner_id}" use:tooltip={{...tooltipConfig}} title="Visit profile">{owner_username}</button></small></p>
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

</style>