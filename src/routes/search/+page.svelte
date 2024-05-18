<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import BookSearch from "$lib/components/layout/BookSearch.svelte";
    import autoAnimate from '@formkit/auto-animate';
    import {deserialize} from "$app/forms";
    import {onMount} from "svelte";
    import Seo from "sk-seo";

    export let data;
    let { searchResults, partialText, image_proxy } = data;

    let seo = {};

    $: seo = {
        title: partialText + ' | Roses In The Flames',
        description: 'Search results for ' + partialText + ' on Roses In The Flames.',
        siteName: 'Roses in The Flames - Platform',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA',
        index: true
    };

    onMount(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    });

    let profiles = [];
    let books = [];
    let allResultsLoaded = false;
    let loading = false;
    let page = 1;

    if (searchResults.length !== 0){
        searchResults.forEach(result => {
            if (result.book_id !== undefined){
                books.push(result);
                if (!profiles.some(profile => profile.owner_id === result.owner_id)){
                    profiles.push({
                        owner_id: result.owner_id,
                        owner_username: result.owner_username,
                        owner_full_name: result.owner_full_name,
                        owner_avatar_url: result.owner_avatar_url,
                        owner_website: result.owner_website
                    });
                }
            } else {
                profiles.push(result);
            }
        });
    } else {
        allResultsLoaded = true;
        // index to false in seo
        seo.index = false;
    }

    async function loadMoreResults(){
        if (allResultsLoaded || loading) return;

        loading = true;

        const formData = new FormData();
        formData.append('page', page++);
        formData.append('query', partialText);
        const response = await fetch('?/loadmore', {
            method: 'POST',
            body: formData,
        });

        const result = deserialize(await response.text());
        if (result.type === "success"){
            const { searchResults } = result.data;

            if (searchResults.length === 0){
                allResultsLoaded = true;
            } else {
                searchResults.forEach(result => {
                    if (result.book_id !== undefined){
                        if (!books.some(book => book.book_id === result.book_id)) books.push(result);
                        if (!profiles.some(profile => profile.owner_id === result.owner_id)){
                            profiles.push({
                                owner_id: result.owner_id,
                                owner_username: result.owner_username,
                                owner_full_name: result.owner_full_name,
                                owner_avatar_url: result.owner_avatar_url,
                                owner_website: result.owner_website
                            });
                        }
                    } else {
                        profiles.push(result);
                    }
                });
                profiles = profiles;
                books = books;
            }
        }

        loading = false;
    }

    function handleScroll() {
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        let documentHeight = document.documentElement.scrollHeight;
        let viewportHeight = window.innerHeight;

        if (scrollTop + viewportHeight >= documentHeight - (viewportHeight / 2)) {
            loadMoreResults();
        }
    }
</script>

<Seo {...seo} />

<div class="container-fluid my-3" style="min-height: 69vh">
    {#if partialText === ""}
        <div class="row">
            <div class="col">
                <p class="h2 text-center text-danger-emphasis">Mmm... nothing found. Did you forget to enter a search query? 🤔</p>
            </div>
        </div>
    {:else}
        <div class="row mb-2">
            <div class="col">
                <p class="h2 text-center">Search Results</p>
                <p class="h6 text-center text-muted">Results for: {partialText}</p>
            </div>
        </div>
        <div class="row">
            <div class="col px-0" use:autoAnimate>
                {#if searchResults.length === 0}
                    <p class="h2 text-center text-danger-emphasis">Nothing found! Please try again...</p>
                {:else}
                    <div class="row">
                        <div class="col">
                            <p class="h3 text-start">Profiles</p>
                        </div>
                    </div>
                    <div class="row row-horizontal flex-nowrap border-bottom border-top py-2 ps-1 pe-1 ps-xl-5 pe-xl-5">
                            {#if profiles.length === 0 && books.length !== 0}
                                <div class="col-12">
                                    <p class="text-center">Profiles not found!</p>
                                </div>
                            {:else}
                                {#each profiles as profile (profile.owner_id)}
                                    <div class="col-auto">
                                        <UserAvatar url={profile.owner_avatar_url} username={profile.owner_username} id={profile.owner_id} {image_proxy} size="50px" />
                                    </div>
                                {/each}
                            {/if}
                    </div>
                    <div class="row mt-4 mb-2">
                        <div class="col">
                            <p class="h3 text-center">Content</p>
                        </div>
                    </div>
                    <div class="container-xxl">
                        {#if books.length === 0}
                            <div class="row">
                                <div class="col">
                                    <p class="text-center">Books not found!</p>
                                </div>
                            </div>
                        {:else}
                            <div class="row g-3 justify-content-center">
                                {#each books as book (book.book_id)}
                                    <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                                        <BookSearch owner_username={book.owner_username} owner_id={book.owner_id} title={book.book_title} book_id={book.book_id} description={book.book_description} book_cover_url={book.book_cover_url} {image_proxy}/>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                        {#if allResultsLoaded}
                            <div class="row pt-3 mt-3">
                                <div class="col">
                                    <p class="h5 text-center mb-0 blink pt-2 pb-2 rounded-3">⚠️All results loaded!⚠️</p>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }

    /* we make the element with class blink blink one time */
    .blink {
        animation: blinker 1s linear 2;
    }

    /** we change the background color of the element with class blink */
    @keyframes blinker {
        50% {
            background-color: rgba(255, 0, 0, 0.5);
        }
    }
</style>