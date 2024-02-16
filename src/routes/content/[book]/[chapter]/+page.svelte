<script>
    import {onMount} from "svelte";

    export let data;

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<h1 class="text-center">TODO</h1>