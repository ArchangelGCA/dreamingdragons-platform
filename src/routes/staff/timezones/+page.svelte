<script>
    import {onMount} from "svelte";
    import StaffTime from "$lib/components/profile/StaffTime.svelte";
    import {browser} from "$app/environment";

    export let data;
    let { timedata } = data;

    let time = new Date();

    let userLocale = "en-US";
    let is12Hour = true;

    if (browser){
        userLocale = navigator.language;
        is12Hour = new Intl.DateTimeFormat(userLocale, {hour: '2-digit'}).formatToParts(new Date()).find(x => x.type === 'dayPeriod') !== undefined;
    }

    $: date = time.toLocaleString(userLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: is12Hour
    });

    onMount(() => {
        const interval = setInterval(() => {
            time = new Date();
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<div class="container-fluid">
    <div class="row justify-content-center text-center my-3 pt-2 bg-animated bg-opacity-25 rounded-4">
        <div class="col-12">
            <span class="h1">Timezones</span>
            <p class="mb-2">Current time for different users:</p>
        </div>
    </div>
    <div class="row justify-content-center text-center my-3">
        <div class="col-12 px-0">
            <p class="fw-bold bg-primary bg-opacity-25 rounded-3 py-2">Your time is: {date}</p>
        </div>
    </div>
    <div class="row justify-content-around mb-3">
        {#each timedata as member (member.username)}
            <div class="col-12 col-xl-4 px-0 px-xl-2">
                <StaffTime {...member}/>
            </div>
        {/each}
    </div>
</div>

<style>
    .bg-animated {
        background: linear-gradient(270deg, #0b0086, #5c00a6, #0b0086);
        background-size: 200% 200%;
        animation: Gradient 5s ease infinite, tranform 1s ease-in-out;
    }

    @keyframes Gradient {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
    }
</style>