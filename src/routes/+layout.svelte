<script>
    import { invalidate } from '$app/navigation'
    import {onMount} from "svelte";
    import favicon from "$lib/images/favicon.webp";
    import { SvelteToast } from '@zerodevx/svelte-toast';
    import autoAnimate from '@formkit/auto-animate';
    import Notification from "$lib/components/layout/Notification.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import { page as pageStore } from '$app/stores';

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        },
        theme: 'text-center w-auto'
    };

    export let data;

    let { supabase, session, notifications } = data;
    $: ({ supabase, session } = data);

    let searchTerm = '';

    if ($pageStore.url.searchParams.has('q')) {
        searchTerm = $pageStore.url.searchParams.get('q');
    } else {
        searchTerm = '';
    }

    onMount(() => {

        const { data } = supabase.auth.onAuthStateChange((event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth');
            }
        })

        // Close navbar when open another page, with animation
        document.querySelectorAll('.nav-link').forEach((element) => {
            element.addEventListener('click', () => {
                document.querySelector('.navbar-collapse').classList.remove('show');
            });
        });

        return () => data.subscription.unsubscribe();
    });

    // Socials
    const socials = [
        {
            name: 'Discord',
            icon: 'fab fa-discord',
            link: 'https://discord.gg/F6cpNm9fZU', // TODO: Needs to be updated
        },
        {
            name: 'Github',
            icon: 'fab fa-github',
            link: 'https://github.com/ArchangelGCA',
        },
    ];

    const currentYear = new Date().getFullYear(); // Will use this in the footer to automatically update the year
    const owner = 'Roses In The Flames Official'
    const designedBy = 'ArchangelGCA';
    const designedByLink = 'https://archangelgca.eu';
    const tosLink = '/legal/tos'
    const privacyPolicyLink = '/legal/privacy-policy'
    const copyright = `© ${currentYear} ${owner}. All rights reserved.`;
    const notificationsRangeStep = 20;

    let notificationsCount = 0;
    let allNotificationsLoaded = false;
    if (notifications !== null && notifications.length !== 0) {
        // Count how many notifications have watched set to false
        const notificationsNotWatched = notifications.filter(notification => notification.watched === false);
        notificationsCount = notificationsNotWatched.length;
    } else {
        allNotificationsLoaded = true;
    }

    let loading = false;
    let page = 1;
    async function loadMoreNotifications() {
        if (loading || allNotificationsLoaded) return;

        loading = true;

        if (session){
            const { data: notifs, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', session.user.id)
                .order('created_at', { ascending: false })
                .range(notificationsRangeStep * page, notificationsRangeStep * (page + 1));

            if (error) {
                console.error(error)
            }

            if (notifs.length === 0) {
                allNotificationsLoaded = true;
            } else {
                notifications = [...notifications, ...notifs];
                page++;
            }
        }

        loading = false;
    }

    function handleScroll(event) {
        const target = event.target;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + (target.clientHeight / 2)) {
            loadMoreNotifications();
        }
    }
</script>

<SvelteToast />

<div class="row border-bottom border-light-subtle py-2">
    <div class="col-2">
        <a href="/">
            <img src={favicon} alt="Logo" width="40" height="40" title="Homepage" /> <!-- TODO: Use enhanced logo and use tooltip with position -->
        </a>
    </div>
    <div class="col-6 col-md-8 my-auto">
        <form action="/search" method="get" data-sveltekit-reload>
            <div class="input-group">
                <input type="text" class="form-control form-control-sm border-0 rounded-start-3" placeholder="Search" aria-label="Search" aria-describedby="searchButton" name="q" bind:value={searchTerm} />
                <button class="btn btn-sm btn-outline-search" type="submit" id="searchButton"><i class="fas fa-search"></i></button>
            </div>
        </form>
    </div>
    <div class="col-4 col-md-2 text-end">
        <div class="row align-items-center" use:autoAnimate>
            {#if notificationsCount !== 0}
                <div class="col pe-3 mt-1">
                    <div class="position-relative">
                        <button class="btn border border-0 p-0 bg-transparent" on:click={() => notificationsCount = 0} on:keydown={() => notificationsCount = 0}>
                            <i class="fas fa-bell mt-2" id="notificationBell" data-bs-toggle="offcanvas" data-bs-target="#notifications" aria-controls="notifications"></i>
                        </button>
                        <span class="position-absolute top-0 start-100 mt-1 ms-2 translate-middle badge rounded-pill bg-danger">{notificationsCount}</span>
                    </div>
                </div>
            {:else}
                <div class="col pe-1">
                    <i class="fas fa-bell mt-2" id="notificationBell" data-bs-toggle="offcanvas" data-bs-target="#notifications" aria-controls="notifications"></i>
                </div>
            {/if}
            <div class="col-auto">
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle animate-button" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-user pe-1"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                        <li><a class="dropdown-item" data-sveltekit-reload href="/profile"><i class="fas fa-user-circle border-end border-light-subtle pe-2"></i> Profile</a></li>
                        <li><a class="dropdown-item" href="/settings"><i class="fa-solid fa-sliders border-end border-light-subtle pe-2"></i> Settings</a></li>
                        <li><a class="dropdown-item animate-button rounded-3 py-2" href="/upload"><i class="fa-solid fa-upload border-end border-light-subtle pe-2"></i> Upload</a></li>
                        <li><a class="dropdown-item mt-1" href="/settings" data-sveltekit-preload-data="tap"><i class="fa-solid fa-arrow-right-from-bracket border-end border-light-subtle pe-2"></i> Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="offcanvas offcanvas-end rounded-4 p-2 my-2 me-1" tabindex="-1" id="notifications" aria-labelledby="notifications">
    <div class="offcanvas-header bg-light bg-opacity-10 rounded-4">
        <h5 class="offcanvas-title mt-1">Notifications</h5>
        <button type="button" class="btn-close me-1" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body" on:scroll={handleScroll}>
        {#if notifications !== null && notifications.length !== 0}
            {#each notifications as notification}
                <Notification {notification} {supabase} {session} />
            {/each}
        {:else}
            <div class="row border border-light-subtle rounded-3 p-2 mb-2">
                <div class="col">
                    <p class="fs-6 text-center mb-auto">No notifications found.</p>
                </div>
            </div>
        {/if}
    </div>
</div>

<div use:autoAnimate>
    <slot></slot>
</div>


<div class="row border-top border-light-subtle pt-3 pb-2">
    <div class="col">
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">Designed by: <a href="{designedByLink}" use:tooltip={{...tooltipConfig}} title="Visit Developer" target="_blank">{designedBy}</a></p>
            </div>
        </div>
        <!-- Socials -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center mb-1">Follow us on:</p>
                <p class="fs-4 text-center">
                    {#each socials as social}
                        <a href="{social.link}" target="_blank" use:tooltip={{...tooltipConfig}} title="Open {social.name}" class="text-decoration-none text-light px-1"><i class="{social.icon}"></i></a>
                    {/each}
                </p>
            </div>
        </div>
        <!-- Links to TOS and Privacy Policy -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">For Terms of Service and Privacy Policy, please visit: <a href="{tosLink}" target="_blank" use:tooltip={{...tooltipConfig}} title="Terms Of Service" class="text-decoration-none text-light">TOS</a> and <a href="{privacyPolicyLink}" target="_blank" use:tooltip={{...tooltipConfig}} data-bs-placement="top" title="Privacy Policy" class="text-decoration-none text-light">Privacy Policy</a>.</p>
            </div>
        </div>
        <!-- Copyright -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">{copyright}</p>
            </div>
        </div>
    </div>
</div>

<style>
    .animate-button {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 5s ease infinite, tranform 1s ease-in-out;
    }

    .animate-button:hover {
        background: linear-gradient(230deg, #0b0086, #5c00a6);
    }

    .animate-button:active {
        transform: scale(0.95);
    }

    .btn-outline-search {
        border-color: #b200e8;
        color: #b200e8;
    }

    .btn-outline-search:hover {
        background-color: #5c00a6;
        color: #c400ff;
    }

    #notificationBell {
        cursor: pointer;
        font-size: 1.1rem;
    }

    @keyframes Gradient {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
    }
</style>