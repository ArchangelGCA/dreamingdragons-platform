<script>
    import { tooltip } from "svelte-tooltip-gca";
    import { tooltipConfig } from "$lib/utils/gcacommons.js";

    /** @type {{chapterCount?: number, size?: 'sm' | 'md' | 'lg'}} */
    let { chapterCount = 0, size = 'md' } = $props();

    // Only show badge for books with chapters (multi-chapter works)
    let isBook = $derived(chapterCount > 0);
    let tooltipText = $derived(`Book with ${chapterCount} chapter${chapterCount !== 1 ? 's' : ''}`);

    // Size classes for different badge sizes
    let sizeClasses = $derived({
        sm: 'badge-sm',
        md: 'badge-md',
        lg: 'badge-lg'
    }[size]);
</script>

{#if isBook}
    <span 
        class="content-type-badge {sizeClasses} badge-book"
        use:tooltip={{...tooltipConfig, content: tooltipText}}
    >
        <i class="fas fa-book"></i>
        <span class="badge-label">Book</span>
        <span class="chapter-count">({chapterCount})</span>
    </span>
{/if}

<style>
    .content-type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        border-radius: 1rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
        white-space: nowrap;
        transition: all 0.15s ease-in-out;
    }

    /* Book badge - pink/magenta theme matching site accent color */
    .badge-book {
        background: linear-gradient(135deg, hsla(330, 80%, 45%, 0.95) 0%, hsla(300, 70%, 35%, 0.95) 100%);
        color: #fff;
        box-shadow: 0 2px 8px hsla(330, 80%, 50%, 0.35);
    }

    .badge-book:hover {
        box-shadow: 0 4px 12px hsla(330, 80%, 50%, 0.55);
        transform: translateY(-1px);
    }

    /* Size variants */
    .badge-sm {
        padding: 0.15rem 0.4rem;
        font-size: 0.6rem;
    }

    .badge-sm .fas {
        font-size: 0.55rem;
    }

    .badge-md {
        padding: 0.2rem 0.5rem;
        font-size: 0.7rem;
    }

    .badge-md .fas {
        font-size: 0.65rem;
    }

    .badge-lg {
        padding: 0.3rem 0.7rem;
        font-size: 0.8rem;
    }

    .badge-lg .fas {
        font-size: 0.75rem;
    }

    .chapter-count {
        opacity: 0.9;
        font-weight: 700;
    }

    .badge-label {
        font-weight: 600;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .badge-sm {
            padding: 0.1rem 0.3rem;
            font-size: 0.55rem;
        }

        .badge-md {
            padding: 0.15rem 0.4rem;
            font-size: 0.6rem;
        }

        .badge-lg {
            padding: 0.2rem 0.5rem;
            font-size: 0.7rem;
        }
    }
</style>
