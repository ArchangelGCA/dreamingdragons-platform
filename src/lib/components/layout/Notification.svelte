<script>
    import { onMount, onDestroy } from 'svelte';
    export let notification;
    export let supabase;
    export let session;


    let dateFormatted = new Date(notification.created_at).toLocaleDateString('en-GB');

    let hasTriggered = false;
    let observer;
    let isNew = !notification.watched;

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

        if (!notification || notification.watched) {
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
            notification.watched = true;
        }
    }

    function handleNotificationClick() {
        isNew = false;
    }
</script>

<button class="w-100" style="all: unset" on:click={handleNotificationClick}>
    <div class="row border border-light-subtle rounded-3 p-2 mb-2 bg-black bg-opacity-10 notification {isNew ? 'new' : ''} {hasTriggered ? 'blink' : ''}" id="{notification.id}">
        <div class="col">
            <p class="fs-6 my-auto">
                {#if notification.type === 'like'}
                    <i class="fas fa-heart text-purple" ></i> Someone liked your activity: <a class="link-purple text-decoration-none" href="/content/{notification.content}" data-sveltekit-reload>Content</a>
                {:else if notification.type === 'follow'}
                    <i class="fas fa-user-plus text-purple" ></i> Someone started following you: <a class="link-purple text-decoration-none" href="/profile/{notification.content}" data-sveltekit-reload>Profile</a>
                {:else if notification.type === 'followed_activity'}
                    <i class="fas fa-bell text-purple" ></i> Someone you follow shared something: <a class="link-purple text-decoration-none" href="/content/{notification.content}" data-sveltekit-reload>View</a>
                {:else if notification.type === 'comment'}
                    <i class="fas fa-comment text-purple" ></i> Someone commented on your content: <a class="link-purple text-decoration-none" href="/content/{notification.content}" data-sveltekit-reload>Visit</a>
                {/if}
            </p>
            <p class="fs-6 text-start text-muted text-date my-auto">{dateFormatted}</p>
        </div>
    </div>
</button>

<style>

    .notification {
        transition: all 0.3s;
    }

    .notification:hover {
        background-color: #1a1a1a !important;
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