<script>
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import { tooltip } from "svelte-tooltip-gca";
    import { createBookPath, createProfilePath } from "$lib/utils/slugs.js";
    import { goto } from '$app/navigation';
    import ContentTypeBadge from "$lib/components/pages/ContentTypeBadge.svelte";
    import { resolveImageUrl } from '$lib/utils/images.js';

    /** @type {{owner_username: any, owner_id: any, title: any, book_id: any, book_cover_url: any, description: any, image_proxy: any, chapter_count?: number}} */
    let {
        owner_username,
        owner_id,
        title,
        book_id,
        book_cover_url,
        description,
        image_proxy,
        chapter_count = 0
    } = $props();
    
    // Generate SEO-friendly URL
    const bookUrl = $derived(createBookPath(title, book_id));
    const baseUrl = $derived(resolveImageUrl(book_cover_url, image_proxy));
    
    // Handle card click - navigate to book unless clicking on profile link
    function handleCardClick(event) {
        // Check if the clicked element or its parents contain the profile link
        const profileLink = event.target.closest('a[href*="profile"]');
        if (!profileLink) {
            goto(bookUrl);
        }
    }
</script>

<div class="card border-0 img-home w-100 rounded-4 cursor-pointer" 
     use:tooltip={{...tooltipConfig, content: 'View'}} 
     onclick={handleCardClick}
     role="button"
     tabindex="0"
     onkeydown={(e) => e.key === 'Enter' && handleCardClick(e)}>
    <div class="d-none">
        {description}
    </div>
    <div class="card-img-top img-wrapper position-relative text-center w-100 lazy-background rounded-4"
         style="height: 45vh; overflow: hidden;">
        <!-- Content Type Badge -->
        {#if chapter_count > 0}
            <div class="content-badge-wrapper">
                <ContentTypeBadge chapterCount={chapter_count} size="md" />
            </div>
        {/if}
        <img
            src={baseUrl}
            alt="Cover of {title}"
            class="w-100 h-100 to-scale"
            loading="lazy"
            decoding="async"
            style="object-fit: cover; position: absolute; top: 0; left: 0;">
    </div>
    <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
        <div class="row custom-overlay-content justify-content-center rounded-bottom-4 p-2 pt-3 mx-0">
            <div class="col-12">
                <a class="btn btn-link p-0 link-light text-decoration-none text-wrap" href="{bookUrl}" use:tooltip={{...tooltipConfig, content: 'Click to view'}}><span class="h5">{title}</span></a>
                <p class="card-text"><small class="text-muted">Posted by <a class="btn btn-link p-0 link-light text-decoration-none" href={createProfilePath(owner_username, owner_id)} use:tooltip={{...tooltipConfig, content: 'Visit profile'}}>{owner_username}</a></small></p>
            </div>
        </div>
    </div>
</div>

<style>
    .content-badge-wrapper {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 10;
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
            linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 30%),
            var(--card-overlay);
        border-top: 1px solid rgba(var(--dd-bright-rgb), 0.14);
    }

    .to-scale {
        transition: transform 0.12s ease-in;
    }

    .card {
        background: var(--dd-surface);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        transition: 0.1s all ease-in-out;
    }

    .card:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
    }

    .cursor-pointer {
        cursor: pointer;
    }

</style>