<script>
    import Content from "$lib/components/pages/Content.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import ContentMasonry from "$lib/components/pages/ContentMasonry.svelte";
    import Masonry from "svelte-bricks";
    import {deserialize} from "$app/forms";

    export let data;
    let { image_proxy, books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter, is_logged, followed, tooltipConfig } = data;
    $: ({books_ordered_by_likes, books_ordered_by_created_at, books_ordered_by_latest_chapter, is_logged, followed} = data);
    let loading = false;
    let allContentLoaded = false;
    let step = 40;
    let startRange = 0;
    let endRange = step;
    let width, height;

    if (!books_ordered_by_created_at || books_ordered_by_created_at.length === 0) {
        allContentLoaded = true;
    }

    async function loadMoreContentByCreatedAt() {
        if (loading || allContentLoaded) return;

        console.log('loading more content');

        loading = true;
        let newBooks = [];

        const formData = new FormData();
        formData.append('startRange', startRange);
        formData.append('endRange', endRange);

        const response = await fetch('?/books_created_at', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                newBooks = result.data.body.books;
            } else {
                console.error(result.data.body);
            }
        } else {
            console.error(result.error);
        }

        if (newBooks.length === 0) {
            allContentLoaded = true;
        } else {
            books_ordered_by_created_at = [...books_ordered_by_created_at, ...newBooks.filter((book) => !books_ordered_by_created_at.some((b) => b.id === book.id))];
            startRange = endRange;
            endRange += step;
        }

        loading = false;
    }

    function handleScroll(event) {
        const target = event.target;
        if ((target.scrollHeight - target.scrollTop <= target.clientHeight + (target.clientHeight / 0.2)) && !allContentLoaded) {
            // console.log((target.scrollHeight - target.scrollTop) + ' <= ' + (target.clientHeight + (target.clientHeight / 0.2)));
            loadMoreContentByCreatedAt();
        }
    }
</script>

<!--
<Seo
        title="Roses in The Flames - Platform"
        description="The official platform of Roses in The Flames. By CringleDragons, ArchangelGCA, and its community. Read, find and share your art and literature."
        siteName="Roses in The Flames - Platform"
        imageURL="https://tales.rosesintheflames.com/favicon.webp"
        logo="https://tales.rosesintheflames.com/favicon.webp"
        author="ArchangelGCA, CringleDragons"
        canonical="https://tales.rosesintheflames.com"
        twitter="true"
        schemaOrg="true"
        index="true"
/>
-->

<div class="container-fluid mb-3 mt-2" style="min-height: 69vh">

    <!-- Home, Following and Content Section -->
    <div class="row justify-content-center">

        <!-- Home title -->
        <div class="col-12 bg-purple-gradient py-2 rounded-3">
            <span class="h2 text-start fw-bolder" use:tooltip={{...tooltipConfig}} title="Home 🏠">Home</span>
        </div>

        <!-- Start following section -->
        {#if is_logged && followed && followed.length > 0}
            <div class="col-12 pb-1 mt-2">
                <div class="row justify-content-center bg-purple-gradient rounded-3 mb-1 mt-1 p-1" use:tooltip={{...tooltipConfig}} title="Following Users">
                    <div class="col-12 text-center">
                        <p class="fs-5 mb-0">Following</p>
                    </div>
                </div>
                <div class="row row-horizontal flex-nowrap ps-1 pe-1 gx-3 gx-md-4">
                    {#each followed as follow (follow.id)}
                        <div class="col-auto py-2">
                            <UserAvatar url={follow.avatar_url} username={follow.username} id={follow.id} {image_proxy} size="50px" />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        <!-- End following section -->

        <!-- Start newest content section -->
        <div class="col-12 mt-3 mb-2">
            <p class="h4">Newest Content <span class="text-body-tertiary small-text">Masonry v0.2.1</span></p>
        </div>
        <div class="col-12">
            {#if !books_ordered_by_created_at || books_ordered_by_created_at.length === 0}
                <p class="h5 text-center">No new content available.</p>
            {:else}
                <div class="row column-vertical" on:scroll={handleScroll}>
                    <div class="col-12 px-0">
                        <Masonry
                                items={books_ordered_by_created_at}
                                minColWidth={250}
                                gap={10}
                                animate={true}
                                let:item
                                bind:width
                                bind:height
                        >
                            <ContentMasonry book={item} {image_proxy} />
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
        <!-- End newest content section -->

        <!-- Start most liked and recently updated content section -->
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
                            <Content owner_username={book.owner_username} owner_id={book.owner_id} book_title={book.book_title} book_id={book.book_id} book_cover_url={book.book_cover_url} owner_avatar_url={book.owner_avatar_url} {image_proxy} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        <!-- End most liked content section -->

        <!-- Start recently updated content section -->
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
                            <Content owner_username={book.owner_username} owner_id={book.owner_id} book_title={book.book_title} book_id={book.book_id} book_cover_url={book.book_cover_url} owner_avatar_url={book.owner_avatar_url} {image_proxy} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
        <!-- End recently updated content section -->
    </div>
    <div class="row justify-content-center text-center gy-3 my-auto border-top border-light-subtle mt-5">
        <div class="col-12 mt-5">
            <p class="h2 text-center">Our Discord Servers:</p>
        </div>
        <div class="col-auto">
            <p class="h3 text-center"><a class="btn btn-purple btn-lg" href="https://discord.gg/5mVFmCBx5q" target="_blank" use:tooltip={{...tooltipConfig}} title="Join Discord">DreamingDragons</a></p>
            <iframe class="rounded-3" src="https://discord.com/widget?id=1054013154822205450&theme=dark" title="DreamingDragons Discord" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
        <div class="col-auto">
            <p class="h3 text-center"><a class="btn btn-purple btn-lg" href="https://discord.gg/8v5WucBuRe" target="_blank" use:tooltip={{...tooltipConfig}} title="Join Discord">RiTF</a></p>
            <iframe class="rounded-3" src="https://discord.com/widget?id=1149939721980624986&theme=dark" title="Roses in The Flames Discord" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
        </div>
    </div>
</div>

<style>

    .bg-purple-gradient {
        background: linear-gradient(145deg, rgba(92, 0, 166, 0.5) 10%, rgba(92, 0, 166, 0.1));
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

    .column-vertical {
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: calc(100vh / 1.15);
        white-space: normal;
    }

    .column-vertical::-webkit-scrollbar {
        width: 12px;
    }

    .column-vertical::-webkit-scrollbar-track {
        background: rgba(92, 0, 166, 0.25);
    }

    .column-vertical::-webkit-scrollbar-thumb {
        background: linear-gradient(0deg, rgba(92, 0, 166, 0), rgba(92, 0, 166, 1) 15% 85%, rgba(92, 0, 166, 0));
        border-radius: 8px;
        cursor: pointer;
    }

    .column-vertical::-webkit-scrollbar-thumb:hover {
        background: rgba(92, 0, 166, 1);
    }

    /* Custom for mobile */
    @media (max-width: 576px) {
        .column-vertical::-webkit-scrollbar {
            width: 8px;
        }

        .row-horizontal::-webkit-scrollbar {
            height: 8px;
        }
    }

    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }

    .row-horizontal::-webkit-scrollbar {
        height: 12px;
    }

    .row-horizontal::-webkit-scrollbar-track {
        background: rgba(92, 0, 166, 0.25);
    }

    .row-horizontal::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, rgba(92, 0, 166, 0), rgba(92, 0, 166, 1) 15% 85%, rgba(92, 0, 166, 0));
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