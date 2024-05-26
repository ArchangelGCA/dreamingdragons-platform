<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    export let title = "";
    export let description = "";
    export let keywords = "";
    export let canonical = "";
    export let siteName = "";
    export let imageURL = "";
    export let logo = "";
    export let author = "";
    export let name = "";
    export let index = true;
    export let twitter = false;
    export let openGraph = true;
    export let schemaOrg = false;
    export let socials = [];

    let Ld = {
        "@context": "https://schema.org",
        "@type": ['Person', 'Organization'],
        "name": `${name}`,
        "url": "",
        "image": `${imageURL}`,
        logo: {
            "@type": "ImageObject",
            "url": `${logo}`,
            "width": 48,
            "height": 48
        },
        "sameAs": socials
    };

    onMount(() => {
        Ld.url = `${$page.url.origin}`;
    });

    $: jsonLdScript = `<script type="application/ld+json">${JSON.stringify(Ld)}${'<'}/script>`;
</script>

<svelte:head>
    {#if title}
        <meta name="robots" content={index ? "index, follow" : "noindex"} />
        <title>{title}</title>
        <link rel="canonical" href={canonical || $page.url.href} />
    {/if}
    {#if description}
        <meta name="description" content={description} />
    {/if}
    {#if keywords}
        <meta name="keywords" content={keywords} />
    {/if}
    {#if author}
        <meta name="author" content={author} />
    {/if}
    {#if openGraph}
        {#if siteName}
            <meta property="og:site_name" content={siteName} />
        {/if}
        <meta property="og:url" content={$page.url.href} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageURL} />
    {/if}
    {#if twitter}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={$page.url.host} />
        <meta property="twitter:url" content={$page.url.href} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageURL} />
    {/if}
    {#if schemaOrg || socials.length > 0 || logo || name}
        {@html jsonLdScript}
    {/if}
</svelte:head>