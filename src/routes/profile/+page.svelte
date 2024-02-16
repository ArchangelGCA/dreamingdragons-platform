<script>
    import {onMount} from "svelte";
    import ContentCard from "$lib/components/profile/ContentCard.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    export let data;
    let { session, supabase, profile } = data;
    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: '#5c00a6',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    // Each profile (profile is an array) has a structure like this:
    /*
    {
        user_id: 'an_unique_user_id',
        username: 'ArchangelGCA',
        full_name: 'GCA',
        avatar_url: '0.20207563595383804.png',
        website: 'userWebsite',
        can_upload: true,
        user_created_at: 'timestampz',
        book_id: 1,
        book_title: 'Example Book',
        book_description: "Example Book's Description",
        book_cover_url: 'urlToCover',
        is_liked: true
    }
     */

    let username = '';
    let website = '';
    let avatarUrl = '';
    let finalAvatarUrl = '';
    let avatarFound = true;
    let createdAt = '';
    let yearCreated = '';
    let hasBooks = true;
    let books = [];
    let followers = 0; // TODO: Get number of followers
    let likes = 0; // TODO: Get total likes

    if (profile !== null) {
        try {
            username = profile[0].username;
        } catch (e2) {
            username = '';
        }
        try {
            website = profile[0].website;
        } catch (e3) {
            website = '';
        }
        try {
            avatarUrl = profile[0].avatar_url;
        } catch (e4) {
            avatarUrl = '';
        }
        try {
            createdAt = profile[0].user_created_at;
        } catch (e5) {
            createdAt = '';
        }
        if (createdAt !== '') {
            const date = new Date(createdAt);
            const options = { year: 'numeric', month: 'long' };
            createdAt = date.toLocaleDateString('en-US', options);
            yearCreated = date.getFullYear();
        }
        try { // TODO: Fix redundancy in this block
            hasBooks = profile[0].books.length !== 0;
        } catch (e6) {
            hasBooks = false;
        }
        if (hasBooks) { // TODO: Fix even more redundancy
            books = profile[0].books;
        }
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

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="container-fluid px-0" style="min-height: 71vh">
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
                <div class="bg-image rounded-bottom-5" style="background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url({finalAvatarUrl}), linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)); height: 300px; background-repeat: no-repeat; background-position: center; background-size: cover;">
                    <div class="row justify-content-center align-items-end" style="height: 100%;">
                        <div class="col-auto">
                            <img src="{finalAvatarUrl}" alt="{username}" loading="lazy" class="rounded-circle bg-dark shadow" width="150px" height="150px" id="profileIcon" on:load={() => avatarFound = true} on:error={() => avatarFound = false}>
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
            {#if username === "Please update your username"}
                <span class="h1 mt-2 mb-1 text-warning-emphasis">Please update your <a href="/settings">profile</a></span>
            {:else}
                <span class="h1 mt-2 mb-1">{username}</span>
            {/if}
        </div>
    </div>
    <div class="row justify-content-center mt-3 mx-1">
        <div class="col-12 bg-light-subtle bg-info-profile rounded-4">
            <div class="row justify-content-center align-items-center text-center py-3">
                <div class="col-4 align-items-center">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Followers">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="">{followers}</span>
                        </div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Total likes">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="">{likes}</span>
                        </div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Joined: {createdAt}">
                        <div class="col-auto d-flex align-items-center pe-0">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="col-auto mt-1">
                            <span class="h6">{yearCreated}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2 mb-4 justify-content-evely gy-3 mx-0 px-1">
        {#if !hasBooks}
            <div class="col text-center">
                <p class="h1">No content found, yet!</p>
                <i class="fa-solid fa-bookmark fa-5x text-warning" data-aos="zoom-in"></i>
            </div>
        {:else}
            {#each books as content (content.book_id)}
                <div class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex align-items-stretch px-0 px-sm-2" use:tooltip={{...tooltipConfig}} data-bs-placement="top" title="Open content">
                    <ContentCard content={content} />
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .fa-user, .fa-heart, .fa-calendar-alt {
        font-size: 1.6rem;
    }

    .bg-info-profile {
        background: linear-gradient(90deg, rgba(128, 0, 128, 0.5) 0%, rgba(75, 0, 130, 0.5) 50%, rgba(60, 0, 104, 0.5) 100%);
    }
</style>