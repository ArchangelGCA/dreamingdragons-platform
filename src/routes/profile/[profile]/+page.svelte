<script>
    import {tooltip} from "@svelte-plugins/tooltips";
    import {PUBLIC_DEFAULT_USERNAME} from '$env/static/public';
    import autoAnimate from '@formkit/auto-animate';
    import {deserialize} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";
    import Seo from "sk-seo";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import Masonry from "svelte-bricks";
    import ContentMasonry from "$lib/components/pages/ContentMasonry.svelte";
    import ProfileMasonry from "$lib/components/profile/ProfileMasonry.svelte";

    export let data;
    const {tooltipConfig} = data;
    $: ({image_proxy, profile, likedBooks, total_likes, total_followers, isFollowing, isOwner, id} = data);

    let avatarFound = true;
    let booksStart = 0;
    let booksEnd = 40;
    let loadStep = 20;
    let likedBooksStart = 0;
    let likedBooksEnd = 40;
    let isFetching = false;
    let allBooksLoaded = false;
    let allLikedBooksLoaded = false;
    let followActionActive = false;
    let show = 'home';
    let width, height;

    $: if (id) {
        resetVariables();
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

    async function handleVisit(e) {
        e.preventDefault();
        window.location.href = e.target.href;
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
        const target = event.target;
        if ((target.scrollHeight - target.scrollTop <= target.clientHeight + (target.clientHeight / 0.2))) {
            if (show === 'favourites' && !allLikedBooksLoaded) loadMoreLikedBooks();
            if (show === 'home' && !allBooksLoaded) loadMoreBooks();
        }
    }
</script>

<Seo
        title="{profile ? profile.username : 'Profile'} - Profile"
        description="Profile of {profile ? profile.username : 'Profile'} on RiTF, Roses in The Flames."
        siteName="Roses in The Flames - Platform"
        imageURL="{profile.avatar_url ? profile.avatar_url : 'https://tales.rosesintheflames.com/favicon.webp'}"
        logo="{profile.avatar_url ? profile.avatar_url : 'https://tales.rosesintheflames.com/favicon.webp'}"
        author="ArchangelGCA"
        name="{profile.username}"
        schemaOrg="true"
        twitter="true"
        index="true"
/>

<div class="container-fluid px-0" style="min-height: 71vh">
    {#if !profile || profile.length === 0}
        <div class="row justify-content-center">
            <div class="col-12 text-center">
                <p class="h1 mt-4">Profile not found</p>
                <i class="fa-solid fa-exclamation-triangle fa-5x text-warning" use:autoAnimate></i>
            </div>
        </div>
    {:else}
        <div class="row justify-content-center">
            <div class="col-12">
                {#if profile.avatar_url === ''}
                    <div class="bg-image rounded-bottom-5"
                         style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
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
                    <div class="bg-image rounded-bottom-5 shadow-sm"
                         style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url({profile.cover_url ? profile.cover_url : profile.avatar_url}), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                        <div class="row justify-content-center align-items-end" style="height: 100%;">
                            <div class="col-auto">
                                <img src="{profile.avatar_url}" alt="{profile.username}" loading="lazy"
                                     class="rounded-circle bg-dark shadow" width="150px" height="150px" id="profileIcon"
                                     on:load={() => avatarFound = true} on:error={() => avatarFound = false}>
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
                    <span class="h1 mt-2 mb-1"><button type="button" class="btn-username" on:click={copyToClipboardId}
                                                       use:tooltip={{...tooltipConfig}}
                                                       title="Click to copy profile ID!">{profile.username}</button> <a
                            class="link-purple"
                            href="{profile.website ? profile.website : ''}"
                            target="_blank"
                            data-tooltip="{profile.website ? '⚠️ External link - Careful!' : '🔗 Profile'}"
                            ><i
                            class="fa-solid fa-external-link fa-2xs"></i></a></span>
                {/if}
            </div>
        </div>
        <div class="row justify-content-center mx-0 mt-3">
            <div class="col-12 bg-light-subtle bg-info-profile rounded-4">
                <div class="row justify-content-center align-items-center text-center py-3">
                    <div class="col-4 col-md-3 align-items-center" id="followers" data-bs-toggle="dropdown"
                         aria-expanded="false">
                        <div class="row justify-content-center d-flex align-items-center"
                             use:tooltip={{...tooltipConfig}} title="Followers">
                            <div class="col-auto d-flex align-items-center pe-0">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="col-auto mt-1">
                                <span class="">{total_followers}</span>
                            </div>
                        </div>
                        <div class="dropdown-menu ms-md-5 py-1" aria-labelledby="followers">
                            <!-- TODO: Fix positioning -->
                            {#if !profile.followers || profile.followers.length === 0}
                                <span class="dropdown-item rounded-3">No followers yet</span>
                            {:else}
                                {#each profile.followers as follower (follower.follower_id)}
                                    <span class="dropdown-item">
                                        <UserAvatarNavbar url="{follower.profiles.avatar_url}"
                                                          username="{follower.profiles.username}" {image_proxy}
                                                          size="25px" classes="me-2"/>
                                        <a class="link-light text-decoration-none h-100"
                                           href="/profile/{follower.follower_id}"
                                           on:click={handleVisit}>{follower.profiles.username}</a></span>
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
                                <button class="btn btn-outline-light w-100 mt-3 mt-md-0 shadow" on:click={handleFollow}
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
                        on:click={() => show = 'home'}
                        data-tooltip="{profile.username + ' Home 🏠'}">Home
                </button>
            </div>
            {#if profile.show_favourites || isOwner}
                <div class="col-auto">
                    <button class="btn btn-view-options rounded-3 px-3 py-2 {(show === 'favourites') ? 'active' : ''}"
                            on:click={() => show = 'favourites'}
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
                        on:click={() => show = 'galleries'}
                        data-tooltip="{profile.username + ' Galleries (Coming soon!) 🖼️'}">Galleries
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
                    <!--{#each profile.book as content (content.id)}
                        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex align-items-stretch px-0 px-sm-2">
                            <ContentCard {content} {image_proxy} on:invalidate={() => {invalidateAll()}}/>
                        </div>
                    {/each}-->
                    <!-- New Masonry style -->
                    <div class="col-12 mt-0 ps-0 column-vertical" on:scroll={handleScroll}>
                        <Masonry
                                items={profile.book}
                                minColWidth={400}
                                gap={10}
                                animate={true}
                                let:item
                                bind:width
                                bind:height
                        >
                            <ProfileMasonry content={item} {image_proxy} on:invalidate={() => {invalidateAll()}}/>
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
                    <div class="col-12 mt-0 ps-0 column-vertical" on:scroll={handleScroll}>
                        <Masonry
                                items={likedBooks}
                                idKey="book_id"
                                minColWidth={300}
                                gap={10}
                                animate={true}
                                let:item
                                bind:width
                                bind:height
                        >
                            <ContentMasonry book={item.book} {image_proxy}/>
                        </Masonry>
                    </div>
                {/if}
            {/if}
            <!-- Coming soon, galleries -->
            {#if show === "galleries"}
                <div class="col mt-4 text-center">
                    <p class="h1">Coming soon... 🖼️</p>
                </div>
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

    .column-vertical {
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: calc(100vh / 1.2);
        white-space: normal;
    }

    .column-vertical::-webkit-scrollbar {
        width: 15px;
    }

    .column-vertical::-webkit-scrollbar-track {
        background: rgba(92, 0, 166, 0.25);
    }

    .column-vertical::-webkit-scrollbar-thumb {
        background: rgba(92, 0, 166, 0.80);
        border-radius: 8px;
        cursor: pointer;
    }

    .column-vertical::-webkit-scrollbar-thumb:hover {
        background: rgba(92, 0, 166, 1);
    }
</style>