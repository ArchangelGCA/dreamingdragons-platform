<script>
    import {onMount} from "svelte";
    import ContentCard from "$lib/components/profile/ContentCard.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import { PUBLIC_DEFAULT_USERNAME } from '$env/static/public';
    import autoAnimate from '@formkit/auto-animate';
    import {deserialize} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import {toast} from "@zerodevx/svelte-toast";

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    export let data;
    let { session, supabase, profile, isOwner, isFollowing } = data;

    let finalProfile = null;
    let avatarUrl = '';
    let finalAvatarUrl = '';
    let avatarFound = true;
    let yearCreated = '';
    let books = [];
    let followers = 0;
    let followersArray = [];
    let followActionActive = false;

    if (profile && profile !== null && profile.length > 0) {
        finalProfile = profile[0];
        const date = new Date(finalProfile.created_at);
        const options = { year: 'numeric', month: 'long' };
        finalProfile.created_at = date.toLocaleDateString('en-US', options);
        yearCreated = date.getFullYear();
        books = profile[0].books;
        followersArray = finalProfile.followers;
        if (followersArray === null) followersArray = [];
        followers = followersArray.length;
        avatarUrl = finalProfile.avatar_url;
    }

    async function downloadAvatar(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            finalAvatarUrl = URL.createObjectURL(data);
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
                avatarFound = false;
            }
        }
    }

    async function handleVisit(e) {
        e.preventDefault();
        console.log('Visiting profile: ' + e.target.href);
        window.location.href = e.target.href;
    }

    async function handleFollow(e) {
        e.preventDefault();

        if (followActionActive) return;
        followActionActive = true;

        isFollowing = !isFollowing;

        const formData = new FormData();
        formData.append('profileId', finalProfile.id);

        const response = await fetch('?/follow', {
            method: 'POST',
            body: formData,
        });

        const result = deserialize(await response.text());
        await invalidateAll(); // Not sure if it's actually necessary.
        if (result.type === 'success') {
            if (result.data.status === 200){
                if (result.data.body.follow){
                    followers += 1;
                    isFollowing = true;
                    toast.push('➕ You\'re now following ' + finalProfile.username + "!", {
                        theme: {
                            '--toastBackground': '#8b00b6',
                            '--toastColor': '#fff'
                        }
                    });
                } else {
                    followers -= 1;
                    isFollowing = false;
                    toast.push('➖ You\'ve unfollowed ' + finalProfile.username + "!", {
                        theme: {
                            '--toastBackground': '#7b2eff',
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

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

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
            {#if avatarUrl === ''}
                <div class="bg-image rounded-bottom-5" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                    <div class="row justify-content-center align-items-end" style="height: 100%;">
                        <div class="col-auto">
                        </div>
                    </div>
                </div>
            {:else if finalAvatarUrl === '' && avatarFound}
                <div class="row text-center justify-content-center mt-3">
                    <div class="col-auto">
                        <div class="spinner-border text-light align-self-center" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="bg-image rounded-bottom-5 shadow-sm" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url({finalAvatarUrl}), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                    <div class="row justify-content-center align-items-end" style="height: 100%;">
                        <div class="col-auto">
                            <img src="{finalAvatarUrl}" alt="{finalProfile.username}" loading="lazy" class="rounded-circle bg-dark shadow" width="150px" height="150px" id="profileIcon" on:load={() => avatarFound = true} on:error={() => avatarFound = false}>
                        </div>
                    </div>
                </div>
            {/if}
            {#if !avatarFound}
                <div class="row justify-content-center mt-3">
                    <div class="col-auto">
                        <div class="alert alert-danger" role="alert">
                            <i class="fa-solid fa-exclamation-triangle"></i> Avatar not found, please upload one from your profile <a class="link-light" href="/settings">Settings</a>.
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
    <div class="row justify-content-center mt-3">
        <div class="col text-center">
            {#if finalProfile.username.startsWith(PUBLIC_DEFAULT_USERNAME)}
                <span class="h1 mt-2 mb-1 text-warning-emphasis">Please update your <a href="/settings">profile</a></span>
            {:else}
                <span class="h1 mt-2 mb-1">{finalProfile.username}</span>
            {/if}
        </div>
    </div>
    <div class="row justify-content-center mx-0 mt-3">
        <div class="col-12 bg-light-subtle bg-info-profile rounded-4">
            <div class="row justify-content-center align-items-center text-center py-3">
                <div class="col-4 col-md-3 align-items-center" id="followers" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Followers">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="">{followers}</span>
                        </div>
                    </div>
                    <div class="dropdown-menu ms-md-5" aria-labelledby="followers"> <!-- TODO: Fix positioning -->
                        {#if followersArray.length === 0}
                            <span class="dropdown-item rounded-3">No followers yet</span>
                        {:else}
                            {#each followersArray as follower (follower)}
                                <span class="dropdown-item rounded-3"><a class="link-light text-decoration-none" href="/profile?id={follower.id}" on:click={handleVisit}>{follower.username}</a></span>
                            {/each}
                        {/if}
                    </div>
                </div>
                <div class="col-4 col-md-3">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Total likes">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="">{finalProfile.total_likes}</span>
                        </div>
                    </div>
                </div>
                <div class="col-4 col-md-3">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Joined: {finalProfile.created_at}">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="h6">{yearCreated}</span>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-3 px-4">
                    <div class="row justify-content-center">
                        <div class="col-11 col-md-auto px-0">
                            <button class="btn btn-outline-light w-100 mt-3 mt-md-0 shadow" on:click={handleFollow} use:tooltip={{...tooltipConfig}} title="Follow/Unfollow">
                                <i class="fas {isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                                <span class="ms-1">{isFollowing ? 'Unfollow' : 'Follow'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2 mb-4 justify-content-evely gy-3 mx-auto">
        {#if !books || books.length === 0}
            <div class="col mt-4 text-center">
                <p class="h1">No content found, yet!</p>
                <i class="fa-solid fa-bookmark fa-5x text-warning" use:autoAnimate></i>
            </div>
        {:else}
            {#each books as content (content.book.id)}
                <div class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex align-items-stretch px-0 px-sm-2">
                    <ContentCard content={content} />
                </div>
            {/each}
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

    #followers {
        cursor: pointer;
    }
</style>