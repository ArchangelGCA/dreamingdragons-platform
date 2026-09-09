<script>
    import ReportItem from "$lib/components/admin/ReportItem.svelte";
    import AdminPageHeader from "$lib/components/admin/AdminPageHeader.svelte";
    import AdminEmpty from "$lib/components/admin/AdminEmpty.svelte";
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from "@formkit/auto-animate";

    /** @type {{data: any}} */
    let { data } = $props();
    let openReports = $derived(data.openReports ?? []);
    let closedReports = $derived(data.closedReports ?? []);
    let image_proxy = $derived(data.image_proxy);
    let typeFilter = $state('all');

    let visibleOpen = $derived(
        typeFilter === 'all' ? openReports : openReports.filter((r) => r.report_type === typeFilter)
    );
    let visibleClosed = $derived(
        typeFilter === 'all' ? closedReports : closedReports.filter((r) => r.report_type === typeFilter)
    );
    let openBooks = $derived(visibleOpen.filter((r) => r.report_type === 'book'));
    let openChapters = $derived(visibleOpen.filter((r) => r.report_type === 'chapter'));
    let closedBooks = $derived(visibleClosed.filter((r) => r.report_type === 'book'));
    let closedChapters = $derived(visibleClosed.filter((r) => r.report_type === 'chapter'));

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'book', label: 'Tales' },
        { value: 'chapter', label: 'Chapters' }
    ];
</script>

<AdminPageHeader title="Reports" subtitle="Triage what the community flagged." meta="{openReports.length} open · {closedReports.length} closed">
    {#snippet actions()}
        <div class="btn-group btn-group-sm" role="group" aria-label="Filter by report type">
            {#each filters as f (f.value)}
                <button
                    type="button"
                    class="btn {typeFilter === f.value ? 'btn-purple' : 'btn-outline-secondary'}"
                    onclick={() => typeFilter = f.value}
                    aria-pressed={typeFilter === f.value}
                >{f.label}</button>
            {/each}
        </div>
    {/snippet}
</AdminPageHeader>

<div class="accordion" id="reportsAccordion">
    <div class="accordion-item">
        <h2 class="accordion-header" id="openReportsHeading">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#openReports"
                    aria-expanded="true" aria-controls="openReports">
                <span>Open <span class="badge rounded-pill tnum {visibleOpen.length === 0 ? 'text-bg-success' : 'text-bg-danger'}">{visibleOpen.length}</span></span>
            </button>
        </h2>
        <div id="openReports" class="accordion-collapse collapse show" aria-labelledby="openReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if visibleOpen.length === 0}
                    <AdminEmpty icon="fa-circle-check" title="No open reports" hint="Everything triaged. Nice." />
                {:else}
                    {#if openBooks.length > 0}
                        <h3 class="h6 text-secondary mb-2">Tales ({openBooks.length})</h3>
                        <div class="row gy-2 mb-3" use:autoAnimate>
                            {#each openBooks as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if openChapters.length > 0}
                        <h3 class="h6 text-secondary mb-2">Chapters ({openChapters.length})</h3>
                        <div class="row gy-2" use:autoAnimate>
                            {#each openChapters as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
    <div class="accordion-item">
        <h2 class="accordion-header" id="closedReportsHeading">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#closedReports" aria-expanded="false" aria-controls="closedReports">
                <span>Closed <span class="badge rounded-pill text-bg-secondary tnum">{visibleClosed.length}</span></span>
            </button>
        </h2>
        <div id="closedReports" class="accordion-collapse collapse" aria-labelledby="closedReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if visibleClosed.length === 0}
                    <AdminEmpty icon="fa-folder-open" title="No closed reports" />
                {:else}
                    {#if closedBooks.length > 0}
                        <h3 class="h6 text-secondary mb-2">Tales ({closedBooks.length})</h3>
                        <div class="row gy-2 mb-3" use:autoAnimate>
                            {#each closedBooks as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if closedChapters.length > 0}
                        <h3 class="h6 text-secondary mb-2">Chapters ({closedChapters.length})</h3>
                        <div class="row gy-2" use:autoAnimate>
                            {#each closedChapters as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>
