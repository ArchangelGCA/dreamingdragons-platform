<script>
    import {onMount} from 'svelte';
    import {browser} from "$app/environment";

    /** @type {{username: any, timezone: any, country?: string}} */
    let { username, timezone, country = '' } = $props();

    let time = $state();
    let userLocale = "en-US";
    let is12Hour = true;

    if (browser){
        userLocale = navigator.language;
        is12Hour = new Intl.DateTimeFormat(userLocale, {hour: '2-digit'}).formatToParts(new Date()).find(x => x.type === 'dayPeriod') !== undefined;
    }

    onMount(() => {
        const interval = setInterval(() => {
            time = new Date().toLocaleTimeString(userLocale, { timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: is12Hour });
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<div class="card text-white bg-dark mb-3 staff-card text-center">
    <div class="card-header fw-bold">
        <i class="fas fa-user-shield"></i> {username}'s Clock
    </div>
    <div class="card-body">
        <h5 class="card-title fw-bold">
            <i class="fas fa-user"></i> {username}
        </h5>
        <p class="card-text pt-2">
            <i class="fas fa-clock"></i> Timezone: <b>{timezone}</b>
        </p>
        <p class="card-text">
            <i class="fas fa-calendar-alt"></i> Local Time: <br><span class="fs-3">{time}</span>
        </p>
        {#if country}
            <p class="card-text">
                <i class="fas fa-globe"></i> Country: <b>{country}</b>
            </p>
        {/if}
    </div>
</div>

<style>
    .staff-card {
        background: var(--dd-surface);
        border: 1px solid var(--dd-edge);
        transition: all 0.1s ease-in-out;
    }

    .staff-card:hover {
        transform: scale(1.03);
        background: var(--dd-surface-2);
        border-color: rgba(var(--dd-bright-rgb), 0.3);
    }

    span.fs-3 {
        color: var(--text-color);
    }

    .card-header {
        font-size: 1.5em;
        color: var(--text-color);
    }

    .card-title {
        font-size: 1.2em;
        color: var(--text-secondary);
    }

    .card-text {
        font-size: 1em;
        color: var(--text-secondary);
    }

    i.fa-user-shield {
        color: var(--dd-gold);
    }

    i.fa-user {
        color: var(--dd-accent-bright);
    }

    i.fa-clock {
        color: var(--dd-accent);
    }

    i.fa-calendar-alt {
        color: var(--dd-accent-bright);
    }

    i.fa-globe {
        color: var(--dd-gold-soft);
    }

    i {
        margin-right: 5px;
    }
</style>