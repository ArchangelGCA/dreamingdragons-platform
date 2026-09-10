<script>
    /** @type {{data: any}} */
    let { data } = $props();

    let { updates } = $derived(data);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Second variant of formatdate with only hours and minutes
    const formatTime = (dateString) => {
        const options = { hour: 'numeric', minute: 'numeric'};
        return new Date(dateString).toLocaleTimeString(undefined, options);
    }
</script>

<div class="container mt-3">
    <div class="row">
        <div class="col-md-12">
            <h1 class="text-center mb-4 bg-animated-gradient py-2 rounded-4">🚀 Website Updates</h1>
            <p class="text-center mb-4">DreamingDragons Tales Platform Updates</p>
            {#each updates as update (update.id)}
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-pencil"></i> {formatDate(update.created_at)} <span class="text-muted text-sm">{formatTime(update.created_at)}</span></h5>
                        <div class="card-text text-secondary-emphasis">{@html update.content}</div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .bg-animated-gradient {
        background-color: var(--dd-deep-1);
        background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 22%);
    }

    .card {
        background-color: rgba(var(--dd-accent-rgb),0.12);
        border: 1px solid var(--dd-edge);
        box-shadow: 0 0 10px rgba(var(--dd-bright-rgb),0.25);
    }

    .fa-pencil {
        color: var(--dd-accent-bright);
    }

    .text-sm {
        font-size: 0.8rem;
    }
</style>