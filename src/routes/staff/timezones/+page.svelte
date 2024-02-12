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
        console.log('User locale:', userLocale);
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
        window.$('[data-bs-toggle="tooltip"]').tooltip();
        const interval = setInterval(() => {
            time = new Date();
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<div class="container-fluid">
    <div class="row justify-content-center text-center my-3 pt-2 bg-danger bg-opacity-25 rounded-4">
        <div class="col-12">
            <span class="h1">Timezones</span>
            <p class="mb-2">Current time for different users:</p>
        </div>
    </div>
    <div class="row justify-content-center text-center my-3">
        <div class="col-12 px-0">
            <p class="fw-bold bg-warning bg-opacity-10 rounded-3 py-2">Your time is: {date}</p>
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