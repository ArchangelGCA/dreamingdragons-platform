<script>
    import { tooltip } from "@svelte-plugins/tooltips";

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
    export let title;
    export let book_id;
    export let book_cover_url;
</script>

<div class="card border-0 img-home w-100 rounded-4" use:tooltip={{...tooltipConfig}} title="View">
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        <img src={book_cover_url} alt="Book cover" class="w-100 h-100 to-scale" loading="lazy" style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <a href="/content/{book_id}">
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-4 ps-3 pb-1 pt-3 mx-0">
                <div class="col-9">
                    <a class="link-light text-decoration-none" href="/content/{book_id}" target="_blank" use:tooltip={{...tooltipConfig}} title="Click to view"><span class="h5">{title}</span></a>
                    <p class="card-text"><small class="text-muted">Posted by <a class="link-light text-decoration-none" href="/profile/{owner_id}" use:tooltip={{...tooltipConfig}} title="Visit profile">{owner_username}</a></small></p>
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