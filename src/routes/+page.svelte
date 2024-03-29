<script>
    import Content from "$lib/components/pages/Content.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";

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
    let { books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter } = data;
</script>

<svelte:head>
    <title>Roses In The Flames | Home</title>
    <link rel="canonical" href="https://tales.rosesintheflames.com/">

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Roses In The Flames | Tales" />
    <meta name="twitter:description" content="A place to share your stories and art, featured by Roses In The Flames and built with love by its community." />
    <meta name="twitter:image" content="https://tales.rosesintheflames.com/favicon.webp" />

    <meta property="og:title" content="Roses In The Flames | Tales" />
    <meta property="og:image" content="https://tales.rosesintheflames.com/favicon.webp" />
    <meta property="og:description" content="A place to share your stories and art, featured by Roses In The Flames and built with love by its community." />
</svelte:head>

<div class="container-fluid my-3" style="min-height: 69vh">
    <div class="row justify-content-center">
        <div class="col-12 bg-purple-opacity-50 py-2 rounded-3">
            <span class="h2 text-start fw-bolder" use:tooltip={{...tooltipConfig}} title="Home 🏠">Home</span>
        </div>

        <div class="col-12 mt-3 mb-2">
            <p class="h4">Newest Content</p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_created_at || books_ordered_by_created_at.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row row-horizontal pb-3 flex-nowrap gy-3" >
                    {#each books_ordered_by_created_at as book}
                        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                            <Content {...book} />
                        </div>
                    {/each}
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
                    {#each books_ordered_by_likes as book}
                        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                            <Content {...book} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="col-12 mt-5 mb-2">
            <p class="h4">Content with Newest Chapters</p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_latest_chapter || books_ordered_by_latest_chapter.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row row-horizontal pb-3 flex-nowrap gy-3" >
                    {#each books_ordered_by_latest_chapter as book}
                        <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                            <Content {...book} />
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
            <p class="h3 text-center">DreamingDragons</p>
            <iframe class="rounded-3" title="Discord DreamingDragons" src="https://canary.discord.com/widget?id=1054013154822205450&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
        <div class="col-auto">
            <p class="h3 text-center">RiTF</p>
            <iframe class="rounded-3" title="Discord RiTF" src="https://canary.discord.com/widget?id=1149939721980624986&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
    </div>
</div>

<style>

    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }


    .bg-purple-opacity-50 {
        background-color: rgba(92, 0, 166, 0.5);
    }

    /*
    .bg-purple {
        background-color: #5c00a6;
    }

    .bg-purple-opacity-25 {
        background-color: rgba(92, 0, 166, 0.25);
    }

    .bg-purple-opacity-10 {
        background-color: rgba(92, 0, 166, 0.1);
    }*/

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
</style>