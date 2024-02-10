<script>
    import { invalidate } from '$app/navigation'
    import {onMount} from "svelte";
    import favicon from "$lib/images/favicon.webp";
    import { SvelteToast } from '@zerodevx/svelte-toast'

    export let data;

    let { supabase, session } = data;
    $: ({ supabase, session } = data);

    onMount(() => {

        const { data } = supabase.auth.onAuthStateChange((event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth');
            }
        })

        // Close navbar when open another page, with animation
        document.querySelectorAll('.nav-link').forEach((element) => {
            element.addEventListener('click', () => {
                document.querySelector('.navbar-collapse').classList.remove('show');
            });
        });

        window.$('[data-bs-toggle="tooltip"]').tooltip();

        // Init AOS
        AOS.init({
            once: true,
        });
        window.AOS = AOS;

        return () => data.subscription.unsubscribe();
    });

    // Socials
    const socials = [
        {
            name: 'Discord',
            icon: 'fab fa-discord',
            link: 'https://discord.gg/F6cpNm9fZU', // TODO: Needs to be updated
        },
        {
            name: 'Github',
            icon: 'fab fa-github',
            link: 'https://github.com/ArchangelGCA',
        },
    ];


    const currentYear = new Date().getFullYear(); // Will use this in the footer to automatically update the year

    const owner = 'Roses In The Flames Official'

    const designedBy = 'Contributors of RiTF';
    const designedByLink = 'https://archangelgca.eu';

    const tosLink = '/tos'
    const privacyPolicyLink = '/privacy-policy'

    const copyright = `© ${currentYear} ${owner}. All rights reserved.`;

</script>

<SvelteToast />

<div class="row border-bottom border-light-subtle py-2">
    <div class="col-2">
        <a href="/">
            <img src={favicon} alt="Logo" width="40" height="40" data-bs-toggle="tooltip" data-bs-placement="right" title="Homepage" /> <!-- TODO: Use enhanced logo -->
        </a>
    </div>
    <div class="col-10 text-end">
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle animate-button" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-user"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                <li><a class="dropdown-item" href="/profile">Profile</a></li>
                <li><a class="dropdown-item" href="/settings">Settings</a></li>
                <li><a class="dropdown-item animate-button rounded-3 py-2" href="/upload">Upload</a></li>
                <li><a class="dropdown-item" href="/settings?/signout" data-sveltekit-preload-data="tap">Logout</a></li>
            </ul>
        </div>
    </div>
</div>

<slot></slot>

<div class="row border-top border-light-subtle pt-3 pb-2">
    <div class="col">
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">Designed by: <a href="{designedByLink}" data-bs-toggle="tooltip" title="Visit Developer" target="_blank">{designedBy}</a></p>
            </div>
        </div>
        <!-- Socials -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center mb-1">Follow us on:</p>
                <p class="fs-4 text-center">
                    {#each socials as social}
                        <a href="{social.link}" target="_blank" data-bs-toggle="tooltip" title="Open {social.name}" class="text-decoration-none text-light px-1"><i class="{social.icon}"></i></a>
                    {/each}
                </p>
            </div>
        </div>
        <!-- Links to TOS and Privacy Policy -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">For Terms of Service and Privacy Policy, please visit: <a href="{tosLink}" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top" title="Terms Of Service" class="text-decoration-none text-light">TOS</a> and <a href="{privacyPolicyLink}" target="_blank" data-bs-toggle="tooltip" data-bs-placement="top" title="Privacy Policy" class="text-decoration-none text-light">Privacy Policy</a>.</p>
            </div>
        </div>
        <!-- Copyright -->
        <div class="row">
            <div class="col">
                <p class="fs-6 text-center">{copyright}</p>
            </div>
        </div>
    </div>
</div>

<style>
    .animate-button {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 5s ease infinite, tranform 1s ease-in-out;
    }

    .animate-button:hover {
        background: linear-gradient(230deg, #0b0086, #5c00a6);
    }

    .animate-button:active {
        transform: scale(0.95);
    }

    @keyframes Gradient {
        0% {background-position: 0% 50%;}
        50% {background-position: 100% 50%;}
        100% {background-position: 0% 50%;}
    }
</style>