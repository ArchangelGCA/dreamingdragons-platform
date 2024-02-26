<script>
    import {onMount} from "svelte";

    export let data;

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    let chapterContent = data.chapterContent[0];

    console.log(chapterContent);
</script>

<h1 class="text-center">TODO</h1>