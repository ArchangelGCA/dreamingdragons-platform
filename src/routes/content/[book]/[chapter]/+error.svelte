<script>
    import { page } from '$app/stores';
</script>

<div class="row mt-3">
    <div class="col">
        <h1>{$page.status}!</h1>
        <p>🤔 {$page.error.message}</p>
    </div>
</div>