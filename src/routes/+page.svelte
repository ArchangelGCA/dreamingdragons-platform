<script>
    import Content from "$lib/components/pages/Content.svelte";
    import Seo from 'sk-seo';
    import { tooltip } from "@svelte-plugins/tooltips";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import Masonry from "$lib/components/layout/Masonry.svelte";
    import ContentMasonry from "$lib/components/pages/ContentMasonry.svelte";

    const seo = {
        title: 'Roses In The Flames - Platform',
        description: 'The official platform of Roses in The Flames. By CringleDragons, ArchangelGCA, and its community. Read, find and share your art and literature.',
        siteName: 'Roses in The Flames - Platform',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA',
        canonical: 'https://tales.rosesintheflames.com',
        index: true
    }

    export let data;
    let { supabase, image_proxy, books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter, is_logged, followed, tooltipConfig } = data;
    $: ({books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter, is_logged, followed} = data);
    let loading = false;
    let allContentLoaded = false;
    let page = 1;
    let pageStep = 40;

    if (!books_ordered_by_created_at || books_ordered_by_created_at.length === 0) {
        allContentLoaded = true;
    }

    async function loadMoreContentByCreatedAt() {
        if (loading || allContentLoaded) return;

        console.log('loading more content');

        loading = true;

        // fetch from books_ordered_by_created_at using range and append to books_ordered_by_created_at
        let { data: newBooks, error } = await supabase
            .from('books_ordered_by_created_at')
            .select('*')
            .range((pageStep * page) + 1, pageStep * (page + 1));

        if (error) {
            console.error(error);
        }

        if (newBooks.length === 0) {
            allContentLoaded = true;
        } else {
            books_ordered_by_created_at = [...books_ordered_by_created_at, ...newBooks];
            page++;
        }

        loading = false;
    }

    let reset = false;
    let counterImg = 0;

    async function handleLoadedImage() {
        counterImg++;
        // console.log('Image loaded', counterImg, books_ordered_by_created_at.length - (pageStep + 1));
        if (counterImg >= books_ordered_by_created_at.length - (pageStep + 1)) {
            reset = !reset;
        }
    }

    function handleScroll(event) {
        const target = event.target;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + (target.clientHeight / 0.5)) {
            loadMoreContentByCreatedAt();
        }
    }
</script>

<Seo {...seo} />

<div class="container-fluid mb-3 mt-2" style="min-height: 69vh">
    <div class="row justify-content-center">
        <div class="col-12 bg-purple-opacity-75 py-2 rounded-3">
            <span class="h2 text-start fw-bolder" use:tooltip={{...tooltipConfig}} title="Home 🏠">Home</span>
        </div>

        {#if is_logged && followed && followed.length > 0}
            <div class="col-12 border border-top border-start-0 border-end-0 pb-1 mt-2">
                <div class="row justify-content-center bg-purple-opacity-50 rounded-3 mb-1 mt-1 p-1" use:tooltip={{...tooltipConfig}} title="Following Users">
                    <div class="col-12 text-center">
                        <p class="fs-5 mb-0">Following</p>
                    </div>
                </div>
                <div class="row row-horizontal flex-nowrap ps-1 pe-1 gx-4 gx-md-5">
                    {#each followed as follow (follow.id)}
                        <div class="col-auto py-2">
                            <UserAvatar url={follow.avatar_url} username={follow.username} id={follow.id} {image_proxy} size="50px" />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Old version
        <div class="col-12 mt-3 mb-2">
            <p class="h4">Newest Content</p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_created_at || books_ordered_by_created_at.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row column-vertical pb-3 gy-2" on:scroll={handleScroll} use:autoAnimate>
                    {#each books_ordered_by_created_at as book (book.book_id)}
                        <div class="col-6 col-sm-4 col-md-3 col-xl-2 px-1">
                            <Content {...book} {image_proxy} />
                        </div>
                    {/each}
                    {#if allContentLoaded}
                        <div class="col-12">
                            <p class="h5 text-center mb-0 blink pt-2 pb-2 rounded-3">⚠️All Content loaded!⚠️</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        -->

        <div class="col-12 mt-3 mb-2">
            <p class="h4">Newest Content <span class="text-body-tertiary small-text">Masonry v0.1.3</span></p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_created_at || books_ordered_by_created_at.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row column-vertical" on:scroll={handleScroll}>
                    <div class="col-12 px-0">
                        <Masonry {reset}>
                            {#each books_ordered_by_created_at as book (book.book_id)}
                                <ContentMasonry {...book} {image_proxy} on:loaded={handleLoadedImage} on:notfound={handleLoadedImage}/>
                            {/each}
                        </Masonry>
                    </div>
                    {#if allContentLoaded}
                        <div class="col-12">
                            <p class="h5 text-center mb-0 blink pt-2 pb-2 rounded-3">⚠️All Content loaded!⚠️</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        <div class="col-12 mt-5 mb-2">
            <p class="h4">Most Liked</p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_likes || books_ordered_by_likes.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row row-horizontal pb-3 flex-nowrap gy-3" >
                    {#each books_ordered_by_likes as book (book.book_id)}
                        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                            <Content {...book} {image_proxy} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="col-12 mt-5 mb-2">
            <p class="h4">Recently Updated</p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_latest_chapter || books_ordered_by_latest_chapter.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row row-horizontal pb-3 flex-nowrap gy-3" >
                    {#each books_ordered_by_latest_chapter as book (book.book_id)}
                        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                            <Content {...book} {image_proxy} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
    <div class="row justify-content-center text-center gy-3 my-auto border-top border-light-subtle mt-5">
        <div class="col-12 mt-5">
            <p class="h2 text-center">Our Discord Servers:</p>
        </div>
        <div class="col-auto">
            <p class="h3 text-center"><a class="btn btn-purple btn-lg" href="https://discord.gg/5mVFmCBx5q" target="_blank" use:tooltip={{...tooltipConfig}} title="Join Discord">DreamingDragons</a></p>
            <iframe class="rounded-3" title="Discord DreamingDragons" src="https://canary.discord.com/widget?id=1054013154822205450&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
        <div class="col-auto">
            <p class="h3 text-center"><a class="btn btn-purple btn-lg" href="https://discord.gg/8v5WucBuRe" target="_blank" use:tooltip={{...tooltipConfig}} title="Join Discord">RiTF</a></p>
            <iframe class="rounded-3" title="Discord RiTF" src="https://canary.discord.com/widget?id=1149939721980624986&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
    </div>
</div>

<style>

    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }

    .column-vertical {
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: calc(100vh / 1.8);
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

    .bg-purple-opacity-50 {
        background-color: rgba(92, 0, 166, 0.5);
    }

    /*
    .bg-purple {
        background-color: #5c00a6;
    }

    .bg-purple-opacity-10 {
        background-color: rgba(92, 0, 166, 0.1);
    }

    .bg-purple-opacity-25 {
        background-color: rgba(92, 0, 166, 0.25);
    }
    */

    .bg-purple-opacity-75 {
        background-color: rgba(92, 0, 166, 0.75);
    }

    .row-horizontal::-webkit-scrollbar {
        height: 15px;
    }

    .row-horizontal::-webkit-scrollbar-track {
        background: rgba(92, 0, 166, 0.25);
    }

    .row-horizontal::-webkit-scrollbar-thumb {
        background: rgba(92, 0, 166, 0.80);
        border-radius: 8px;
        cursor: pointer;
    }

    .row-horizontal::-webkit-scrollbar-thumb:hover {
        background: rgba(92, 0, 166, 1);
    }

    .btn-purple {
        background-color: #5c00a6;
        color: white;
        animation: pulse 2s ease-in-out infinite;
    }

    .btn-purple:hover {
        background-color: #7d00dd;
        color: white;
    }

    .blink {
        animation: blinker 1s linear 2;
    }

    .small-text {
        font-size: 0.8rem;
    }

    @keyframes blinker {
        50% {
            background-color: rgba(255, 0, 0, 0.5);
        }
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgb(207, 0, 255);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(88, 101, 242, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(88, 101, 242, 0);
        }
    }
</style>