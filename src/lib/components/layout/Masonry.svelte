<div bind:this={masonryElement}
     class={`__grid--masonry ${stretchFirst ? '__stretch-first' : ''}`}
     style={`--grid-gap: ${gridGap}; --col-width: ${colWidth}; --col-width-mobile: ${colWidthMobile};`}
     use:autoAnimate>
    <slot></slot>
</div>

<script>
    import {onMount, onDestroy, tick} from 'svelte';
    import autoAnimate from '@formkit/auto-animate';

    export let stretchFirst = false,
        gridGap = '0.5em',
        colWidth = 'minmax(Min(20em, 100%), 1fr)',
        colWidthMobile = 'minmax(Min(10em, 100%), 1fr)',
        items = [];
    let grids = [], masonryElement;

    export let reset = null;
    $: if (reset) {
        masonryElement = masonryElement;
    }

    export const refreshLayout = async () => {
        for (const grid of grids) {
            let ncol = getComputedStyle(grid._el).gridTemplateColumns.split(' ').length;
            grid.items.forEach(c => {
                let new_h = c.getBoundingClientRect().height;
                if (new_h !== +c.dataset.h) {
                    c.dataset.h = new_h
                    grid.mod++
                }
            });

            if (grid.ncol !== ncol || grid.mod) {
                grid.ncol = ncol;
                grid.items.forEach(c => c.style.removeProperty('margin-top'))
                if (grid.ncol > 1) {
                    grid.items.slice(ncol).forEach((c, i) => {
                        let prev_fin = grid.items[i].getBoundingClientRect().bottom,
                            curr_ini = c.getBoundingClientRect().top;
                        c.style.marginTop = `${prev_fin + grid.gap - curr_ini}px`;
                    });
                }
                grid.mod = 0;
            }
        }
    }

    const calcGrid = async (_masonryArr) => {
        await tick()
        if (_masonryArr.length && getComputedStyle(_masonryArr[0]).gridTemplateRows !== 'masonry') {
            grids = _masonryArr.map(grid => {
                return {
                    _el: grid,
                    gap: parseFloat(getComputedStyle(grid).rowGap),
                    items: [...grid.childNodes].filter(c => c.nodeType === 1 && +getComputedStyle(c).gridColumnEnd !== -1),
                    ncol: 0,
                    mod: 0
                };
            });
            await refreshLayout();
        }
    }

    let _window;
    onMount(() => {
        _window = window;
        _window.addEventListener('resize', refreshLayout, false);
    })
    onDestroy(() => {
        if (_window) {
            _window.removeEventListener('resize', refreshLayout, false);
        }
    })

    $: if (masonryElement) {
        calcGrid([masonryElement])
    }

    $: if (items) {
        masonryElement = masonryElement;
    }
</script>

<style>
    :global(.__grid--masonry) {
        display: grid;
        grid-template-columns: repeat(auto-fit, var(--col-width));
        /* grid-template-rows: masonry; */ /* NOT SUPPORTED YET */
        grid-template-rows: auto;
        justify-content: center;
        grid-gap: var(--grid-gap);
        padding: var(--grid-gap);
    }

    :global(.__grid--masonry > *) {
        align-self: start
    }

    :global(.__grid--masonry.__stretch-first > *:first-child) {
        grid-column: 1/ -1;
    }

    @media (max-width: 768px) {
        :global(.__grid--masonry) {
            grid-template-columns: repeat(auto-fit, var(--col-width-mobile));
        }
    }
</style>