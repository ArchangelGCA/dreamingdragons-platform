<script>
    import "$lib/css/global.css";
    import {invalidateAll} from "$app/navigation";
    import {onDestroy, onMount, tick} from "svelte";
    import favicon from "$lib/images/favicon.webp";
    import {SvelteToast} from "$lib/components/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import Notification from "$lib/components/layout/Notification.svelte";
    import {tooltip} from "@svelte-plugins/tooltips";
    import {page} from '$app/state';
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import {deserialize} from "$app/forms";
    import Seo from "$lib/components/seo/Seo.svelte";
    import {browser} from "$app/environment";

    /** @type {{data: any, children?: import('svelte').Snippet}} */
    let {data, children} = $props();

    let {supabase, session, image_proxy, notifications, tooltipConfig, userData} = $state(data);
    $effect(() => {
        ({supabase, session, notifications, tooltipConfig, userData} = data)
    });

    $effect(() => {
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange(async (event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                await invalidateAll();
            }
        })
        return () => subscription.unsubscribe();
    });

    let latestNotificationTimestamp = $derived(notifications && notifications.length > 0 ? notifications[0].created_at : null);

    let intervalId;
    let searchTerm = $state('');
    const notifsUpdateInterval = 30000;
    let maintenance = $state(false);

    if (page.url.searchParams.has('q')) {
        searchTerm = page.url.searchParams.get('q');
    } else {
        searchTerm = '';
    }

    onMount(() => {

        const {data} = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidateAll();
            }
        });

        // Close navbar when open another page, with animation
        if (browser) {
            document.querySelectorAll('.nav-link').forEach((element) => {
                element.addEventListener('click', () => {
                    document.querySelector('.navbar-collapse').classList.remove('show');
                });
            });
        }

        intervalId = setInterval(async () => {
            await tick();
            await fetchNewNotifications();
        }, notifsUpdateInterval);

        return () => data.subscription.unsubscribe()
    });

    onDestroy(() => {
        clearInterval(intervalId);
    });

    // Socials
    const socials = [
        {
            name: 'Discord',
            icon: 'fab fa-discord',
            link: 'https://discord.gg/u6qFjfDDy2',
        },
        {
            name: 'Github',
            icon: 'fab fa-github',
            link: 'https://github.com/ArchangelGCA',
        },
    ];

    const currentYear = new Date().getFullYear(); // Will use this in the footer to automatically update the year
    const owner = 'DreamingDragons'
    const designedBy = 'ArchangelGCA';
    const designedByLink = 'https://archangelgca.eu';
    const tosLink = '/legal/tos'
    const privacyPolicyLink = '/legal/privacy-policy'
    const copyright = `© ${currentYear} ${owner}. All rights reserved.`;
    const notificationsRangeStep = 20;

    let notificationsCount = $derived(notifications.filter(notification => notification.watched === false).length);
    let allNotificationsLoaded = false;

    let loading = false;
    let notificationsStart = 0;
    let notificationsEnd = notificationsRangeStep;

    async function loadMoreNotifications() {
        if (loading || allNotificationsLoaded) return;

        loading = true;

        if (session) {
            const formData = new FormData();
            formData.append('startRange', notificationsStart);
            formData.append('endRange', notificationsEnd);

            let notifs = [];

            const response = await fetch('/?/loadMoreNotifications', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    notifs = result.data.body.notifs;
                }
            }

            if (notifs.length === 0) {
                allNotificationsLoaded = true;
            } else {
                notifications = [...notifications, ...notifs.filter(notif => !notifications.some(notification => notification.id === notif.id))];
                notificationsStart = notificationsEnd;
                notificationsEnd += notificationsRangeStep;
            }
        }

        loading = false;
    }

    async function fetchNewNotifications() {
        if (session) {
            const formData = new FormData();
            formData.append('latestNotificationTimestamp', latestNotificationTimestamp);

            const response = await fetch('/?/newNotifications', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    let newNotifs = result.data.body.newNotifs;
                    if (newNotifs && newNotifs.length > 0) {
                        newNotifs = newNotifs.filter(notif => !notifications.some(notification => notification.id === notif.id));
                        notifications = [...newNotifs, ...notifications];
                        // latestNotificationTimestamp = notifications[0].created_at; // Should be unnecessary due to derived
                        // notificationsCount += newNotifs.length; // Should be unnecessary due to derived
                    }
                }
            }
        }
    }

    function handleScroll(event) {
        const target = event.target;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + (target.clientHeight / 2)) {
            loadMoreNotifications();
        }
    }

    async function setNotificationsAsRead() {
        if (session) {
            for (const notification of notifications) {
                if (!notification.watched) {
                    const {error} = await supabase
                        .from('notifications')
                        .update({watched: true})
                        .eq('id', notification.id)
                        .eq('recipient_id', session.user.id)
                        .eq('watched', false);

                    if (error) {
                        console.error(error);
                    } else {
                        notification.watched = true;
                    }
                }
            }
        }
    }
</script>

<Seo />

<SvelteToast />

<div class="container-fluid bg-black bg-opacity-50" style="max-width: 100%; overflow-x: hidden">

    <!-- Start Navbar -->
    <div class="row navbar-container py-2">
        <!-- Logo -->
        <div class="col-2 col-md-3 col-xxl-4">
            <a href="/" aria-label="DreamingDragons - Home" title="Homepage">
                <img src={favicon} class="logo rounded-circle" alt="Logo" width="40" height="40" title="Homepage"/>
            </a>
        </div>
        <!-- Search -->
        <div class="col-6 col-xxl-4 my-auto pe-0">
            <form action="/search" method="GET" data-sveltekit-reload>
                <div class="input-group">
                    <input type="text"
                           class="form-control form-control-sm bg-light bg-opacity-10 border-0 rounded-start-3"
                           placeholder="Search" aria-label="Search" aria-describedby="searchButton" name="q"
                           bind:value={searchTerm}/>
                    <button class="btn btn-sm btn-outline-search" type="submit" id="searchButton" aria-label="Search"><i
                            class="fas fa-search"></i></button>
                </div>
            </form>
        </div>
        <!-- Notifications & Profile -->
        <div class="col-4 col-md-3 col-xxl-4 text-end ps-0">
            <div class="row align-items-center" use:autoAnimate>
                {#if notificationsCount !== 0}
                    <div class="col pe-3 mt-1">
                        <div class="position-relative">
                            <button class="btn border border-0 p-0 bg-transparent"
                                    onclick={() => setNotificationsAsRead()} onkeydown={() => setNotificationsAsRead()}
                                    aria-label="View notifications">
                                <i class="fas fa-bell mt-2" id="notificationBell" data-bs-toggle="offcanvas"
                                   data-bs-target="#notifications" aria-controls="notifications"></i>
                            </button>
                            <span class="position-absolute top-0 start-100 mt-1 ms-2 translate-middle badge rounded-pill bg-danger">{notificationsCount}</span>
                        </div>
                    </div>
                {:else}
                    <div class="col pe-1">
                        <i class="fas fa-bell mt-2" id="notificationBell" data-bs-toggle="offcanvas"
                           data-bs-target="#notifications" aria-controls="notifications"></i>
                    </div>
                {/if}
                <!-- Upload -->
                {#if session}
                    <div class="col-auto pe-0 mt-1">
                        <a class="link-animated rounded-3" href="/upload" aria-label="Upload"
                           use:tooltip={{...tooltipConfig}} title="Upload">
                            <i class="fa-solid fa-upload"></i>
                        </a>
                    </div>
                {/if}
                <!-- Profile -->
                <div class="col-auto">
                    <div class="dropdown">
                        <button class="btn btn-transparent py-0 pt-1 ps-0 pe-1" type="button" id="profileDropdown"
                                data-bs-toggle="dropdown" aria-expanded="false" aria-label="Profile Menu Button"
                                use:autoAnimate>
                            {#if !userData || userData === null || userData.avatar_url === null || userData.avatar_url === ''}
                                <i class="fa-solid fa-user py-2 pb-2 mb-1 px-2 border border-2 border-light border-opacity-25 rounded-3"></i>
                            {:else}
                                <UserAvatarNavbar classes="profile-avatar" url={userData.avatar_url}
                                                  username={userData.username} {image_proxy} size="35px"/>
                            {/if}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end mt-2 {session ? 'pt-0' : 'pt-2'}"
                            aria-labelledby="profileDropdown" use:autoAnimate>
                            {#if !userData || userData === null || userData.avatar_url === null || userData.avatar_url === ''}
                                {#if session}
                                    <li><a class="dropdown-item" data-sveltekit-reload href="/profile"><i
                                            class="fas fa-user-circle border-end border-light-subtle pe-2"></i> Profile</a>
                                    </li>
                                {:else}
                                    <li class="text-center">
                                        <p class="fs-6 text-muted mb-1">Not logged in...</p>
                                    </li>
                                {/if}
                            {:else}
                                <li class="text-center">
                                    <a class="dropdown-item ps-1 mb-1 {page.url.pathname.startsWith('/profile') ? 'active' : ''}"
                                       href="/profile">
                                        <UserAvatarNavbar classes="me-1" url={userData.avatar_url}
                                                          username={userData.username} {image_proxy} size="50px"/>
                                        <span class="border-start border-light-subtle ps-1 my-auto">Profile</span>
                                    </a>
                                </li>
                            {/if}
                            <li><a class="dropdown-item {page.url.pathname.startsWith('/settings') ? 'active' : ''} {!session ? 'mb-1' : ''}"
                                   href="/settings"><i
                                    class="fa-solid fa-sliders border-end border-light-subtle pe-2"></i> Settings</a>
                            </li>
                            {#if session}
                                <li>
                                    <a class="dropdown-item upload-button rounded-3 py-2 my-1 {page.url.pathname.startsWith('/upload') ? 'active' : ''}"
                                       href="/upload"><i
                                            class="fa-solid fa-upload border-end border-light-subtle pe-2"></i>
                                        Upload</a></li>
                            {/if}
                            <li><a class="dropdown-item {page.url.pathname.startsWith('/updates') ? 'active' : ''}"
                                   href="/updates"><i class="fas fa-newspaper border-end border-light-subtle pe-2"></i>
                                Updates</a></li>
                            {#if session}
                                <li><a class="dropdown-item" href="/settings" data-sveltekit-preload-data="tap"><i
                                        class="fa-solid fa-arrow-right-from-bracket border-end border-light-subtle pe-2"></i>
                                    Logout</a></li>
                            {:else}
                                <li><a class="dropdown-item register-button rounded-3 py-2 my-1" href="/login?signup=true"><i
                                        class="fa-solid fa-user-plus border-end border-light-subtle pe-1"></i> Register</a>
                                </li>
                                <li><a class="dropdown-item" href="/login"><i
                                        class="fa-solid fa-sign-in border-end border-light-subtle pe-2"></i> Login</a>
                                </li>
                            {/if}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- End Navbar -->

    <div class="offcanvas offcanvas-end rounded-4 p-2 my-2 me-lg-2" tabindex="-1" id="notifications"
         aria-labelledby="notifications">
        <div class="offcanvas-header bg-light bg-opacity-25 rounded-4">
            <h5 class="offcanvas-title mt-1">Notifications</h5>
            <button type="button" class="btn-close me-1" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body" onscroll={handleScroll}>
            {#if notifications && notifications !== null && notifications.length !== 0}
                {#each notifications as notification (notification.id)}
                    <Notification {notification} {supabase} {session}/>
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

    <!-- Maintenance and Content -->
    <div use:autoAnimate style="overflow-y: hidden; overflow-x: hidden">
        {#if maintenance}
            <!-- Warning like row telling peoples that the website is in maintenance mode temporarily and there may be issues -->
            <div class="row border-top border-light-subtle pt-3 pb-2">
                <div class="col">
                    <div class="alert alert-warning alert-dismissible fade show mb-0" role="alert">
                        <strong>Ongoing migration!</strong>
                        <!-- Little text with a few details about the maintenance -->
                        <small class="text-muted d-block">We're migrating to a new region! Any action done now (uploads,
                            comments, etc) will be lost until migration is completed! For any question please reach us
                            on <a href="https://discord.gg/5d5kVrEBzS" target="_blank">Discord</a>.</small>
                        <small class="text-muted d-block">Issue started on: 23/01/2025 10:00AM UTC/GMT+2</small>
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"
                                onclick={() => {maintenance = false}}></button>
                    </div>
                </div>
            </div>
        {/if}
        {@render children?.()}
    </div>

    <div class="row footer-container pt-3 pb-2">
        <div class="col">
            <div class="row">
                <div class="col text-center pb-1">
                    <p class="mb-1">Designed for <a class="link-purple text-decoration-none"
                                                    href="https://www.deviantart.com/dreamingdragons" target="_blank"
                                                    use:tooltip={{...tooltipConfig}} title="Official Website">DreamingDragons</a>
                        by:</p>
                    <a class="link-purple text-decoration-none" href="{designedByLink}" use:tooltip={{...tooltipConfig}}
                       title="Visit Developer" target="_blank">{designedBy}</a>
                    <!--<UserAvatar url="https://avatars.githubusercontent.com/u/159050591?v=4" username={designedBy} size="25px"/>-->
                </div>
            </div>
            <!-- Socials -->
            <div class="row mt-2">
                <div class="col">
                    <p class="fs-6 text-center mb-1">Follow us on:</p>
                    <p class="fs-4 text-center">
                        {#each socials as social}
                            <a href="{social.link}" target="_blank" aria-label="Find us on {social.name}"
                               use:tooltip={{...tooltipConfig}} title="Open {social.name}"
                               class="text-decoration-none text-light px-1"><i class="{social.icon}"></i></a>
                        {/each}
                    </p>
                </div>
            </div>
            <!-- Links to TOS and Privacy Policy -->
            <div class="row">
                <div class="col">
                    <p class="fs-6 text-center mb-md-0">For Terms of Service and Privacy Policy, please visit: <a
                            href="{tosLink}" target="_blank" use:tooltip={{...tooltipConfig}} title="Terms Of Service"
                            class="text-decoration-none text-light">TOS</a> and <a href="{privacyPolicyLink}"
                                                                                   target="_blank"
                                                                                   use:tooltip={{...tooltipConfig}}
                                                                                   data-bs-placement="top"
                                                                                   title="Privacy Policy"
                                                                                   class="text-decoration-none text-light">Privacy
                        Policy</a>.</p>
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
</div>

<style>
    :global(body::-webkit-scrollbar) {
        width: 10px;
        background: #1f002e;
    }

    :global(body::-webkit-scrollbar-thumb) {
        background: #370050;
        border-radius: 20px;
    }

    :global(body::-webkit-scrollbar-thumb:hover) {
        background: #5b0083;
    }

    :global(.row-horizontal::-webkit-scrollbar) {
        height: 8px;
    }

    :global(.row-horizontal::-webkit-scrollbar-track) {
        background: rgba(92, 0, 166, 0.25);
    }

    :global(.row-horizontal::-webkit-scrollbar-thumb) {
        background: linear-gradient(90deg, rgba(92, 0, 166, 0), rgba(92, 0, 166, 1) 15% 85%, rgba(92, 0, 166, 0));
        border-radius: 8px;
        cursor: pointer;
    }

    :global(.row-horizontal::-webkit-scrollbar-thumb:hover) {
        background: rgba(92, 0, 166, 1);
    }

    :global(a) {
        color: #c400ff;
        transition: all 0.12s ease-in-out;
    }

    :global(a:hover) {
        color: #ff00fb;
    }

    .offcanvas-body::-webkit-scrollbar {
        width: 10px;
        background: #1f002e;
    }

    .offcanvas-body::-webkit-scrollbar-thumb {
        background: #5b0083;
        border-radius: 20px;
    }

    .offcanvas-body::-webkit-scrollbar-thumb:hover {
        background: #6e00a1;
    }

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

    .upload-button {
        background: linear-gradient(270deg, #3d34c7, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 5s ease infinite, tranform 1s ease-in-out;
        transition: transform 0.12s ease-in-out;
    }

    .upload-button:hover {
        background: linear-gradient(230deg, #3d34c7, #5c00a6);
    }

    .upload-button:active {
        transform: scale(0.95);
    }

    .register-button {
        background: linear-gradient(270deg, #830054, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient-Register 5s ease infinite, tranform 1s ease-in-out;
        transition: transform 0.12s ease-in-out;
    }

    .register-button:hover {
        box-shadow: 0 0 0.6rem 0.25rem rgba(255, 0, 250, 0.75);
    }

    .register-button:active {
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

    .dropdown-menu {
        border: none;
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        background: linear-gradient(75deg, #0b0086, #410075);
        background-size: 150% 150%;
    }

    .dropdown-item {
        background-color: transparent;
    }

    .dropdown-item:hover {
        background-color: #5c00a6;
        border-radius: 0.25rem;
    }

    .dropdown-item:active {
        transition: all 0.12s ease-in-out;
        transform: scale(0.95);
    }

    .dropdown-item.active {
        background-color: #5c00a6;
        border-radius: 0.25rem;
    }

    .navbar-container {
        background: linear-gradient(180deg, rgba(65, 0, 117, 0.4), rgba(37, 0, 62, 0));
    }

    .footer-container {
        background: linear-gradient(0deg, rgba(65, 0, 117, 0.4), rgba(37, 0, 62, 0));
    }

    .offcanvas {
        background: linear-gradient(75deg, #0b0086, #410075);
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
    }

    .link-purple {
        color: #c400ff;
    }

    .link-purple:hover {
        color: #FF00FABF;
    }

    #notificationBell {
        cursor: pointer;
        font-size: 1.1rem;
    }

    .btn-transparent {
        background-color: transparent;
        color: #ffffff;
        border: none;
        transition: all 0.1s ease-in-out;
    }

    .btn-transparent:active {
        transform: scale(0.85);
    }

    .link-animated {
        color: #ffffff;
        animation: link-animation 2s ease-in-out infinite alternate;
        transition: all 0.12s ease-in-out;
    }

    .fa-upload, .fa-bell {
        transition: all 0.12s ease-in-out;
    }

    .fa-upload:hover, .fa-bell:hover {
        transform: scale(1.1);
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        background-color: #5c00a6;
        border-radius: 0.25rem;
    }

    .logo {
        transition: all 0.12s ease-in-out;
    }

    .logo:hover {
        transform: scale(1.05);
        filter: drop-shadow(0 0 0.75rem #c400ff);

    }

    .form-control:focus {
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
    }

    /* Link animation (small glowing text effect) */
    @keyframes link-animation {
        from {
            text-shadow: 0 0 0.1rem #c400ff, 0 0 0.1rem #c400ff, 0 0 0.1rem #c400ff;
        }
        to {
            text-shadow: 0 0 1rem #c400ff, 0 0 1rem #c400ff, 0 0 1rem #c400ff;
        }
    }

    @keyframes Gradient-Register {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    @keyframes Gradient {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
</style>
