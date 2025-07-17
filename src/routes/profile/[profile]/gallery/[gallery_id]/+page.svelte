<script>
    import Masonry from '$lib/components/sveltebricks/Masonry.svelte';
    import ContentMasonry from '$lib/components/pages/ContentMasonry.svelte';
    import { tooltip } from "@svelte-plugins/tooltips";
    import { tooltipConfig } from "$lib/utils/gcacommons.js";

    let {data} = $props();
    let {gallery, session} = $state(data);
    let width = $state(0), height = $state(0);
    let [minColWidth, gap] = [350, 10];

    let books = $derived(gallery.gallery_books.map(gb => gb.book));
    let isOwner = $derived(session && gallery.owner_id === session.user.id);
</script>

<svelte:head>
    <title>{gallery.name} by {gallery.owner.username}</title>
    <meta name="description" content={gallery.description}/>
</svelte:head>

<div class="gallery-view-container">
    <div class="gallery-header rounded-3">
        <div class="header-content">
            <div class="gallery-icon">
                <i class="fas fa-images"></i>
            </div>
            <div class="gallery-title-section">
                <h1 class="gallery-title">{gallery.name}</h1>
                <p class="gallery-owner">
                    <i class="fas fa-user me-2"></i>
                    A gallery by <a href="/profile/{gallery.owner.id}" class="owner-link ms-2">{gallery.owner.username}</a>
                </p>
                {#if gallery.description}
                    <p class="gallery-description">{gallery.description}</p>
                {/if}
                <div class="gallery-stats">
                    <span class="stat-item">
                        <i class="fas fa-book me-1"></i>
                        {books.length} {books.length === 1 ? 'tale' : 'tales'}
                    </span>
                </div>
            </div>
            {#if isOwner}
                <div class="gallery-actions">
                    <a 
                        href="/settings/galleries?gallery={gallery.id}"
                        class="btn-edit-gallery-header"
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

    <div class="gallery-content">
        {#if books.length > 0}
            <Masonry items={books}
                     {minColWidth}
                     {gap}
                     animate={true}

                     bind:masonryWidth={width}
                     bind:masonryHeight={height}
            >
                {#snippet children({item})}
                    <ContentMasonry book={item}/>
                {/snippet}
            </Masonry>
        {:else}
            <div class="empty-gallery-view">
                <i class="fas fa-images fa-4x mb-3"></i>
                <h3>Empty Gallery</h3>
                <p>This gallery doesn't contain any books yet.</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .gallery-view-container {
        min-height: 100vh;
    }

    .gallery-header {
        background: linear-gradient(135deg,
            hsla(var(--primary-hue), 20%, 15%, 0.6),
            hsla(var(--primary-hue), 15%, 20%, 0.4)
        );
        border-bottom: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.3);
        backdrop-filter: blur(10px);
        padding: 3rem 0;
        margin-bottom: 2rem;
    }

    .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .gallery-icon {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        color: white;
        width: 80px;
        height: 80px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        box-shadow: 0 8px 25px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
        flex-shrink: 0;
    }

    .gallery-title-section {
        flex: 1;
    }

    .gallery-title {
        color: var(--text-color);
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .gallery-owner {
        color: hsla(var(--primary-hue), 30%, 70%, 0.9);
        font-size: 1.1rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }

    .owner-link {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative;
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
        color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%));
        text-decoration: none;
    }

    .owner-link:hover::after {
        width: 100%;
    }

    .gallery-description {
        color: var(--text-color);
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
        max-width: 600px;
    }

    .gallery-actions {
        margin-left: auto;
    }

    .btn-edit-gallery-header {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        color: white;
        text-decoration: none;
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
        font-size: 0.95rem;
    }

    .btn-edit-gallery-header:hover {
        background: linear-gradient(135deg, 
            hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)), 
            hsl(290, 100%, 70%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 20px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.4);
        color: white;
        text-decoration: none;
    }

    .gallery-stats {
        display: flex;
        gap: 1.5rem;
    }

    .stat-item {
        background: hsla(var(--primary-hue), 30%, 25%, 0.6);
        color: hsla(var(--primary-hue), 50%, 80%, 0.9);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.4);
        font-weight: 500;
        display: flex;
        align-items: center;
    }

    .gallery-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem 3rem;
    }

    .empty-gallery-view {
        text-align: center;
        padding: 4rem 2rem;
        color: hsla(var(--primary-hue), 30%, 60%, 0.8);
    }

    .empty-gallery-view i {
        color: hsla(var(--primary-hue), 40%, 50%, 0.6);
    }

    .empty-gallery-view h3 {
        color: var(--text-color);
        margin: 1rem 0 0.5rem;
        font-size: 1.75rem;
    }

    .empty-gallery-view p {
        font-size: 1.1rem;
        margin: 0;
    }

    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
            padding: 0 1rem;
        }

        .gallery-header {
            padding: 2rem 0;
        }

        .gallery-title {
            font-size: 2rem;
        }

        .gallery-owner {
            justify-content: center;
        }

        .gallery-content {
            padding: 0 1rem 2rem;
        }

        .gallery-stats {
            justify-content: center;
        }

        .gallery-actions {
            margin-left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
        }

        .btn-edit-gallery-header {
            width: auto;
            min-width: 160px;
        }
    }
</style>
