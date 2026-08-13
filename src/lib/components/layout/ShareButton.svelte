<script>
    import { tooltip } from "svelte-tooltip-gca";
    import { tooltipConfig } from "$lib/utils/gcacommons.js";
    import { toast } from "$lib/components/svelte-toast";
    import { browser } from "$app/environment";

    /** @type {string} */
    let { url, title = "Check this out!", description = "", classes = "", compact = false } = $props();

    let showDropdown = $state(false);const shareOptions = [
        {
            name: "Copy Link",
            icon: "fas fa-copy",
            action: copyToClipboard,
            color: "#6c757d"
        },
        {
            name: "Twitter/X",
            icon: "fab fa-x-twitter",
            action: () => shareToTwitter(),
            color: "#000000"
        },
        {
            name: "Facebook",
            icon: "fab fa-facebook",
            action: () => shareToFacebook(),
            color: "#1877f2"
        },
        {
            name: "Reddit",
            icon: "fab fa-reddit",
            action: () => shareToReddit(),
            color: "#ff4500"
        },
        {
            name: "WhatsApp",
            icon: "fab fa-whatsapp",
            action: () => shareToWhatsApp(),
            color: "#25d366"
        },
        {
            name: "Telegram",
            icon: "fab fa-telegram",
            action: () => shareToTelegram(),
            color: "#0088cc"
        }
    ];

    async function copyToClipboard() {
        if (!browser) return;
        
        try {
            await navigator.clipboard.writeText(url);
            toast.push('📋 Link copied to clipboard!', {
                theme: {
                    '--toastBackground': '#5c00a6',
                    '--toastColor': '#fff',
                }
            });
        } catch (err) {
            toast.push('❌ Failed to copy link', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }
        showDropdown = false;
    }

    function shareToTwitter() {
        const text = encodeURIComponent(`${title} ${description}`);
        const shareUrl = encodeURIComponent(url);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
        showDropdown = false;
    }

    function shareToFacebook() {
        const shareUrl = encodeURIComponent(url);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
        showDropdown = false;
    }

    function shareToReddit() {
        const shareTitle = encodeURIComponent(title);
        const shareUrl = encodeURIComponent(url);
        window.open(`https://reddit.com/submit?url=${shareUrl}&title=${shareTitle}`, '_blank');
        showDropdown = false;
    }

    function shareToWhatsApp() {
        const text = encodeURIComponent(`${title}\n${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        showDropdown = false;
    }

    function shareToTelegram() {
        const text = encodeURIComponent(`${title}\n${url}`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        showDropdown = false;
    }

    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    function handleClickOutside(event) {
        if (!event.target.closest('.share-dropdown')) {
            showDropdown = false;
        }
    }
</script>

<svelte:document onclick={handleClickOutside} />

<div class="share-dropdown position-relative d-inline-block {classes}">
    <button 
        class="btn btn-link text-light text-decoration-none border-0 share-btn {compact ? 'p-1' : 'p-0'}"
        onclick={toggleDropdown}
        use:tooltip={{...tooltipConfig, content: 'Share'}}
        aria-label="Share content"
        aria-expanded={showDropdown}
        style={compact ? 'font-size: 0.9rem; opacity: 0.8;' : ''}
    >
        <i class="fas fa-share-alt"></i>
    </button>
      {#if showDropdown}
        <div class="dropdown-menu show position-absolute bg-dark border-0 shadow-lg rounded-3 p-2" style="top: 100%; right: 0; z-index: 1000; min-width: 200px;">
            <div class="text-light text-center mb-2 fw-bold fs-6">Share</div>
            <div class="row g-1">
                {#each shareOptions as option}
                    <div class="col-6">                        <button 
                            class="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center p-2 text-nowrap"
                            onclick={option.action}
                            style="border-color: rgba(255,255,255,0.2);"
                        >
                            <i class="{option.icon} me-1" style="color: {option.color}; font-size: 0.85rem;"></i>
                            <span class="text-light" style="font-size: 0.75rem;">{option.name}</span>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .share-btn {
        transition: all 0.2s ease-in-out;
    }
    
    .share-btn:hover {
        transform: scale(1.1);
        color: #5c00a6 !important;
    }
      .dropdown-menu {
        background-color: #340061 !important;
        animation: fadeInUp 0.2s ease-out;
    }
    
    .dropdown-menu .btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
      .fs-7 {
        font-size: 0.8rem;
    }
    
    @media (max-width: 576px) {
        .dropdown-menu {
            min-width: 180px;
            right: -10px;
        }
        
        .dropdown-menu .btn {
            font-size: 0.7rem;
            padding: 8px 4px;
        }
        
        .dropdown-menu .btn i {
            font-size: 0.8rem;
        }
        
        .dropdown-menu .btn span {
            font-size: 0.65rem;
        }
    }
      :global(.share-dropdown.compact) {
        font-size: 0.75rem;
    }

    :global(.share-dropdown.compact .dropdown-menu) {
        min-width: 150px;
    }

    :global(.share-dropdown.compact .dropdown-menu .btn) {
        padding: 6px 3px;
    }

    :global(.share-dropdown.compact .dropdown-menu .btn i) {
        font-size: 0.7rem;
    }

    :global(.share-dropdown.compact .dropdown-menu .btn span) {
        font-size: 0.6rem;
    }
</style>
