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
                <span class="badge-icon">🔥</span>
                <span class="badge-text">Popular</span>
                <!-- OPTIMIZED: Consolidated sparkles into a single pseudo-element animation -->
                <div class="sparkle-container"></div>
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
     * OPTIMIZED: Removed backdrop-filter (expensive blur operation).
     * Static box-shadow instead of animated - glow effect via opacity animation.
     * Using will-change for GPU layer promotion.
     */
    .popular-badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.35rem 0.65rem;
        background: linear-gradient(
            135deg,
            hsla(280, 100%, 50%, 0.9) 0%,
            hsla(320, 100%, 45%, 0.9) 50%,
            hsla(350, 100%, 50%, 0.9) 100%
        );
        border-radius: 2rem;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        /* Static shadow - no animation on shadow itself */
        box-shadow: 
            0 0 12px hsla(320, 100%, 50%, 0.7),
            0 0 25px hsla(280, 100%, 50%, 0.5),
            inset 0 1px 0 hsla(0, 0%, 100%, 0.3);
        /* Only animate opacity - runs on compositor thread */
        animation: badge-pulse-optimized 2.5s ease-in-out infinite;
        border: 1px solid hsla(0, 0%, 100%, 0.2);
        overflow: hidden;
        /* GPU layer promotion hint */
        will-change: opacity;
        contain: layout style;
    }

    /*
     * OPTIMIZED: Using transform: translateX() instead of left property.
     * Transform is compositor-friendly, left causes layout recalculation.
     */
    .popular-badge::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            hsla(0, 0%, 100%, 0.3) 50%,
            transparent 100%
        );
        animation: shimmer-optimized 3s ease-in-out infinite;
        /* GPU layer promotion hint */
        will-change: transform;
    }

    /*
     * OPTIMIZED: Removed per-frame transform animation.
     * Using simpler opacity pulse that's less jarring and more performant.
     */
    .badge-icon {
        font-size: 0.9em;
        animation: flame-pulse 1s ease-in-out infinite alternate;
        will-change: opacity;
    }

    .badge-text {
        font-size: 0.75rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
    }

    /*
     * OPTIMIZED: Consolidated all sparkles into a single container with
     * pseudo-elements. Reduces DOM elements and animation overhead.
     * Using only opacity animation for better performance.
     */
    .sparkle-container {
        position: absolute;
        inset: -4px;
        pointer-events: none;
    }

    .sparkle-container::before,
    .sparkle-container::after {
        content: '';
        position: absolute;
        width: 3px;
        height: 3px;
        background: white;
        border-radius: 50%;
        animation: sparkle-optimized 2s ease-in-out infinite;
        will-change: opacity;
    }

    .sparkle-container::before {
        top: 0;
        right: 25%;
        animation-delay: 0s;
    }

    .sparkle-container::after {
        bottom: 0;
        left: 35%;
        animation-delay: 0.7s;
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

    /* Pause animations when element is not visible */
    .popular-badge-wrapper.is-paused .popular-badge,
    .popular-badge-wrapper.is-paused .popular-badge::before,
    .popular-badge-wrapper.is-paused .badge-icon,
    .popular-badge-wrapper.is-paused .sparkle-container::before,
    .popular-badge-wrapper.is-paused .sparkle-container::after {
        animation-play-state: paused;
    }

    /*
     * OPTIMIZED ANIMATIONS:
     * All animations now use only opacity and transform properties,
     * which can be hardware-accelerated and run on the compositor thread.
     */

    @keyframes badge-pulse-optimized {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.85;
        }
    }

    /* Using translateX instead of left property */
    @keyframes shimmer-optimized {
        0% {
            transform: translateX(-100%);
        }
        50%, 100% {
            transform: translateX(100%);
        }
    }

    /* Simple opacity pulse instead of transform animation */
    @keyframes flame-pulse {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0.7;
        }
    }

    /* Only opacity animation - no transform */
    @keyframes sparkle-optimized {
        0%, 100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }

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

    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
        .popular-badge {
            animation: none;
        }

        .popular-badge::before {
            animation: none;
        }

        .badge-icon {
            animation: none;
        }

        .sparkle-container::before,
        .sparkle-container::after {
            animation: none;
            opacity: 0;
        }
    }
</style>
