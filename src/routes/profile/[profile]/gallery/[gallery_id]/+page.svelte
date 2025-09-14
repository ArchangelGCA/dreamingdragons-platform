<script>
    import Masonry from '$lib/components/sveltebricks/Masonry.svelte';
    import ContentMasonry from '$lib/components/pages/ContentMasonry.svelte';
    import {tooltip} from "@svelte-plugins/tooltips";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import { createProfilePath } from '$lib/utils/slugs.js';

    let {data} = $props();
    let {gallery, session, image_proxy} = $state(data);
    let width = $state(0), height = $state(0);
    let [minColWidth, gap] = [350, 10];

    let books = $derived(gallery.gallery_books.map(gb => gb.book));
    let isOwner = $derived(session && gallery.owner_id === session.user.id);

    // Callback function to handle book updates from ContentMasonry
    function handleBookUpdate(targetBook, updates) {
        if (targetBook.book) {
            targetBook.book.likes = updates.likes;
            targetBook.book.is_liked = updates.is_liked;
        } else {
            targetBook.likes = updates.likes;
            targetBook.is_liked = updates.is_liked;
        }
    }
</script>

<svelte:head>
    <title>{gallery.name} by {gallery.owner.username}</title>
    <meta name="description" content={gallery.description}/>
</svelte:head>

<div class="min-vh-100">

    <div class="gallery-header rounded-3 position-relative mb-4">
        <div class="container-xl">
            <div class="row align-items-center justify-content-center g-4 py-5">
                <!-- Gallery Icon -->
                <div class="col-auto">
                    <div class="gallery-icon d-flex align-items-center justify-content-center rounded-4 shadow">
                        <i class="fas fa-images fa-2x text-white"></i>
                    </div>
                </div>

                <!-- Gallery Title Section -->
                <div class="col">
                    <h1 class="gallery-title display-4 fw-bold mb-3">{gallery.name}</h1>
                    <p class="gallery-owner fs-5 mb-3 d-flex align-items-center justify-content-center justify-content-lg-start text-white-50">
                        <i class="fas fa-user me-2"></i>
                        A gallery by
                        <a href={createProfilePath(gallery.owner.username, gallery.owner.id)}
                           class="owner-link ms-2 text-decoration-none position-relative">{gallery.owner.username}</a>
                    </p>
                    {#if gallery.description}
                        <p class="gallery-description fs-5 lh-base mb-4 text-white">{gallery.description}</p>
                    {/if}
                    <div class="d-flex gap-3">
                        <span class="stat-item badge rounded-pill px-3 py-2 fs-6 d-flex align-items-center mx-auto mx-lg-0">
                            <i class="fas fa-book me-2"></i>
                            {books.length} {books.length === 1 ? 'tale' : 'tales'}
                        </span>
                    </div>
                </div>

                <!-- Gallery Actions -->
                {#if isOwner}
                    <div class="col-auto">
                        <a
                                href="/settings/galleries?gallery={gallery.id}"
                                class="btn btn-edit-gallery shadow rounded-3 text-decoration-none"
                                use:tooltip={{...tooltipConfig}}
                                title="Edit Gallery"
                                aria-label="Edit Gallery"
                        >
                            <i class="fas fa-edit me-2"></i>
                            Edit Gallery
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Gallery Content -->
    <div class="container-xl pb-5">
        {#if books.length > 0}
            <Masonry items={books}
                     {minColWidth}
                     {gap}
                     animate={true}

                     bind:masonryWidth={width}
                     bind:masonryHeight={height}
            >
                {#snippet children({item})}
                    <ContentMasonry book={item} {image_proxy} {session} onBookUpdate={handleBookUpdate}/>
                {/snippet}
            </Masonry>
        {:else}
            <div class="text-center py-5">
                <i class="fas fa-images display-1 mb-4 text-muted opacity-50"></i>
                <h3 class="h2 text-body-secondary mb-3">Empty Gallery</h3>
                <p class="fs-5 text-muted mb-0">This gallery doesn't contain any books yet.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .gallery-header {
        background: linear-gradient(135deg,
        hsla(var(--primary-hue), 20%, 15%, 0.6),
        hsla(var(--primary-hue), 15%, 20%, 0.4)
        );
        border-bottom: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.3);
        backdrop-filter: blur(10px);
    }

    .gallery-icon {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        width: 80px;
        height: 80px;
        box-shadow: 0 8px 25px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
    }

    .gallery-title {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .owner-link {
        color: var(--primary-color) !important;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .owner-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--primary-color), hsl(290, 100%, 60%));
        transition: width 0.3s ease;
    }

    .owner-link:hover {
        color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)) !important;
    }

    .owner-link:hover::after {
        width: 100%;
    }

    .gallery-description {
        max-width: 600px;
    }

    .stat-item {
        background: hsla(var(--primary-hue), 30%, 25%, 0.6) !important;
        color: hsla(var(--primary-hue), 50%, 80%, 0.9) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.4);
    }

    .btn-edit-gallery {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%)) !important;
        border: none !important;
        color: white !important;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
    }

    .btn-edit-gallery:hover {
        background: linear-gradient(135deg,
        hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)),
        hsl(290, 100%, 70%)
        ) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.4);
        color: white !important;
    }

    @media (max-width: 768px) {
        .gallery-header .row {
            text-align: center;
        }

        .gallery-title {
            font-size: 2rem !important;
        }

        .btn-edit-gallery {
            width: 100%;
            min-width: 160px;
        }
    }
</style>
