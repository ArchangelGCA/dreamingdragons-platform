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
        --glow-color-1: rgba(255, 201, 77, 0.4);
        --glow-color-2: rgba(255, 201, 77, 0.3);
        --glow-color-3: rgba(255, 216, 138, 0.25);
    }

    /*
     * Dragon's Deep: static calm gold border. No breathing opacity animation.
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
        z-index: 1;
        contain: strict;
    }

    /*
     * Dragon's Deep: static soft gold shadow. No pulsing.
     */
    .popular-glow-wrapper.is-popular::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.45),
            0 0 12px var(--glow-color-2);
        pointer-events: none;
        z-index: 0;
        contain: strict;
    }

    /* Static calm: no pause handling needed. */

    /* Reduced motion for accessibility (static glow: nothing to animate). */
</style>
