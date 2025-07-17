<script>
    import Masonry from '$lib/components/sveltebricks/Masonry.svelte';
    import ContentMasonry from '$lib/components/pages/ContentMasonry.svelte';

    let {data} = $props();
    let {gallery} = $state(data);
    let width = $state(0), height = $state(0);
    let [minColWidth, gap] = [350, 10];

    let books = $derived(gallery.gallery_books.map(gb => gb.book));
</script>

<svelte:head>
    <title>{gallery.name} by {gallery.owner.username}</title>
    <meta name="description" content={gallery.description}/>
</svelte:head>

<div class="container">
    <div class="row my-4">
        <div class="col-12">
            <h1>{gallery.name}</h1>
            <p class="lead">A gallery by <a href="/profile/{gallery.owner.id}">{gallery.owner.username}</a></p>
            {#if gallery.description}
                <p>{gallery.description}</p>
            {/if}
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <Masonry items={books}
                     {minColWidth}
                     {gap}
                     animate={true}

                     bind:masonryWidth={width}
                     bind:masonryHeight={height}
            >
                {#snippet children({item})}
                    <ContentMasonry book={item}/>
                {/snippet}
            </Masonry>
        </div>
    </div>
</div>
