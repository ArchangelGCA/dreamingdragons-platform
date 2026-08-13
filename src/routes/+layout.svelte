<script>
    import "$lib/css/style.css";
    import {invalidateAll, invalidate} from "$app/navigation";
    import {onDestroy, onMount, tick} from "svelte";
    import favicon from "$lib/images/favicon.webp";
    import {SvelteToast} from "$lib/components/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import Notification from "$lib/components/layout/Notification.svelte";
    import {tooltip} from "svelte-tooltip-gca";
    import {page} from '$app/state';
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import {deserialize} from "$app/forms";
    import Seo from "$lib/components/seo/Seo.svelte";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {initCrossTabCommunication} from "$lib/utils/navigationOptimizations.js";

    /** @type {{data: any, children?: import('svelte').Snippet}} */
    let {data, children} = $props();
    let {supabase, session, image_proxy, userData} = $state(data);
    // Initialize notifications independently to prevent hydration issues
    let notifications = $state(data.notifications || []);
    let hasInitializedNotifications = $state(false);
    
    $effect(() => {
        ({supabase, session, userData} = data);
        // Only update notifications on first load or if we haven't initialized them yet
        if (!hasInitializedNotifications && data.notifications && data.notifications.length > 0) {
            notifications = data.notifications;
            hasInitializedNotifications = true;
        }
    });

    let authStateChangeTimeout;
    
    $effect(() => {
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange(async (event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                // Debounce auth state changes to prevent multiple rapid invalidations
                clearTimeout(authStateChangeTimeout);
                authStateChangeTimeout = setTimeout(async () => {
                    // Only invalidate auth-dependent data instead of everything
                    await invalidate('supabase:auth');
                }, 300); // 300ms debounce
            }
        })
        return () => {
            subscription.unsubscribe();
            clearTimeout(authStateChangeTimeout);
        };
    });

    let latestNotificationTimestamp = $derived(notifications && notifications.length > 0 ? notifications[0].created_at : null);

    let intervalId;
    let searchTerm = $state('');
    const notifsUpdateInterval = 30000;
    let maintenance = $state(false);
    let isTabActive = $state(true);
    let isLeaderTab = $state(false);
    let crossTabComm;

    if (page.url.searchParams.has('q')) {
        searchTerm = page.url.searchParams.get('q');
    } else {
        searchTerm = '';
    }

    let mountAuthSubscription;
    
    onMount(() => {
        // Initialize cross-tab communication
        crossTabComm = initCrossTabCommunication();
        
        // Load notifications on client-side mount if they weren't loaded server-side
        if (session && (!notifications || notifications.length === 0) && !hasInitializedNotifications) {
            fetchNewNotifications().then(() => {
                hasInitializedNotifications = true;
            });
        } else if (notifications && notifications.length > 0) {
            hasInitializedNotifications = true;
        }

        // Tab coordination system to prevent multiple tabs from fetching notifications simultaneously
        const tabId = Math.random().toString(36);
        
        // Check if this tab should be the leader (handle notifications fetching)
        const checkLeaderTab = () => {
            const lastLeaderTime = parseInt(localStorage.getItem('notif_leader_time') || '0');
            const currentTime = Date.now();
            
            // If no leader tab active for 35 seconds, become the leader
            if (currentTime - lastLeaderTime > 35000) {
                isLeaderTab = true;
                localStorage.setItem('notif_leader_tab', tabId);
                localStorage.setItem('notif_leader_time', currentTime.toString());
            } else {
                isLeaderTab = localStorage.getItem('notif_leader_tab') === tabId;
            }
        };
        
        checkLeaderTab();
        
        // Handle tab visibility changes
        const handleVisibilityChange = () => {
            isTabActive = !document.hidden;
            if (isTabActive) {
                checkLeaderTab();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Update leader status periodically and fetch notifications only if leader
        intervalId = setInterval(async () => {
            if (isTabActive) {
                checkLeaderTab();
                if (isLeaderTab && session) {
                    localStorage.setItem('notif_leader_time', Date.now().toString());
                    await tick();
                    const newNotifications = await fetchNewNotifications();
                    // Broadcast notifications to other tabs
                    if (newNotifications && crossTabComm) {
                        crossTabComm.broadcastNotifications(notifications);
                    }
                }
            }
        }, notifsUpdateInterval);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (crossTabComm) {
                crossTabComm.close();
            }
            if (mountAuthSubscription) {
                mountAuthSubscription.unsubscribe();
            }
        }
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
    let allNotificationsLoaded = $state(false);

    let loading = $state(false);
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
            // Only append timestamp if it's valid
            if (latestNotificationTimestamp && latestNotificationTimestamp !== 'null' && latestNotificationTimestamp !== null) {
                formData.append('latestNotificationTimestamp', latestNotificationTimestamp);
            }

            try {
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
                            return notifications;
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        }
        return null;
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

<!--
    THESIS: DreamingDragons is a dragon-smith's foundry at night — the community feed is the forge
    floor where newly forged tales and art still glow with magenta heat and cool to royal-purple rest.
    It refuses the flat dark-feed default: heat is a process, not decoration.
    OWN-WORLD: charcoal foundry night, ember-orange→magenta heat ramp on fresh content fading to the
    hue-273 purple family at rest; ember flicker keyframes; iron/slag surface tones; single Comfortaa.
    STORY: visitors feel the foundry's life — fresh work is hot, liked work glows brightest, an empty
    rack invites the next strike. Creators forge; readers temper.
    FIRST VIEWPORT: ember-title plate over the newest-content rack (still-hot cards), then most-liked
    hot rack, then below-threshold cooled rows; search vent at top.
    FORM: assigned candidate 3, Ember-Forge, seed e0a09597.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
    verdict, and DESIGN.md
-->
<Seo/>

<SvelteToast/>

<div class="container-fluid bg-black bg-opacity-50" style="max-width: 100%; overflow-x: hidden">

    <!-- Start Navbar -->
    <div class="row navbar-container py-2 ember-heat-line">
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
            <div class="d-flex align-items-center justify-content-end gap-2 gap-md-3 flex-nowrap" use:autoAnimate>
                {#if notificationsCount !== 0}
                    <div class="position-relative flex-shrink-0">
                        <button class="btn border border-0 p-0 bg-transparent"
                                onclick={() => setNotificationsAsRead()} onkeydown={() => setNotificationsAsRead()}
                                aria-label="View notifications">
                            <i class="fas fa-bell" id="notificationBell" data-bs-toggle="offcanvas"
                               data-bs-target="#notifications" aria-controls="notifications"></i>
                        </button>
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge">{notificationsCount}</span>
                    </div>
                {:else}
                    <div class="flex-shrink-0">
                        <i class="fas fa-bell" id="notificationBell" data-bs-toggle="offcanvas"
                           data-bs-target="#notifications" aria-controls="notifications"></i>
                    </div>
                {/if}
                <!-- Upload -->
                {#if session}
                    <div class="flex-shrink-0">
                        <a class="link-animated rounded-3" href="/upload" aria-label="Upload"
                           data-sveltekit-preload-data="hover"
                           use:tooltip={{...tooltipConfig, content: 'Upload'}}>
                            <i class="fa-solid fa-upload"></i>
                        </a>
                    </div>
                {/if}
                <!-- Profile -->
                <div class="flex-shrink-0">
                    <div class="dropdown">
                        <button class="btn btn-transparent py-0 ps-0 pe-0" type="button" id="profileDropdown"
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
                                    <li><a class="dropdown-item" href="/profile"><i
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
                            <li>
                                <a class="dropdown-item {page.url.pathname.startsWith('/settings') ? 'active' : ''} {!session ? 'mb-1' : ''}"
                                   href="/settings" data-sveltekit-preload-data="hover"><i
                                        class="fa-solid fa-sliders border-end border-light-subtle pe-2"></i>
                                    Settings</a>
                            </li>
                            {#if session}
                                <li>
                                    <a class="dropdown-item upload-button rounded-3 py-2 my-1 {page.url.pathname.startsWith('/upload') ? 'active' : ''}"
                                       href="/upload" data-sveltekit-preload-data="hover"><i
                                            class="fa-solid fa-upload border-end border-light-subtle pe-2"></i>
                                        Upload</a></li>
                            {/if}
                            <li><a class="dropdown-item {page.url.pathname.startsWith('/updates') ? 'active' : ''}"
                                   href="/updates" data-sveltekit-preload-data="hover"><i class="fas fa-newspaper border-end border-light-subtle pe-2"></i>
                                Updates</a></li>
                            <li><a class="dropdown-item {page.url.pathname.startsWith('/faq') ? 'active' : ''}"
                                   href="/faq" data-sveltekit-preload-data="hover"><i class="fas fa-question-circle border-end border-light-subtle pe-2"></i>
                                FAQ</a></li>
                            <li><a class="dropdown-item" href="/rss.xml" target="_blank" rel="noopener noreferrer"><i
                                    class="fas fa-rss border-end border-light-subtle pe-2" style="color: #ff6600;"></i>
                                RSS Feed</a></li>
                            {#if session}
                                <li><a class="dropdown-item" href="/settings" data-sveltekit-preload-data="tap"><i
                                        class="fa-solid fa-arrow-right-from-bracket border-end border-light-subtle pe-2"></i>
                                    Logout</a></li>
                            {:else}
                                <li><a class="dropdown-item register-button rounded-3 py-2 my-1"
                                       href="/login?signup=true"><i
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

    <div class="offcanvas offcanvas-end notifications-offcanvas" tabindex="-1" id="notifications"
         aria-labelledby="notificationsTitle">
        <!-- Modern Header -->
        <div class="offcanvas-header notifications-header">
            <div class="d-flex align-items-center gap-2">
                <div class="notifications-header-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div>
                    <h5 class="offcanvas-title mb-0" id="notificationsTitle">Notifications</h5>
                    {#if notificationsCount > 0}
                        <span class="notifications-subtitle">{notificationsCount} unread</span>
                    {/if}
                </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                {#if notifications && notifications.length > 0 && notificationsCount > 0}
                    <button 
                        type="button" 
                        class="btn btn-sm notifications-mark-read"
                        onclick={setNotificationsAsRead}
                        title="Mark all as read"
                    >
                        <i class="fas fa-check-double"></i>
                    </button>
                {/if}
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
        </div>
        
        <!-- Notifications Body -->
        <div class="offcanvas-body notifications-body" onscroll={handleScroll}>
            {#if notifications && notifications !== null && notifications.length !== 0}
                <div class="notifications-list">
                    {#each notifications as notification (notification.id)}
                        <Notification {notification} {supabase} {session}/>
                    {/each}
                </div>
                
                <!-- Loading indicator for infinite scroll -->
                {#if loading}
                    <div class="notifications-loading">
                        <div class="spinner-border spinner-border-sm text-purple" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <span>Loading more...</span>
                    </div>
                {/if}
                
                <!-- End of notifications indicator -->
                {#if allNotificationsLoaded && notifications.length > notificationsRangeStep}
                    <div class="notifications-end">
                        <i class="fas fa-check-circle"></i>
                        <span>You've seen all notifications</span>
                    </div>
                {/if}
            {:else}
                <!-- Empty State -->
                <div class="notifications-empty">
                    <div class="notifications-empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <h6 class="notifications-empty-title">All caught up!</h6>
                    <p class="notifications-empty-text">No notifications yet. When you get interactions, they'll show up here.</p>
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
                                                    use:tooltip={{...tooltipConfig, content: 'Official Website'}}>DreamingDragons</a>
                        by:</p>
                    <a class="link-purple text-decoration-none" href="{designedByLink}" use:tooltip={{...tooltipConfig, content: 'Visit Developer'}}
                       target="_blank">{designedBy}</a>
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
                               use:tooltip={{...tooltipConfig, content: `Open ${social.name}`}}
                               class="text-decoration-none text-light px-1"><i class="{social.icon}"></i></a>
                        {/each}
                    </p>
                </div>
            </div>
            <!-- Links to TOS and Privacy Policy -->
            <div class="row">
                <div class="col">
                    <p class="fs-6 text-center mb-md-0">For Terms of Service and Privacy Policy, please visit: <a
                            href="{tosLink}" target="_blank" use:tooltip={{...tooltipConfig, content: 'Terms Of Service'}}
                            class="text-decoration-none text-light">TOS</a> and <a href="{privacyPolicyLink}"
                                                                                   target="_blank"
                                                                                   use:tooltip={{...tooltipConfig, content: 'Privacy Policy'}}
                                                                                   data-bs-placement="top"
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
        box-shadow: 0 0 0.5rem 0.1rem rgba(196, 0, 255, 0.5);
    }

    /* Forge vent: the search field reads as a furnace vent drawing in air */
    .navbar-container .form-control {
        background-color: rgba(10, 6, 16, 0.55);
        border: 1px solid rgba(178, 0, 232, 0.28);
    }

    .navbar-container .form-control::placeholder {
        color: rgba(255, 255, 255, 0.42);
    }

    .navbar-container .input-group:focus-within {
        box-shadow: 0 0 0.8rem 0.2rem rgba(196, 0, 255, 0.35);
        border-radius: 1rem;
    }

    .dropdown-menu {
        border: 1px solid rgba(196, 0, 255, 0.18);
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
        background:
            radial-gradient(240px 90px at 50% 0%, rgba(255, 123, 43, 0.08) 0%, transparent 70%),
            linear-gradient(75deg, #0b0086, #410075);
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
        background:
            radial-gradient(700px 120px at 50% -20%, rgba(255, 123, 43, 0.12) 0%, transparent 70%),
            linear-gradient(180deg, rgba(65, 0, 117, 0.55), rgba(37, 0, 62, 0));
    }

    .footer-container {
        background:
            radial-gradient(700px 140px at 50% 120%, rgba(255, 123, 43, 0.10) 0%, transparent 70%),
            linear-gradient(0deg, rgba(65, 0, 117, 0.55), rgba(37, 0, 62, 0));
    }

    .offcanvas {
        background:
            radial-gradient(320px 110px at 50% 0%, rgba(255, 123, 43, 0.10) 0%, transparent 70%),
            linear-gradient(75deg, #0b0086, #410075);
        box-shadow: 0 0 0.6rem 0.25rem rgba(92, 0, 166, 0.75);
    }

    /* Modern Notifications Offcanvas Styles */
    .notifications-offcanvas {
        border-radius: 1rem 0 0 1rem;
        border: none;
        max-width: 400px;
        width: 100%;
    }

    .notifications-header {
        background: linear-gradient(135deg, rgba(92, 0, 166, 0.4), rgba(11, 0, 134, 0.6));
        border-bottom: 1px solid rgba(196, 0, 255, 0.2);
        padding: 1rem 1.25rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .notifications-header-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(196, 0, 255, 0.5), rgba(92, 0, 166, 0.8));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        color: #fff;
    }

    .notifications-subtitle {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .notifications-mark-read {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.8);
        border-radius: 0.5rem;
        padding: 0.375rem 0.625rem;
        transition: all 0.2s ease;
    }

    .notifications-mark-read:hover {
        background: rgba(196, 0, 255, 0.3);
        border-color: rgba(196, 0, 255, 0.5);
        color: #fff;
    }

    .notifications-body {
        padding: 1rem;
        background: linear-gradient(180deg, rgba(11, 0, 134, 0.3), transparent 50%);
    }

    .notifications-list {
        display: flex;
        flex-direction: column;
    }

    .notifications-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.85rem;
    }

    .notifications-loading .spinner-border {
        width: 1rem;
        height: 1rem;
    }

    .text-purple {
        color: #c400ff !important;
    }

    .notifications-end {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.8rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 0.5rem;
    }

    .notifications-end i {
        color: rgba(25, 135, 84, 0.7);
    }

    .notifications-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1.5rem;
        height: 100%;
        min-height: 300px;
    }

    .notifications-empty-icon {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(92, 0, 166, 0.3), rgba(11, 0, 134, 0.4));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 1.5rem;
    }

    .notifications-empty-title {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    .notifications-empty-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
        margin: 0;
        max-width: 250px;
    }

    /* Mobile responsiveness for notifications */
    @media (max-width: 576px) {
        .notifications-offcanvas {
            max-width: 100%;
            border-radius: 1rem 1rem 0 0;
        }

        .notifications-header {
            padding: 0.875rem 1rem;
        }

        .notifications-header-icon {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 0.9rem;
        }

        .notifications-body {
            padding: 0.75rem;
        }

        .notifications-empty {
            padding: 2rem 1rem;
            min-height: 250px;
        }

        .notifications-empty-icon {
            width: 4rem;
            height: 4rem;
            font-size: 1.5rem;
        }
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

    .notification-badge {
        font-size: 0.65rem;
        min-width: 1rem;
        padding: 0.15rem 0.35rem;
    }

    @media (max-width: 576px) {
        #notificationBell {
            font-size: 1rem;
        }
        
        .notification-badge {
            font-size: 0.55rem;
            min-width: 0.85rem;
            padding: 0.1rem 0.25rem;
        }
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
        padding: 0.25rem 0.5rem;
        transition: all 0.12s ease-in-out;
        animation: glow-breathing 2.5s ease-in-out infinite;
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

    .link-animated:hover {
        animation: none;
        box-shadow: 0 0 0.8rem 0.3rem rgba(196, 0, 255, 0.8);
        background-color: rgba(92, 0, 166, 0.5);
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

    /* Link animation (smooth glowing breathing effect for icons) */
    @keyframes glow-breathing {
        0%, 100% {
            box-shadow: 0 0 0.2rem 0.1rem rgba(196, 0, 255, 0.3);
        }
        50% {
            box-shadow: 0 0 0.6rem 0.25rem rgba(196, 0, 255, 0.6);
        }
    }

    /* Deprecated: Old link-animation that caused visual glitches */
    /* @keyframes link-animation {
        from {
            text-shadow: 0 0 0.1rem #c400ff, 0 0 0.1rem #c400ff, 0 0 0.1rem #c400ff;
        }
        to {
            text-shadow: 0 0 1rem #c400ff, 0 0 1rem #c400ff, 0 0 1rem #c400ff;
        }
    } */

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
