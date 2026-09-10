<script>
    import {tooltip} from "svelte-tooltip-gca";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import ContentTypeBadge from "$lib/components/pages/ContentTypeBadge.svelte";
    import PopularBadge from "$lib/components/pages/PopularBadge.svelte";
    import PopularGlow from "$lib/components/pages/PopularGlow.svelte";
    import autoAnimate from "@formkit/auto-animate";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import {createBookPath, createProfilePath} from "$lib/utils/slugs.js";
    import { resolveImageUrl } from '$lib/utils/images.js';

    /** @type {{book: any, image_proxy: any, session: any, onBookUpdate?: function}} */
    let {book, image_proxy, session, onBookUpdate} = $props();

    let width = 500;

    // Normalize book data structure - handle nested .book property if present
    let normalizedBook = $derived(book.book || book);

    // Safely access profile data with fallbacks
    let profileData = $derived(normalizedBook.profiles || normalizedBook.owner || {
        username: 'Unknown',
        avatar_url: null,
        id: null
    });

    let finalLinkImage = $derived(resolveImageUrl(normalizedBook.cover_url, image_proxy));
    let finalBookTitle = $derived(normalizedBook.title && normalizedBook.title.length > 20 ? normalizedBook.title.substring(0, 18) + '...' : (normalizedBook.title || 'Untitled'));
    let finalUsername = $derived(profileData.username && profileData.username.length > 16 ? profileData.username.substring(0, 15) + '...' : (profileData.username || 'Unknown'));
    let chapterCount = $derived(normalizedBook.chapter_count ?? 0);
    let isImageLoaded = $state(false);
    let likeActionActive = $state(false);

    // Generate SEO-friendly URL
    let bookUrl = $derived(createBookPath(normalizedBook.title || 'Book', normalizedBook.id));

    // Ensure likes is properly initialized with safe fallbacks
    $effect(() => {
        if (typeof normalizedBook.likes === 'undefined') {
            // Try to calculate from book_likes array if available
            if (normalizedBook.book_likes && Array.isArray(normalizedBook.book_likes)) {
                normalizedBook.likes = normalizedBook.book_likes.length;
            } else {
                normalizedBook.likes = 0;
            }
        }
        if (typeof normalizedBook.is_liked === 'undefined') {
            // Check if user has liked this book if session and book_likes exist
            if (session && normalizedBook.book_likes && Array.isArray(normalizedBook.book_likes)) {
                normalizedBook.is_liked = normalizedBook.book_likes.some(like => like.user_id === session.user.id);
            } else {
                normalizedBook.is_liked = false;
            }
        }

        // Use callback to update the original book object instead of direct mutation
        if (onBookUpdate) {
            const updates = {
                likes: normalizedBook.likes,
                is_liked: normalizedBook.is_liked
            };
            onBookUpdate(book, updates);
        }
    });

    async function handleHeartClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast.push('Please login to like content', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
            return;
        }

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;

        const data = new FormData();
        data.append('contentId', normalizedBook.id);

        // Update UI optimistically
        const originalLiked = normalizedBook.is_liked;
        const originalLikes = normalizedBook.likes;

        normalizedBook.is_liked = !normalizedBook.is_liked;
        normalizedBook.likes = normalizedBook.is_liked ? normalizedBook.likes + 1 : normalizedBook.likes - 1;

        // Use callback to update the original book object instead of direct mutation
        if (onBookUpdate) {
            onBookUpdate(book, {
                is_liked: normalizedBook.is_liked,
                likes: normalizedBook.likes
            });
        }

        try {
            const response = await fetch('?/like', {
                method: 'POST',
                body: data
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    toast.push(normalizedBook.is_liked ? 'Tale Liked ❤️' : 'Tale Unliked 💔', {
                        theme: {
                            '--toastBackground': 'rgba(var(--dd-deep2-rgb), 0.95)',
                            '--toastColor': 'var(--text-color)'
                        }
                    });
                } else {
                    // Revert optimistic update
                    normalizedBook.is_liked = originalLiked;
                    normalizedBook.likes = originalLikes;

                    // Use callback to revert the original book object
                    if (onBookUpdate) {
                        onBookUpdate(book, {
                            is_liked: originalLiked,
                            likes: originalLikes
                        });
                    }

                    toast.push('Error: ' + result.data.body.message, {
                        theme: {
                            '--toastBackground': '#f44336',
                            '--toastColor': '#fff',
                        }
                    });
                }
            } else {
                // Revert optimistic update
                normalizedBook.is_liked = originalLiked;
                normalizedBook.likes = originalLikes;

                // Use callback to revert the original book object
                if (onBookUpdate) {
                    onBookUpdate(book, {
                        is_liked: originalLiked,
                        likes: originalLikes
                    });
                }

                toast.push('Error during action', {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } catch (error) {
            console.error('Like action failed:', error);
            // Revert optimistic update
            normalizedBook.is_liked = originalLiked;
            normalizedBook.likes = originalLikes;

            // Use callback to revert the original book object
            if (onBookUpdate) {
                onBookUpdate(book, {
                    is_liked: originalLiked,
                    likes: originalLikes
                });
            }

            toast.push('Network error occurred', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        likeActionActive = false;
    }

    function handleProfileClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (profileData.id) {
            window.location.href = createProfilePath(profileData.username, profileData.id);
        }
    }

    function handleContentClick() {
        window.location.href = bookUrl;
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleContentClick();
        }
    }
</script>

<div>
    <PopularGlow likes={normalizedBook.likes ?? 0} class="rounded-3">
        <div class="card border-0"
             onclick={handleContentClick}
             onkeydown={handleKeyDown}
             tabindex="0"
             role="button"
             aria-label="View content: {finalBookTitle}"
             style="cursor: pointer;">
            <!-- 1x is for desktop, 2x is for mobile -->
            <div class="card-img" use:autoAnimate>
                <!-- Popular Badge -->
                <PopularBadge likes={normalizedBook.likes ?? 0} size="sm" position="top-left" />
                <!-- Content Type Badge -->
                {#if chapterCount > 0}
                    <div class="content-badge-wrapper">
                        <ContentTypeBadge {chapterCount} size="sm" />
                    </div>
                {/if}
            {#if !isImageLoaded}
                <div class="placeholder-glow m-0 p-0" style="height: 25vh;">
                    <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                        <img
                                src={finalLinkImage}
                                alt="Cover: {finalBookTitle}"
                                style="width: 1px; height: 1px;"
                                loading="lazy"
                                decoding="async"
                                onload={() => isImageLoaded = true}
                        >
                    </div>
                </div>
            {:else}
                <img
                        src={finalLinkImage}
                        alt="Cover: {finalBookTitle}"
                        class="img-fluid rounded-3"
                        width={width}
                        loading="lazy"
                        decoding="async"
                >
            {/if}
        </div>
        <div class="card-img-overlay overlay-custom d-flex flex-column rounded-bottom-4 justify-content-end p-0">
            <div class="row custom-overlay-content justify-content-center rounded-bottom-2 p-2 pt-2 pt-md-3 mx-0">
                <div class="col-8 col-md-7 px-0 px-md-2">
                    <button class="btn btn-link p-0 link-light link-custom text-decoration-none text-wrap"
                            onclick={(e) => e.stopPropagation()}
                            use:tooltip={{...tooltipConfig, content: 'Click to view'}}><span
                            class="text-title">{finalBookTitle}</span></button>
                    <p class="card-text mb-0"><small class="text-description d-flex align-items-center gap-1 flex-wrap">
                        <span class="d-inline-flex align-items-center">
                            <UserAvatarNavbar url={profileData.avatar_url} username={profileData.username}
                                              {image_proxy} size="25px"/>
                        </span>
                        <button
                                class="btn btn-link p-0 link-light link-custom text-decoration-none"
                                onclick={handleProfileClick}
                                use:tooltip={{...tooltipConfig, content: 'Visit profile'}}>{finalUsername}
                        </button>
                    </small>
                    </p>
                </div>
                {#if session}
                    <div class="col-4 col-md-5 text-center d-flex align-items-center justify-content-center">
                        <button class="btn btn-link text-decoration-none p-0 w-auto heart-button"
                                onclick={handleHeartClick}
                                use:tooltip={{...tooltipConfig, content: normalizedBook.is_liked ? 'Unlike' : 'Like'}}>
                            <span class="heart-icon {normalizedBook.is_liked ? 'liked' : 'unliked'}">
                                <i class="fas fa-heart"></i>
                                <span class="likes-counter">{normalizedBook.likes ?? 0}</span>
                            </span>
                        </button>
                    </div>
                {:else}
                    <div class="col-4 col-md-5 text-center d-flex align-items-center justify-content-center">
                        <div class="heart-display">
                            <span class="heart-icon unliked">
                                <i class="fas fa-heart"></i>
                                <span class="likes-counter">{normalizedBook.likes ?? 0}</span>
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    </PopularGlow>
</div>

<style>
    .card-img {
        position: relative;
    }

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

    .overlay-custom:hover {
        opacity: 1 !important;
        backdrop-filter: brightness(1.2);
    }

    .custom-overlay-content {
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 30%),
            var(--card-overlay);
        border-top: 1px solid rgba(var(--dd-bright-rgb), 0.14);
    }

    .card {
        background: var(--dd-surface);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
        transition: 0.1s all ease-in-out;
    }

    .card:hover, .card:focus {
        box-shadow: 0 0 0.6rem 0.25rem rgba(var(--dd-bright-rgb), 0.35);
        outline: none;
    }

    .card:focus-visible {
        outline: 2px solid rgba(var(--dd-bright-rgb), 0.5);
        outline-offset: 2px;
    }

    .link-custom {
        color: var(--text-color) !important;
    }

    .link-custom:hover {
        color: var(--dd-accent-hover) !important;
    }

    .text-title {
        font-size: 1.2rem;
        font-weight: 400;
    }

    .text-description {
        font-size: 0.9rem;
        color: rgba(var(--dd-text2-rgb), 0.85) !important;
    }

    .heart-button {
        transition: transform 0.2s ease-in-out;
    }

    .heart-button:hover {
        transform: scale(1.1);
    }

    .heart-display {
        opacity: 0.8;
    }

    .heart-icon {
        position: relative;
        display: inline-block;
    }

    .heart-icon .fas.fa-heart {
        font-size: 1.8rem;
    }

    .heart-icon .likes-counter {
        position: absolute;
        top: 43%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--text-color);
        font-size: 0.7rem;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }

    .liked {
        color: var(--dd-gold);
        filter: drop-shadow(0 0 6px rgba(var(--dd-gold-rgb), 0.45));
        animation: heart-pulse 0.3s ease-in-out;
        transition: 0.15s all ease-in-out;
    }

    .liked:hover {
        transform: scale(1.1);
    }

    .unliked {
        transform: scale(0.9);
        color: var(--text-color);
        transition: 0.15s all ease-in-out;
    }

    .unliked:hover {
        color: var(--dd-gold);
        transform: scale(1.0);
    }

    @keyframes heart-pulse {
        0% {
            transform: scale(0.9);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(0.9);
        }
    }

    /* On mobile, text-description should be even smaller */
    @media (max-width: 768px) {
        .text-description {
            font-size: 0.8rem;
        }

        .text-title {
            font-size: 0.9rem;
        }

        .heart-icon .fas.fa-heart {
            font-size: 1.5rem;
        }

        .heart-icon .likes-counter {
            font-size: 0.6rem;
        }
    }
</style>
