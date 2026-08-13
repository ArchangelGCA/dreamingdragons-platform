<script>
    import {tooltip} from "$lib/utils/tooltip.js";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {PUBLIC_DEFAULT_USERNAME} from '$env/static/public';
    import autoAnimate from '@formkit/auto-animate';
    import {deserialize} from "$app/forms";
    import {invalidateAll, onNavigate} from "$app/navigation";
    import {toast} from "$lib/components/svelte-toast";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import Masonry from "$lib/components/sveltebricks/Masonry.svelte";
    import ContentMasonry from "$lib/components/pages/ContentMasonry.svelte";
    import ProfileMasonry from "$lib/components/profile/ProfileMasonry.svelte";
    import ShareButton from "$lib/components/layout/ShareButton.svelte";
    import RSSButton from "$lib/components/layout/RSSButton.svelte";
    import { createProfilePath } from '$lib/utils/slugs.js';

    /** @type {{data: any}} */
    let {data} = $props();
    let {
        image_proxy,
        profile,
        likedBooks,
        total_likes,
        total_followers,
        isFollowing,
        isOwner,
        session,
        id
    } = $state(data);

    onNavigate(() => {
        resetVariables();
    })

    $effect(() => {
        ({profile, likedBooks, total_likes, total_followers, isFollowing, isOwner, session, id} = data)
    });

    let avatarFound = $state(true);
    let booksStart = 0;
    let booksEnd = 40;
    let loadStep = 20;
    let likedBooksStart = 0;
    let likedBooksEnd = 40;
    let isFetching = false;
    let allBooksLoaded = false;
    let allLikedBooksLoaded = false;
    let followActionActive = false;
    let show = $state('home');
    let width = $state(0), height = $state(0);
    let [minColWidth, gap] = [350, 10];

    let y = $state();

    // Callback function to handle book updates from ContentMasonry
    function handleBookUpdate(targetBook, updates) {
        if (targetBook.book) {
            targetBook.book.likes = updates.likes;
            targetBook.book.is_liked = updates.is_liked;
        } else {
            targetBook.likes = updates.likes;
            targetBook.is_liked = updates.is_liked;
        }
    }

    async function resetVariables() {
        avatarFound = true;
        show = 'home';
        booksStart = 0;
        booksEnd = 40;
        likedBooksStart = 0;
        likedBooksEnd = 40;
        isFetching = false;
        allBooksLoaded = false;
        allLikedBooksLoaded = false;
        if (profile.book.length < 40) allBooksLoaded = true;
        if (likedBooks.length < 40) allLikedBooksLoaded = true;
    }

    async function handleFollow(e) {
        e.preventDefault();

        if (followActionActive) return;
        followActionActive = true;

        isFollowing = !isFollowing;

        const formData = new FormData();
        formData.append('profileId', profile.id);

        const response = await fetch('?/follow', {
            method: 'POST',
            body: formData,
        });

        const result = deserialize(await response.text());
        await invalidateAll(); // Not sure if it's actually necessary.
        if (result.type === 'success') {
            if (result.data.status === 200) {
                if (result.data.body.follow) {
                    isFollowing = true;
                    toast.push('➕ You\'re now following ' + profile.username + "!", {
                        theme: {
                            '--toastBackground': '#8b00b6',
                            '--toastColor': '#fff'
                        }
                    });
                } else {
                    isFollowing = false;
                    toast.push('➖ You\'ve unfollowed ' + profile.username + "!", {
                        theme: {
                            '--toastBackground': '#7b2eff',
                            '--toastColor': '#fff'
                        }
                    });
                }
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else {
            isFollowing = !isFollowing;
            toast.push('Error: ' + result.data.body.message, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        followActionActive = false;
    }

    async function copyToClipboardId() {
        navigator.clipboard.writeText(profile.id).then(() => {
            toast.push('📋 Copied to clipboard!', {
                theme: {
                    '--toastBackground': '#7b2eff',
                    '--toastColor': '#fff'
                }
            });
        }).catch(err => {
            toast.push('Error: ' + err, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        });
    }

    async function loadMoreLikedBooks() {
        if (isFetching) return;
        isFetching = true;

        likedBooksStart = likedBooksEnd;
        likedBooksEnd += loadStep;

        const formData = new FormData();
        formData.append('profileId', profile.id);
        formData.append('startRange', likedBooksStart);
        formData.append('endRange', likedBooksEnd);

        const response = await fetch('?/books_liked', {
            method: 'POST',
            body: formData,
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                if (result.data.body.books.length === 0) {
                    allLikedBooksLoaded = true;
                    toast.push('🎉 All favourites loaded!', {
                        theme: {
                            '--toastBackground': '#7b2eff',
                            '--toastColor': '#fff'
                        }
                    });
                } else {
                    for (let i = 0; i < result.data.body.books.length; i++) {
                        if (!likedBooks.find(book => book.book_id === result.data.body.books[i].book_id)) {
                            likedBooks = [...likedBooks, result.data.body.books[i]];
                        }
                    }
                }
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else {
            toast.push('Error: ' + result.data.body.message, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        isFetching = false;
    }

    async function loadMoreBooks() {
        if (isFetching) return;
        isFetching = true;

        booksStart = booksEnd;
        booksEnd += loadStep;

        const formData = new FormData();
        formData.append('profileId', profile.id);
        formData.append('startRange', booksStart);
        formData.append('endRange', booksEnd);

        const response = await fetch('?/books', {
            method: 'POST',
            body: formData,
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                if (result.data.body.books.length !== 0) {
                    for (let i = 0; i < result.data.body.books.length; i++) {
                        if (!profile.book.find(book => book.id === result.data.body.books[i].id)) {
                            profile.book = [...profile.book, result.data.body.books[i]];
                        }
                    }
                } else {
                    allBooksLoaded = true;
                }
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else {
            toast.push('Error: ' + result.data.body.message, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        isFetching = false;
    }

    function handleScroll(event) {
        //const target = event.target; // OLD TARGET (Element)
        const target = event.target.body; // NEW TARGET (Document.body)
        if (y >= target.clientHeight / 2) {
            if (show === 'favourites' && !allLikedBooksLoaded) loadMoreLikedBooks();
            if (show === 'home' && !allBooksLoaded) loadMoreBooks();
        }
    }

</script>

<svelte:head>
    {#if profile && profile.id}
        <link rel="alternate" type="application/rss+xml" title="{profile.username}'s Activity Feed"
              href="/rss/profile/{profile.id}.xml"/>
    {/if}
</svelte:head>

<svelte:window onscroll={handleScroll} bind:scrollY={y}/>

<div class="container-fluid px-0" style="min-height: 71vh; overflow-x: hidden; overflow-y: hidden" use:autoAnimate>
    <!-- Profile not found error -->
    {#if !profile || profile.length === 0}
        <div class="row justify-content-center">
            <div class="col-12 text-center">
                <p class="h1 mt-4">Profile not found</p>
                <i class="fa-solid fa-exclamation-triangle fa-5x text-warning"></i>
            </div>
        </div>
    {:else} <!-- Profile found -->
        <div class="row justify-content-center">
            <div class="col-12">
                {#if profile.avatar_url === ''}
                    <div class="rounded-bottom-5 position-relative"
                         style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                        <!-- Share and RSS buttons in top right corner -->
                        <div class="position-absolute top-0 end-0 p-3">
                            <div class="d-flex gap-2">
                                <ShareButton
                                        url={typeof window !== 'undefined' ? window.location.href : `https://tales.archangelgca.eu${createProfilePath(profile.username, profile.id)}`}
                                        title="{profile.username}'s Profile"
                                        description="Check out {profile.username}'s amazing content on DreamingDragons!"
                                        compact={true}
                                />
                                <RSSButton
                                        rssUrl="/rss/profile/{profile.id}.xml"
                                        label="RSS"
                                        compact={true}
                                />
                            </div>
                        </div>
                        <div class="row justify-content-center align-items-end" style="height: 100%;">
                            <div class="col-auto">
                            </div>
                        </div>
                    </div>
                {:else if profile.avatar_url === '' && avatarFound}
                    <div class="row text-center justify-content-center mt-3">
                        <div class="col-auto">
                            <div class="spinner-border text-light align-self-center" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                {:else}
                    {@const backgroundImageUrl = profile.cover_url ? profile.cover_url : profile.avatar_url}
                    {@const
                        optimizedBackgroundUrl = image_proxy && backgroundImageUrl && !backgroundImageUrl.startsWith(image_proxy) ? image_proxy + backgroundImageUrl : backgroundImageUrl}
                    <div class="rounded-bottom-5 shadow-sm position-relative"
                         style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url({optimizedBackgroundUrl}?quality=80), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                        <!-- Share and RSS buttons in top right corner -->
                        <div class="position-absolute top-0 end-0 p-3">
                            <div class="d-flex gap-2">
                                <ShareButton
                                        url={typeof window !== 'undefined' ? window.location.href : `https://tales.archangelgca.eu${createProfilePath(profile.username, profile.id)}`}
                                        title="{profile.username}'s Profile"
                                        description="Check out {profile.username}'s amazing content on DreamingDragons!"
                                        compact={true}
                                />
                                <RSSButton
                                        rssUrl="/rss/profile/{profile.id}.xml"
                                        label="RSS"
                                        compact={true}
                                />
                            </div>
                        </div>
                        <div class="row justify-content-center align-items-end" style="height: 100%;">
                            <div class="col-auto">
                                {#if profile.avatar_url}
                                    {@const
                                        optimizedAvatarUrl = image_proxy && profile.avatar_url && !profile.avatar_url.startsWith(image_proxy) ? image_proxy + profile.avatar_url : profile.avatar_url}
                                    <img src="{optimizedAvatarUrl}?width=600&quality=80" alt="{profile.username}"
                                         loading="lazy"
                                         class="rounded-circle bg-dark shadow" width="150px" height="150px"
                                         id="profileIcon"
                                         onload={() => avatarFound = true} onerror={() => avatarFound = false}>
                                {:else}
                                    <img src="/favicon.webp" alt="{profile.username}" loading="lazy"
                                         class="rounded-circle bg-dark shadow" width="150px" height="150px"
                                         id="profileIcon"
                                         onload={() => avatarFound = true} onerror={() => avatarFound = false}>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
                {#if !avatarFound}
                    <div class="row justify-content-center mt-3">
                        <div class="col-auto">
                            <div class="alert alert-danger" role="alert">
                                <i class="fa-solid fa-exclamation-triangle"></i> Avatar not found, please upload one
                                from your profile <a class="link-light" href="/settings">Settings</a>.
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <div class="row justify-content-center mt-3">
            <div class="col text-center">
                {#if profile.username.startsWith(PUBLIC_DEFAULT_USERNAME)}
                    <span class="h1 mt-2 mb-1 text-warning-emphasis">Please update your <a href="/settings">profile</a></span>
                {:else}
                    <span class="h1 mt-2 mb-1"><button type="button" class="btn-username" onclick={copyToClipboardId}
                                                       use:tooltip={{...tooltipConfig}}
                                                       title="Click to copy profile ID!">{profile.username}</button> <a
                            class="link-purple"
                            href="{profile.website ? profile.website : ''}"
                            target="_blank"
                            data-tooltip="{profile.website ? '⚠️ External link - Careful!' : '🔗 Profile'}"
                            aria-label="Open profile linked website."
                    ><i
                            class="fa-solid fa-external-link fa-2xs"></i></a></span>
                {/if}
            </div>
        </div>
        <div class="row justify-content-center mx-0 mt-3">
            <div class="col-12 bg-light-subtle bg-info-profile rounded-4">
                <div class="row dropdown justify-content-center align-items-center text-center py-3">
                    <div class="col-4 col-md-3 align-items-center" id="followers"
                         aria-expanded="false">
                        <div class="row justify-content-center d-flex align-items-center" data-bs-toggle="dropdown"
                             use:tooltip={{...tooltipConfig}} title="Followers">
                            <div class="col-auto d-flex align-items-center pe-0">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="col-auto mt-1">
                                <span class="">{total_followers}</span>
                            </div>
                        </div>
                        <div class="dropdown-menu ms-md-5 py-1 border-0 followers-container"
                             aria-labelledby="followers">
                            {#if !profile.followers || profile.followers.length === 0}
                                <span class="dropdown-item rounded-3">No followers yet</span>
                            {:else}
                                {#each profile.followers as follower (follower.follower_id)}
                                    <span>
                                        <a class="dropdown-item" href={createProfilePath(follower.profiles.username, follower.follower_id)}>
                                            <UserAvatarNavbar url={follower.profiles.avatar_url}
                                                              username={follower.profiles.username} {image_proxy}
                                                              size="25px" classes="me-2"/>
                                            <span class="link-light text-decoration-none h-100">{follower.profiles.username}</span>
                                        </a>
                                    </span>

                                {/each}
                            {/if}
                        </div>
                    </div>
                    <div class="col-4 col-md-3">
                        <div class="row justify-content-center d-flex align-items-center"
                             use:tooltip={{...tooltipConfig}} title="Total likes">
                            <div class="col-auto d-flex align-items-center pe-0">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="col-auto mt-1">
                                <span class="">{total_likes}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-4 col-md-3">
                        <div class="row justify-content-center d-flex align-items-center"
                             data-tooltip="Joined: {new Date(profile.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}"
                        >
                            <div class="col-auto d-flex align-items-center pe-0">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="col-auto mt-1">
                                <span class="h6">{new Date(profile.created_at).getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-3 px-4">
                        <div class="row justify-content-center">
                            <div class="col-11 col-md-auto px-0">
                                <button class="btn btn-outline-light w-100 mt-3 mt-md-0 shadow" onclick={handleFollow}
                                        data-tooltip="{isFollowing ? '➖ Unfollow' : '➕ Follow'}">
                                    <i class="fas {isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                                    <span class="ms-1">{isFollowing ? 'Unfollow' : 'Follow'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Options to view gallery or favourites -->
        <div class="row mt-3 justify-content-center text-center">
            <div class="col-auto">
                <button class="btn btn-view-options rounded-3 px-3 py-2 {(show === 'home') ? 'active' : ''}"
                        onclick={() => show = 'home'}
                        data-tooltip="{profile.username + ' Home 🏠'}">Home
                </button>
            </div>
            {#if profile.show_favourites || isOwner}
                <div class="col-auto">
                    <button class="btn btn-view-options rounded-3 px-3 py-2 {(show === 'favourites') ? 'active' : ''}"
                            onclick={() => show = 'favourites'}
                            data-tooltip="{isOwner ? 'Owner can always see his favs 😉' : (profile.username + ' Favs 🩷')}"
                    >
                        Favourites
                    </button>
                </div>
            {:else}
                <div class="col-auto">
                    <button class="btn btn-view-options rounded-3 px-3 py-2 disabled">Favourites</button>
                </div>
            {/if}
            <div class="col-auto">
                <button class="btn btn-view-options rounded-3 px-3 py-2 {(show === 'galleries') ? 'active' : ''}"
                        onclick={() => show = 'galleries'}
                        data-tooltip="{profile.username + ' Galleries 🖼️'}">Galleries
                </button>
            </div>
        </div>
        <!-- Content section -->
        <div class="row mb-4 mt-3 justify-content-evely gy-3 mx-auto" use:autoAnimate>
            {#if show === "home"}
                {#if !profile.book || profile.book.length === 0}
                    <div class="col mt-4 text-center">
                        <p class="h1">Looks a bit empty here... 😶‍🌫️!</p>
                        <i class="fa-solid fa-bookmark fa-5x text-warning" use:autoAnimate></i>
                    </div>
                {:else}
                    <div class="col-12 mt-0">
                        <Masonry
                                items={profile.book}
                                {minColWidth}
                                {gap}
                                animate={true}

                                bind:masonryWidth={width}
                                bind:masonryHeight={height}
                        >
                            {#snippet children({item})}
                                <ProfileMasonry content={item} {image_proxy}/>
                            {/snippet}
                        </Masonry>
                    </div>
                {/if}
            {/if}
            {#if show === "favourites"}
                {#if !likedBooks || likedBooks.length === 0}
                    <div class="col mt-4 text-center">
                        <p class="h1">Looks a bit empty here... 😶‍🌫️!</p>
                        <i class="fa-solid fa-bookmark fa-5x text-warning" use:autoAnimate></i>
                    </div>
                {:else}
                    <div class="col-12 mt-0 ps-0">
                        <Masonry
                                items={likedBooks}
                                idKey="book_id"
                                {minColWidth}
                                {gap}
                                animate={true}

                                bind:width
                                bind:height
                        >
                            {#snippet children({item})}
                                <ContentMasonry book={item.book} {image_proxy} {session} onBookUpdate={handleBookUpdate}/>
                            {/snippet}
                        </Masonry>
                    </div>
                {/if}
            {/if}
            {#if show === "galleries"}
                {#if !profile.gallery || profile.gallery.length === 0}
                    <div class="col mt-4 text-center">
                        <p class="h1">No galleries yet... 🖼️</p>
                        {#if isOwner}
                            <a href="/settings/galleries" class="btn btn-purple mt-2">Create one!</a>
                        {/if}
                    </div>
                {:else}
                    <div class="col-12">
                        <div class="galleries-grid row g-3 g-md-4">
                            {#each profile.gallery as gallery (gallery.id)}
                                <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
                                    <div class="gallery-card-profile h-100">
                                        <a href={createProfilePath(profile.username, profile.id) + '/gallery/' + gallery.id}
                                           class="gallery-card-link d-flex flex-column h-100">
                                            <div class="gallery-preview-profile flex-shrink-0">
                                                {#if gallery.gallery_books.length > 0}
                                                    <div class="preview-stack">
                                                        {#each gallery.gallery_books.slice(0, 4) as gb, i}
                                                            {#if !gb.book.cover_url}
                                                                <img
                                                                        src="/favicon.webp"
                                                                        alt="Tale cover"
                                                                        class="preview-book"
                                                                        style="z-index: {4-i}; transform: translateX({i * -6}px) translateY({i * -3}px) rotate({(i % 2 === 0 ? -1 : 1) * (i + 1) * 2}deg)"
                                                                />
                                                            {:else}
                                                                {@const
                                                                    optimizedSrc = image_proxy && !gb.book.cover_url.startsWith(image_proxy) ? image_proxy + gb.book.cover_url : gb.book.cover_url}
                                                                <img
                                                                        src={optimizedSrc + '?width=300&quality=80'}
                                                                        alt="Tale cover"
                                                                        class="preview-book"
                                                                        style="z-index: {4-i}; transform: translateX({i * -6}px) translateY({i * -3}px) rotate({(i % 2 === 0 ? -1 : 1) * (i + 1) * 2}deg)"
                                                                        loading="lazy"
                                                                />
                                                            {/if}
                                                        {/each}
                                                    </div>
                                                {:else}
                                                    <div class="preview-empty-profile">
                                                        <i class="fas fa-images"></i>
                                                    </div>
                                                {/if}
                                            </div>
                                            <div class="gallery-info-profile flex-grow-1 d-flex flex-column">
                                                <h5 class="gallery-title-profile">
                                                    {gallery.name}
                                                </h5>
                                                <p class="gallery-description-profile flex-grow-1">{gallery.description || 'No description'}</p>
                                                <div class="gallery-meta-profile mt-auto">
                                                    <span class="book-count">
                                                        <i class="fas fa-book me-2"></i>
                                                        <span class="d-none d-sm-inline">{gallery.gallery_books.length} {gallery.gallery_books.length === 1 ? 'tale' : 'tales'}</span>
                                                        <span class="d-sm-none">{gallery.gallery_books.length}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                        {#if session && gallery.owner_id === session.user.id}
                                            <div class="gallery-edit-overlay">
                                                <a
                                                        href="/settings/galleries?gallery={gallery.id}"
                                                        class="btn-edit-gallery"
                                                        use:tooltip={{...tooltipConfig}}
                                                        title="Edit Gallery"
                                                        aria-label="Edit Gallery"
                                                        onclick={(e) => e.stopPropagation()}
                                                >
                                                    <i class="fas fa-edit"></i>
                                                </a>
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    {/if}
</div>

<style>
    .fa-user, .fa-heart, .fa-calendar-alt {
        font-size: 1.6rem;
    }

    .bg-info-profile {
        background: linear-gradient(90deg, rgba(128, 0, 128, 0.5) 0%, rgba(75, 0, 130, 0.5) 50%, rgba(60, 0, 104, 0.5) 100%);
    }

    .dropdown-menu {
        background-color: rgba(60, 0, 104, 0.9);
    }

    .dropdown-item:hover {
        background-color: rgba(43, 0, 73, 0.95);
    }

    .dropdown-item:active {
        background-color: rgba(43, 0, 73, 0.95);
    }

    .dropdown-item:focus {
        background-color: rgba(43, 0, 73, 0.95);
    }

    .link-purple {
        color: #7d00dd;
        transition: color 0.3s;
    }

    .link-purple:hover {
        color: #9100ff;
    }

    #followers {
        cursor: pointer;
    }

    .btn-view-options {
        background-color: transparent;
        color: #fff;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .btn-view-options:hover {
        background-color: #7d00dd;
        color: #fff;
        border: none;
        border-radius: 5px;
        transition: background-color 0.3s;
    }

    .btn-view-options.active {
        background-color: #7d00dd;
        color: #fff;
        border: none;
        border-radius: 5px;
        transition: all 0.3s;
        box-shadow: 0 0 0.25rem 0.15rem rgba(125, 0, 221, 0.75);
    }

    .btn-view-options:active {
        background-color: #7d00dd;
        color: #fff;
        border: none;
        border-radius: 5px;
        transition: all 0.3s;
        box-shadow: 0 0 0.25rem 0.15rem rgba(125, 0, 221, 0.75);
    }

    .btn-username {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        color: #fff;
        text-decoration: none;
        transition: color 0.15s;
    }

    .btn-username:hover {
        color: #7d00dd;
    }

    /* Modern Gallery Cards for Profile */
    .galleries-grid {
        margin-top: 1rem;
    }

    .gallery-card-profile {
        background: linear-gradient(135deg,
        hsla(var(--primary-hue), 20%, 15%, 0.8),
        hsla(var(--primary-hue), 15%, 20%, 0.6)
        );
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.3);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        position: relative;
    }

    .gallery-card-profile::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg,
        hsla(var(--primary-hue), 60%, 50%, 0.1) 0%,
        transparent 50%,
        hsla(var(--primary-hue), 40%, 60%, 0.05) 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }

    .gallery-card-profile:hover::before {
        opacity: 1;
    }

    .gallery-card-profile:hover {
        transform: translateY(-4px);
        border-color: hsla(var(--primary-hue), 60%, 60%, 0.6);
        box-shadow: 0 12px 24px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2);
    }

    .gallery-preview-profile {
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(45deg,
        hsla(var(--primary-hue), 20%, 10%, 0.8),
        hsla(var(--primary-hue), 15%, 15%, 0.6)
        );
        position: relative;
        overflow: hidden;
    }

    .preview-stack {
        position: relative;
        width: 110px;
        height: 140px;
    }

    .preview-book {
        position: absolute;
        width: 72px;
        height: 108px;
        object-fit: cover;
        border-radius: 6px;
        border: 2px solid hsla(var(--primary-hue), 30%, 50%, 0.3);
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .gallery-card-profile:hover .preview-book {
        transform: translateX(0) translateY(0) rotate(0deg) !important;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .preview-empty-profile {
        width: 72px;
        height: 108px;
        background: hsla(var(--primary-hue), 15%, 25%, 0.6);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed hsla(var(--primary-hue), 30%, 50%, 0.4);
    }

    .preview-empty-profile i {
        font-size: 1.8rem;
        color: hsla(var(--primary-hue), 30%, 60%, 0.6);
    }

    .gallery-info-profile {
        padding: 1.25rem;
        position: relative;
        z-index: 2;
    }

    .gallery-title-profile {
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
        line-height: 1.3;
    }

    .gallery-description-profile {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        font-size: 0.85rem;
        line-height: 1.4;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .gallery-meta-profile {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .book-count {
        color: hsla(var(--primary-hue), 50%, 70%, 0.9);
        font-size: 0.8rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        background: hsla(var(--primary-hue), 30%, 25%, 0.4);
        padding: 0.4rem 0.8rem;
        border-radius: 16px;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.3);
    }

    .gallery-card-link {
        color: inherit;
        text-decoration: none;
        display: block;
        width: 100%;
        height: 100%;
    }

    .gallery-card-link:hover {
        color: inherit;
        text-decoration: none;
    }

    .gallery-edit-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 10;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .gallery-card-profile:hover .gallery-edit-overlay {
        opacity: 1;
    }

    .btn-edit-gallery {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-size: 0.8rem;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .btn-edit-gallery:hover {
        background: linear-gradient(135deg,
        hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)),
        hsl(290, 100%, 70%)
        );
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        color: white;
        text-decoration: none;
    }

    /* Mobile-First Responsive Design */
    @media (max-width: 575.98px) {
        .gallery-preview-profile {
            height: 160px;
        }

        .preview-stack {
            width: 90px;
            height: 120px;
        }

        .preview-book {
            width: 60px;
            height: 90px;
        }

        .preview-empty-profile {
            width: 60px;
            height: 90px;
        }

        .preview-empty-profile i {
            font-size: 1.5rem;
        }

        .gallery-info-profile {
            padding: 1rem;
        }

        .gallery-title-profile {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .gallery-description-profile {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
            -webkit-line-clamp: 1;
            line-clamp: 1;
        }

        .book-count {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
        }

        .gallery-card-profile:hover {
            transform: translateY(-2px);
        }

        .btn-edit-gallery {
            width: 32px;
            height: 32px;
            font-size: 0.7rem;
            top: 6px;
            right: 6px;
        }

        /* Reduce hover effects on touch devices */
        @media (hover: none) and (pointer: coarse) {
            .gallery-card-profile:hover {
                transform: none;
            }

            .gallery-card-profile:hover .preview-book {
                transform: translateX(var(--transform-x)) translateY(var(--transform-y)) rotate(var(--transform-rotate)) !important;
            }
        }
    }

    /* Tablet optimizations */
    @media (min-width: 576px) and (max-width: 767.98px) {
        .gallery-preview-profile {
            height: 170px;
        }

        .preview-stack {
            width: 100px;
            height: 130px;
        }

        .preview-book {
            width: 68px;
            height: 102px;
        }

        .preview-empty-profile {
            width: 68px;
            height: 102px;
        }

        .gallery-info-profile {
            padding: 1.125rem;
        }

        .gallery-title-profile {
            font-size: 1.05rem;
        }

        .gallery-description-profile {
            font-size: 0.825rem;
        }
    }

    /* Desktop and larger optimizations */
    @media (min-width: 1200px) {
        .gallery-preview-profile {
            height: 200px;
        }

        .preview-stack {
            width: 120px;
            height: 150px;
        }

        .preview-book {
            width: 80px;
            height: 120px;
        }

        .preview-empty-profile {
            width: 80px;
            height: 120px;
        }

        .preview-empty-profile i {
            font-size: 2rem;
        }

        .gallery-info-profile {
            padding: 1.5rem;
        }

        .gallery-title-profile {
            font-size: 1.2rem;
        }

        .gallery-description-profile {
            font-size: 0.9rem;
            -webkit-line-clamp: 3;
            line-clamp: 3;
        }
    }
</style>