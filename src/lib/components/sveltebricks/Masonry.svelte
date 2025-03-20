<!-- Compiled version of svelte-bricks Masonry component, edited for support for Bootstrap -->
<script>
    import {flip} from 'svelte/animate';
    import {fade} from 'svelte/transition';

    let {
        animate = true,
        calcCols = (masonryWidth, minColWidth, gap) => {
            return Math.min(items.length, Math.floor((masonryWidth + gap) / (minColWidth + gap)) || 1);
        },
        columnClass = ``,
        duration = 200,
        gap = 20,
        getId = (item) => {
            if (typeof item === `number`)
                return item;
            if (typeof item === `string`)
                return item;
            return item[idKey];
        },
        idKey = `id`,
        items,
        masonryHeight = $bindable(0),
        masonryWidth = $bindable(0),
        maxColWidth = 500,
        minColWidth = 330,
        style = ``,
        class: className = ``,
        children,
        div = $bindable(undefined), // TODO add unit test for this prop
    } = $props();

    $effect.pre(() => {
        if (maxColWidth < minColWidth) {
            console.warn(`svelte-bricks: maxColWidth (${maxColWidth}) < minColWidth (${minColWidth}).`);
        }
    });

    let nCols = $derived(calcCols(masonryWidth, minColWidth, gap));
    let itemsToCols = $derived(items.reduce((cols, item, idx) => {
        cols[idx % cols.length].push([item, idx]);
        return cols;
    }, Array(nCols).fill(null).map(() => [])));
</script>

<div
        class="masonry {className}"
        bind:clientWidth={masonryWidth}
        bind:clientHeight={masonryHeight}
        bind:this={div}
        style="gap: {gap}px; {style}"
>
    {#each itemsToCols as col, idx}
        <div class="col-id col-id-{idx} {columnClass}" style="gap: {gap}px; max-width: {maxColWidth}px;">
            {#if animate}
                {#each col as [item, idx] (getId(item))}
                    <div
                            in:fade={{ delay: 100, duration }}
                            out:fade={{ delay: 0, duration }}
                            animate:flip={{ duration }}
                    >
                        {#if children}{@render children({idx, item})}{:else}
                            <span>{item}</span>
                        {/if}
                    </div>
                {/each}
            {:else}
                {#each col as [item, idx] (getId(item))}
                    {#if children}{@render children({idx, item})}{:else}
                        <span>{item}</span>
                    {/if}
                {/each}
            {/if}
        </div>
    {/each}
</div>

<style>
    :where(div.masonry) {
        display: flex;
        justify-content: center;
        overflow-wrap: anywhere;
        box-sizing: border-box;
    }

    :where(div.masonry div.col-id) {
        display: grid;
        height: max-content;
        width: 100%;
    }
</style>