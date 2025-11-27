<script>
    import { PUBLIC_LIKES_FOR_COSMETIC_BADGE } from '$env/static/public';

    /**
     * @type {{
     *   likes: number,
     *   children: import('svelte').Snippet,
     *   class?: string
     * }}
     */
    let {
        likes = 0,
        children,
        class: className = ''
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
        if (!isPopular) return;

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

<div 
    use:observeVisibility
    class="popular-glow-wrapper {className}" 
    class:is-popular={isPopular}
    class:is-paused={!isVisible}
>
    {@render children()}
</div>

<style>
    .popular-glow-wrapper {
        position: relative;
        border-radius: inherit;
    }

    .popular-glow-wrapper.is-popular {
        --glow-color-1: hsla(280, 100%, 50%, 0.7);
        --glow-color-2: hsla(320, 100%, 50%, 0.6);
        --glow-color-3: hsla(350, 100%, 50%, 0.5);
    }

    /*
     * OPTIMIZED: Using only opacity animation instead of box-shadow animation.
     * box-shadow is static, only opacity pulses - runs on compositor thread.
     */
    .popular-glow-wrapper.is-popular::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(
            135deg,
            var(--glow-color-1) 0%,
            var(--glow-color-2) 50%,
            var(--glow-color-3) 100%
        );
        -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        animation: border-glow-optimized 3s ease-in-out infinite;
        z-index: 1;
        /* GPU layer promotion hint */
        will-change: opacity;
        contain: strict;
    }

    /*
     * OPTIMIZED: Static box-shadow with opacity-only animation.
     * Removed box-shadow keyframe changes which caused expensive repaints.
     */
    .popular-glow-wrapper.is-popular::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        /* Static shadow - no animation on shadow itself */
        box-shadow: 
            0 0 18px var(--glow-color-1),
            0 0 35px var(--glow-color-2),
            0 0 50px var(--glow-color-3);
        pointer-events: none;
        animation: outer-glow-optimized 3s ease-in-out infinite;
        z-index: 0;
        /* GPU layer promotion hint */
        will-change: opacity;
        contain: strict;
    }

    /* Pause animations when element is not visible (Intersection Observer) */
    .popular-glow-wrapper.is-paused::before,
    .popular-glow-wrapper.is-paused::after {
        animation-play-state: paused;
    }

    /*
     * OPTIMIZED: Only animating opacity - runs on compositor thread, no repaints.
     * Removed filter: hue-rotate() which was expensive.
     */
    @keyframes border-glow-optimized {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    /*
     * OPTIMIZED: Only animating opacity - avoids expensive box-shadow recalculation.
     * The pulsing effect is achieved through opacity changes alone.
     */
    @keyframes outer-glow-optimized {
        0%, 100% {
            opacity: 0.6;
        }
        50% {
            opacity: 0.9;
        }
    }

    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
        .popular-glow-wrapper.is-popular::before,
        .popular-glow-wrapper.is-popular::after {
            animation: none;
        }
    }
</style>
