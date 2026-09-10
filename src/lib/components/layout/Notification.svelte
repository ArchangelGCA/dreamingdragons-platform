<script>
    import { onMount, onDestroy } from 'svelte';
    import { fly } from 'svelte/transition';
    
    /** @type {{notification: any, supabase: any, session: any, onDismiss?: (id: string) => void}} */
    let {
        notification,
        supabase,
        session,
        onDismiss
    } = $props();

    let dateFormatted = $derived(formatRelativeTime(notification.created_at));
    let watched = $state(notification.watched);
    let hasTriggered = $state(false);
    let observer;
    let isNew = $state(!notification.watched);
    let notificationEl;

    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    // Notification type configurations
    const notificationTypes = {
        like: {
            icon: 'fa-heart',
            iconClass: 'text-danger',
            bgClass: 'notification-like',
            label: 'New like',
            getMessage: (content) => 'Someone liked your activity',
            getLink: (content) => `/content/${content}`,
            linkText: 'View'
        },
        follow: {
            icon: 'fa-user-plus',
            iconClass: 'text-info',
            bgClass: 'notification-follow',
            label: 'New follower',
            getMessage: (content) => 'Someone started following you',
            getLink: (content) => `/profile/${content}`,
            linkText: 'Profile'
        },
        followed_activity: {
            icon: 'fa-rss',
            iconClass: 'text-success',
            bgClass: 'notification-activity',
            label: 'New content',
            getMessage: (content) => 'Someone you follow shared something',
            getLink: (content) => `/content/${content}`,
            linkText: 'View'
        },
        comment: {
            icon: 'fa-comment',
            iconClass: 'text-primary',
            bgClass: 'notification-comment',
            label: 'New comment',
            getMessage: (content) => 'Someone commented on your content',
            getLink: (content) => `/content/${content}`,
            linkText: 'View'
        },
        comment_reply: {
            icon: 'fa-reply',
            iconClass: 'text-primary',
            bgClass: 'notification-reply',
            label: 'New reply',
            getMessage: (content) => 'Someone replied to your comment',
            getLink: (content) => `/content/${content}`,
            linkText: 'View'
        },
        warning: {
            icon: 'fa-exclamation-triangle',
            iconClass: 'text-warning',
            bgClass: 'notification-warning',
            label: 'Warning',
            getMessage: (content) => content,
            getLink: null,
            linkText: null
        }
    };

    let config = $derived(notificationTypes[notification.type] || notificationTypes.like);

    onMount(() => {
        if (notificationEl) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !notification.watched && !hasTriggered) {
                        triggerWatched();
                        hasTriggered = true;
                    }
                });
            });
            observer.observe(notificationEl);
        }
    });

    onDestroy(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    async function triggerWatched() {
        if (!session || !notification || watched) return;

        const { error } = await supabase
            .from('notifications')
            .update({ watched: true })
            .eq('id', notification.id)
            .eq('recipient_id', session.user.id)
            .eq('watched', false);

        if (!error) {
            watched = true;
        }
    }

    function handleNotificationClick() {
        isNew = false;
    }

    function handleDismiss(e) {
        e.preventDefault();
        e.stopPropagation();
        if (onDismiss) {
            onDismiss(notification.id);
        }
    }
</script>

<div 
    bind:this={notificationEl}
    class="notification-item {config.bgClass} {isNew ? 'is-new' : ''} {hasTriggered ? 'triggered' : ''}"
    onclick={handleNotificationClick}
    onkeydown={(e) => e.key === 'Enter' && handleNotificationClick()}
    role="button"
    tabindex="0"
    id="notification-{notification.id}"
    in:fly={{ y: -20, duration: 300 }}
>
    <div class="notification-icon-wrapper">
        <div class="notification-icon">
            <i class="fas {config.icon} {config.iconClass}"></i>
        </div>
        {#if isNew}
            <span class="new-indicator"></span>
        {/if}
    </div>
    
    <div class="notification-content">
        <div class="notification-header">
            <span class="notification-label">{config.label}</span>
            <span class="notification-time">{dateFormatted}</span>
        </div>
        <p class="notification-message">
            {config.getMessage(notification.content)}
        </p>
        {#if config.getLink}
            <a 
                href={config.getLink(notification.content)} 
                class="notification-link"
                onclick={(e) => e.stopPropagation()}
            >
                {config.linkText} <i class="fas fa-arrow-right ms-1"></i>
            </a>
        {:else if notification.type === 'warning'}
            <span class="notification-warning-content">{notification.content}</span>
        {/if}
    </div>

    {#if onDismiss}
        <button 
            class="notification-dismiss"
            onclick={handleDismiss}
            aria-label="Dismiss notification"
        >
            <i class="fas fa-times"></i>
        </button>
    {/if}
</div>

<style>
    .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        margin-bottom: 0.5rem;
        border-radius: 0.75rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }

    .notification-item:hover {
        background: rgba(var(--dd-accent-rgb), 0.25);
        border-color: rgba(var(--dd-bright-rgb), 0.3);
        transform: translateX(4px);
    }

    .notification-item:focus-visible {
        outline: 2px solid rgba(var(--dd-bright-rgb), 0.5);
        outline-offset: 2px;
    }

    .notification-item.is-new {
        background: rgba(var(--dd-accent-rgb), 0.15);
        border-color: rgba(var(--dd-bright-rgb), 0.3);
    }

    .notification-item.triggered {
        animation: pulse-once 0.6s ease;
    }

    @keyframes pulse-once {
        0%, 100% { box-shadow: 0 0 0 0 rgba(var(--dd-bright-rgb), 0); }
        50% { box-shadow: 0 0 20px 5px rgba(var(--dd-bright-rgb), 0.3); }
    }

    .notification-icon-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .notification-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--dd-deep-2);
        color: var(--text-color);
        font-size: 1rem;
    }

    .new-indicator {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 10px;
        height: 10px;
        background: var(--dd-accent-bright);
        border-radius: 50%;
        border: 2px solid var(--dd-deep-1);
    }

    .notification-content {
        flex: 1;
        min-width: 0;
    }

    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
        gap: 0.5rem;
    }

    .notification-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: rgba(255, 255, 255, 0.7);
    }

    .notification-time {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
        flex-shrink: 0;
    }

    .notification-message {
        margin: 0;
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
    }

    .notification-link {
        display: inline-flex;
        align-items: center;
        margin-top: 0.5rem;
        padding: 0.35rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-color);
        background: var(--dd-deep-2);
        border-radius: 1rem;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    .notification-link:hover {
        background: var(--dd-accent);
        transform: translateY(-1px);
        text-decoration: none;
        color: var(--text-color);
    }

    .notification-warning-content {
        display: block;
        margin-top: 0.375rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 193, 7, 0.15);
        border-left: 3px solid #ffc107;
        border-radius: 0.25rem;
        font-size: 0.8rem;
        color: #ffc107;
    }

    .notification-dismiss {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
    }

    .notification-item:hover .notification-dismiss {
        opacity: 1;
    }

    .notification-dismiss:hover {
        background: rgba(255, 0, 0, 0.3);
        color: #fff;
    }

    /* Type-specific icon colors */
    .notification-like .notification-icon { background: rgba(220, 53, 69, 0.2); }
    .notification-follow .notification-icon { background: rgba(13, 202, 240, 0.2); }
    .notification-activity .notification-icon { background: rgba(25, 135, 84, 0.2); }
    .notification-comment .notification-icon { background: rgba(var(--dd-accent-rgb), 0.25); }
    .notification-reply .notification-icon { background: rgba(var(--dd-accent-rgb), 0.25); }
    .notification-warning .notification-icon { background: rgba(255, 193, 7, 0.2); }

    /* Mobile optimizations */
    @media (max-width: 576px) {
        .notification-item {
            padding: 0.75rem;
            gap: 0.625rem;
        }

        .notification-icon {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 0.9rem;
        }

        .notification-message {
            font-size: 0.8125rem;
        }

        .notification-link {
            padding: 0.3rem 0.625rem;
            font-size: 0.7rem;
        }
    }
</style>