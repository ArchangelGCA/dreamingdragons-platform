<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import BookSearch from "$lib/components/layout/BookSearch.svelte";


    export let data;
    let { supabase, searchResults } = data;
    let profiles = [];
    let books = [];

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
    }
</script>

<div class="container-fluid my-3" style="min-height: 69vh">
    <div class="row mb-2">
        <div class="col">
            <p class="h2 text-center">Search Results:</p>
        </div>
    </div>
    <div class="row">
        <div class="col px-0">
            {#if searchResults.length === 0}
                <p class="h2 text-center text-danger-emphasis">Nothing found! Please try again...</p>
            {:else}
                <div class="row">
                    <div class="col">
                        <p class="h3 text-start">Profiles:</p>
                    </div>
                </div>
                <div class="row row-horizontal flex-nowrap border border-top border-start-0 border-end-0 py-2 ps-1 pe-1 ps-md-5 pe-md-5 gx-5">
                        {#if profiles.length === 0 && books.length !== 0}
                            <div class="col-12">
                                <p class="text-center">Profiles not found!</p>
                            </div>
                        {:else}
                            {#each profiles as profile (profile.owner_id)}
                                <div class="col-auto">
                                    <UserAvatar url={profile.owner_avatar_url} username={profile.owner_username} id={profile.owner_id} {supabase} size="60px" />
                                </div>
                            {/each}
                        {/if}
                </div>
                <div class="row mt-4">
                    <div class="col">
                        <p class="h3 text-start">Content:</p>
                    </div>
                </div>
                {#if books.length === 0}
                    <div class="row">
                        <div class="col">
                            <p class="text-center">Books not found!</p>
                        </div>
                    </div>
                {:else}
                    <div class="row g-3">
                        {#each books as book (book.book_id)}
                            <div class="col-12 col-md-6 col-lg-4 col-xl-3">
                                <BookSearch owner_username={book.owner_username} owner_id={book.owner_id} title={book.book_title} book_id={book.book_id} description={book.book_description} book_cover_url={book.book_cover_url} />
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }
</style>