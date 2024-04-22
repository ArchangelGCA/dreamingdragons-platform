<script>
    import Seo from "sk-seo";

    export let data;

    let { updates } = data;
    $: ({updates} = data);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Second variant of fomatdate with only hours and minutes
    const formatTime = (dateString) => {
        const options = { hour: 'numeric', minute: 'numeric'};
        return new Date(dateString).toLocaleTimeString(undefined, options);
    }

    const seo = {
        title: 'Roses In The Flames | Updates',
        description: 'Updates and changelogs of the Roses In The Flames website.',
        siteName: 'Roses In The Flames | Tales',
        imageURL: 'https://tales.rosesintheflames.com/favicon.webp',
        author: 'ArchangelGCA'
    };
</script>

<Seo {...seo} />

<div class="container mt-3">
    <div class="row">
        <div class="col-md-12">
            <h1 class="text-center mb-4 bg-animated-gradient py-2 rounded-4">Website Updates</h1>
            <p class="text-center mb-4">Here we will share all changelogs and updates made to the website.</p>
            {#each updates as update}
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-pencil"></i> {formatDate(update.created_at)} <span class="text-muted text-sm">{formatTime(update.created_at)}</span></h5>
                        <p class="card-text text-secondary-emphasis">{@html update.content}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .bg-animated-gradient {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite, tranform 1s ease-in-out;
    }

    .card {
        background-color: rgba(92, 0, 166, 0.3);
        border: 1px solid #bd135a;
        box-shadow: 0 0 10px rgb(139, 0, 255);
    }

    .fa-pencil {
        color: #bd135a;
    }

    .text-sm {
        font-size: 0.8rem;
    }

    @keyframes Gradient {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
    }
</style>