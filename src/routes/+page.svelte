<script>
    import {onMount} from "svelte";

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<div class="container-fluid">
    <div class="row">
        <div class="col">
            <h1 class="text-center">If you can see this, the project is working!</h1>
        </div>
    </div>
</div>