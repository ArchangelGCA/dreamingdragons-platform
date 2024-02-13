<script>
    import {onMount} from 'svelte';
    import {browser} from "$app/environment";

    export let username;
    export let timezone;
    export let country = '';

    let time;
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
            <i class="fas fa-clock"></i> Timezone: {timezone}
        </p>
        <p class="card-text">
            <i class="fas fa-calendar-alt"></i> Local Time: <br><span class="fs-3">{time}</span>
        </p>
        {#if country}
            <p class="card-text">
                <i class="fas fa-globe"></i> Country: {country}
            </p>
        {/if}
    </div>
</div>

<style>
    .staff-card {
        background: linear-gradient(45deg, #120339, #4B0082, #120339);
        transition: all 0.15s ease-in-out;
    }

    .staff-card:hover {
        transform: scale(1.03);
    }

    span.fs-3 {
        color: #ffffff;
    }

    .card-header {
        font-size: 1.5em;
        color: #ffffff;
    }

    .card-title {
        font-size: 1.2em;
        color: #c2c2c2;
    }

    .card-text {
        font-size: 1em;
        color: #c2c2c2;
    }

    i.fa-user-shield {
        color: #ff8c00;
    }

    i.fa-user {
        color: #00bfff;
    }

    i.fa-clock {
        color: #32cd32;
    }

    i.fa-calendar-alt {
        color: #ff00ff;
    }

    i.fa-globe {
        color: #ff4500;
    }

    i {
        margin-right: 5px;
    }
</style>