<script>
    import {onMount} from "svelte";
    import autoAnimate from '@formkit/auto-animate';

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>

<div class="container-fluid my-3" style="min-height: 69vh">
    <div class="row justify-content-center">
        <div class="col text-center">
            <i class="fa-solid fa-helmet-safety fa-5x text-warning" use:autoAnimate></i>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <h1 class="text-center">Coming Soon!</h1>
        </div>
    </div>
</div>