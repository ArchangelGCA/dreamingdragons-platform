<script>
    import { PUBLIC_LIKES_FOR_COSMETIC_BADGE } from '$env/static/public';

    /**
     * @type {{
     *   likes: number,
     *   size?: 'sm' | 'md' | 'lg',
     *   position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
     *   variant?: 'badge' | 'glow' | 'both'
     * }}
     */
    let {
        likes = 0,
        size = 'md',
        position = 'top-left',
        variant = 'both'
    } = $props();

    const threshold = parseInt(PUBLIC_LIKES_FOR_COSMETIC_BADGE) || 3;
    let isPopular = $derived(likes >= threshold);

    // Intersection Observer for performance - pause animations when offscreen
    let isVisible = $state(true);

    /**
     * Svelte action to observe element visibility
     * @param {HTMLElement} node
     */
    function observeVisibility(node) {
        const observer = new IntersectionObserver(
            (entries) => {
                isVisible = entries[0].isIntersecting;
            },
            { threshold: 0, rootMargin: '50px' }
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            }
        };
    }
</script>

{#if isPopular}
    <div 
        use:observeVisibility
        class="popular-badge-wrapper {position} {size}"
        class:is-paused={!isVisible}
    >
        {#if variant === 'badge' || variant === 'both'}
            <div class="popular-badge">
                <i class="fas fa-fire badge-icon" aria-hidden="true"></i>
                <span class="badge-text">Popular</span>
            </div>
        {/if}
    </div>
{/if}

<style>
    .popular-badge-wrapper {
        position: absolute;
        z-index: 15;
        pointer-events: none;
    }

    .popular-badge-wrapper.top-left {
        top: 0.5rem;
        left: 0.5rem;
    }

    .popular-badge-wrapper.top-right {
        top: 0.5rem;
        right: 0.5rem;
    }

    .popular-badge-wrapper.bottom-left {
        bottom: 0.5rem;
        left: 0.5rem;
    }

    .popular-badge-wrapper.bottom-right {
        bottom: 0.5rem;
        right: 0.5rem;
    }

    /*
     * Dragon's Deep gold system: dark gold-tinted surface, static calm.
     * No pulsing opacity, no shimmer sweep, no sparkles.
     */
    .popular-badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.35rem 0.65rem;
        background: rgba(255, 201, 77, 0.12);
        border-radius: 2rem;
        font-weight: 600;
        color: #ffd88a;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 201, 77, 0.4);
        overflow: hidden;
        contain: layout style;
    }

    .badge-icon {
        font-size: 0.9em;
        color: #ffd88a;
    }

    .badge-text {
        font-size: 0.75rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    /* Size variants */
    .popular-badge-wrapper.sm .popular-badge {
        padding: 0.25rem 0.5rem;
        font-size: 0.65rem;
    }

    .popular-badge-wrapper.sm .badge-icon {
        font-size: 0.7em;
    }

    .popular-badge-wrapper.sm .badge-text {
        font-size: 0.6rem;
    }

    .popular-badge-wrapper.lg .popular-badge {
        padding: 0.5rem 0.85rem;
    }

    .popular-badge-wrapper.lg .badge-icon {
        font-size: 1.1em;
    }

    .popular-badge-wrapper.lg .badge-text {
        font-size: 0.85rem;
    }

    /* Static calm: no animations to pause. */

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .popular-badge {
            padding: 0.25rem 0.5rem;
        }

        .badge-text {
            font-size: 0.65rem;
        }

        .badge-icon {
            font-size: 0.8em;
        }
    }

    /* Reduced motion for accessibility (static badge: nothing to animate). */
</style>
