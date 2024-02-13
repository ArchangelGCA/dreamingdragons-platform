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
        background: linear-gradient(45deg, #1b1e21, #3a3f44, #1b1e21);
        transition: all 0.2s ease-in-out;
    }

    .staff-card:hover {
        transform: scale(1.03);
    }

    .card-header {
        font-size: 1.5em;
        color: #f8f9fa;
    }

    .card-title {
        font-size: 1.2em;
        color: #f8f9fa;
    }

    .card-text {
        font-size: 1em;
        color: #adb5bd;
    }

    i.fa-user-shield {
        color: #e83e8c;
    }

    i.fa-user {
        color: #fd7e14;
    }

    i.fa-clock {
        color: #0dcaf0;
    }

    i.fa-calendar-alt {
        color: #20c997;
    }

    i.fa-globe {
        color: #6610f2;
    }

    i {
        margin-right: 5px;
    }
</style>