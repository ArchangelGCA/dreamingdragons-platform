<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import { tooltipConfig } from "$lib/utils/gcacommons.js";
    import { toast } from "$lib/components/svelte-toast";

    /** @type {string} */
    let { rssUrl, label = "RSS Feed", classes = "", size = "md" } = $props();

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
    class="btn btn-outline-warning {sizeClasses[size]} rss-btn {classes}"
    onclick={handleRSSClick}
    use:tooltip={{...tooltipConfig}} 
    title="{label} - Subscribe to updates"
    aria-label="{label}"
>
    <i class="fas fa-rss"></i>
    <span class="ms-1 rss-text">{label}</span>
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
      @media (max-width: 576px) {
        .rss-text {
            display: none;
        }
        
        .rss-btn {
            min-width: 40px;
        }
    }
</style>
