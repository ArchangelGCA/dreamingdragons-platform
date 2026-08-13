<script>
    let {data} = $props();
    let {testUrl, oembedUrl} = $derived(data);

    let oembedData = $state(null);
    let loading = $state(false);
    let error = $state(null);

    async function testOembed() {
        loading = true;
        error = null;

        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            oembedData = await response.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>oEmbed Test</title>
</svelte:head>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <h1>oEmbed Test Page</h1>

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Test oEmbed Endpoint</h5>
                    <p class="card-text">
                        <strong>Test URL:</strong> {testUrl}<br>
                        <strong>oEmbed URL:</strong> {oembedUrl}
                    </p>

                    <button
                            class="btn btn-primary"
                            onclick={testOembed}
                            disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Test oEmbed'}
                    </button>
                </div>
            </div>

            {#if error}
                <div class="alert alert-danger">
                    <strong>Error:</strong> {error}
                </div>
            {/if}

            {#if oembedData}
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">oEmbed Response</h5>
                        <pre class="bg-light p-3 rounded">{JSON.stringify(oembedData, null, 2)}</pre>

                        {#if oembedData.html}
                            <div class="mt-3">
                                <h6>HTML Preview:</h6>
                                <div class="border p-3 rounded bg-white">
                                    {@html oembedData.html}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
