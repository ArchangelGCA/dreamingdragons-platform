<script>
    import { onMount, onDestroy } from 'svelte';
    /** @type {{notification: any, supabase: any, session: any}} */
    let {
        notification,
        supabase,
        session
    } = $props();

    let dateFormatted = new Date(notification.created_at).toLocaleDateString('en-GB');

    let watched = $state(notification.watched);
    let hasTriggered = $state(false);
    let observer;
    let isNew = $state(!notification.watched);

    onMount(() => {
        let element = document.querySelector('.notification');

        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !notification.watched && !hasTriggered) {
                    triggerWatched();
                    hasTriggered = true;
                }
            });
        });

        observer.observe(element);
    });

    onDestroy(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    async function triggerWatched() {
        if (!session) {
            return;
        }

        if (!notification || watched) {
            return;
        }

        const { error } = await supabase
            .from('notifications')
            .update({ watched: true })
            .eq('id', notification.id)
            .eq('recipient_id', session.user.id)
            .eq('watched', false);

        if (error) {
            console.error(error);
        } else {
            watched = true;
        }
    }

    function handleNotificationClick() {
        isNew = false;
    }
</script>

<div class="w-100" style="all: unset; cursor: pointer" onclick={handleNotificationClick} role="button" tabindex="0" onkeydown="{(e) => e.key === 'Enter' && handleNotificationClick()}">
    <div class="row border border-light-subtle rounded-3 p-2 mb-2 bg-black bg-opacity-10 notification {isNew ? 'new' : ''} {hasTriggered ? 'blink' : ''}" id="{notification.id}">
        <div class="col">
            <p class="fs-6 my-auto">
                {#if notification.type === 'like'}
                    <i class="fas fa-heart text-purple"></i> Someone liked your activity: <a class="link-purple text-decoration-none" href="/content/{notification.content}">Open</a>
                {:else if notification.type === 'follow'}
                    <i class="fas fa-user-plus text-purple"></i> Someone started following you: <a class="link-purple text-decoration-none" href="/profile/{notification.content}">Profile</a>
                {:else if notification.type === 'followed_activity'}
                    <i class="fas fa-bell text-purple"></i> Someone you follow shared something: <a class="link-purple text-decoration-none" href="/content/{notification.content}">Open</a>
                {:else if notification.type === 'comment'}
                    <i class="fas fa-comment text-purple"></i> Someone commented on your content: <a class="link-purple text-decoration-none" href="/content/{notification.content}">Open</a>
                {:else if notification.type === 'comment_reply'}
                    <i class="fas fa-comment text-purple"></i> Someone replied to your comment: <a class="link-purple text-decoration-none" href="/content/{notification.content}">Open</a>
                {:else if notification.type === 'warning'}
                    <i class="fas fa-exclamation-triangle text-purple"></i> You have a warning: <b class="text-danger-emphasis">{notification.content}</b>
                {/if}
            </p>
            <p class="fs-6 text-start text-muted text-date my-auto">{dateFormatted}</p>
        </div>
    </div>
</div>

<style>

    .notification {
        transition: all 0.3s;
    }

    .notification:hover {
        background-color: rgba(26, 26, 26, 0.5) !important;
        box-shadow: 0 0 10px 0 #a83fff;
    }

    .new {
        cursor: pointer;
        box-shadow: 0 0 5px 0 #a83fff;
    }

    .text-purple {
        color: #a83fff;
    }

    .link-purple {
        color: #a83fff;
    }

    .link-purple:hover {
        color: #8100e7;
    }

    .text-date {
        font-size: 0.9rem !important;
    }

    .blink {
        animation: blink 1s linear;
    }

    @keyframes blink {
        0% { box-shadow: 0 0 10px 0 #593fff; }
        50% { box-shadow: 0 0 20px 0 #a83fff; }
        90% { box-shadow: 0 0 10px 0 #593fff; }
        100% { box-shadow: 0 0 5px 0 #a83fff; }
    }
</style>