<script>

    import {onMount} from "svelte";

    onMount(() => {
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
    });

    // Automatically update footer year
    const currentYear = new Date().getFullYear(); // Will use this in the footer to automatically update the year
</script>

<!-- TODO: Navbar -->

<slot></slot>

<!-- TODO: Footer -->

<style>

</style>