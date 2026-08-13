<script>
    import { tooltip } from "svelte-tooltip-gca";
    import { tooltipConfig } from "$lib/utils/gcacommons.js";
    import { toast } from "$lib/components/svelte-toast";    /** @type {string} */
    let { rssUrl, label = "RSS Feed", classes = "", size = "md", compact = false } = $props();

    function handleRSSClick() {
        // Open RSS feed in a new tab
        window.open(rssUrl, '_blank');
        
        toast.push('🔔 RSS feed opened!', {
            theme: {
                '--toastBackground': '#ff6600',
                '--toastColor': '#fff',
            }
        });
    }

    // Size classes mapping
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };
</script>

<button 
    class="btn {compact ? 'btn-link text-warning text-decoration-none border-0 p-1' : `btn-outline-warning ${sizeClasses[size]}`} rss-btn {classes}"
    onclick={handleRSSClick}
    use:tooltip={{...tooltipConfig, content: `${label} - Subscribe to updates`}}
    aria-label="{label}"
    style={compact ? 'font-size: 0.9rem; opacity: 0.8;' : ''}
>
    <i class="fas fa-rss"></i>
    {#if !compact}
        <span class="ms-1 rss-text">{label}</span>
    {/if}
</button>

<style>
    .rss-btn {
        border-color: #ff6600;
        color: #ff6600;
        transition: all 0.2s ease-in-out;
    }
    
    .rss-btn:hover {
        background-color: #ff6600;
        border-color: #ff6600;
        color: white;
        transform: scale(1.05);
    }
    
    .rss-btn:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 102, 0, 0.25);
    }
    
    /* Compact variant styles */
    .btn-link.rss-btn:hover {
        color: #ff6600 !important;
        background-color: transparent;
        border-color: transparent;
        transform: scale(1.1);
    }
      @media (max-width: 576px) {
        .rss-text {
            display: none;
        }
        
        .rss-btn {
            min-width: 40px;
        }
    }
</style>
