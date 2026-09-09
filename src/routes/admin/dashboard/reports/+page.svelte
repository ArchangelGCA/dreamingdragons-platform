<script>
    import ReportItem from "$lib/components/admin/ReportItem.svelte";
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
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Reports</h2>
        <p class="text-secondary small mb-2">{openReports.length} open · {closedReports.length} closed</p>
        <div class="btn-group btn-group-sm" role="group" aria-label="Filter by report type">
            <button type="button" class="btn {typeFilter === 'all' ? 'btn-purple' : 'btn-outline-secondary'}" onclick={() => typeFilter = 'all'} aria-pressed={typeFilter === 'all'}>All</button>
            <button type="button" class="btn {typeFilter === 'book' ? 'btn-purple' : 'btn-outline-secondary'}" onclick={() => typeFilter = 'book'} aria-pressed={typeFilter === 'book'}>Tales</button>
            <button type="button" class="btn {typeFilter === 'chapter' ? 'btn-purple' : 'btn-outline-secondary'}" onclick={() => typeFilter = 'chapter'} aria-pressed={typeFilter === 'chapter'}>Chapters</button>
        </div>
    </div>
</div>

<div class="accordion" id="reportsAccordion">
    <div class="accordion-item">
        <h2 class="accordion-header" id="openReportsHeading">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#openReports"
                    aria-expanded="true" aria-controls="openReports">
                <span>Open <span
                        class="{visibleOpen.length === 0 ? 'text-success-emphasis' : 'text-danger-emphasis'}">{visibleOpen.length}</span></span>
            </button>
        </h2>
        <div id="openReports" class="accordion-collapse collapse show" aria-labelledby="openReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if visibleOpen.length === 0}
                    <div class="text-center py-4">
                        <i class="fas fa-circle-check fa-2x mb-2 text-success" aria-hidden="true"></i>
                        <p class="mb-0">No open reports</p>
                    </div>
                {:else}
                    {#if openBooks.length > 0}
                        <h3 class="h6 text-center bg-danger bg-opacity-10 rounded-4 py-2">Tale reports ({openBooks.length})</h3>
                        <div class="row gy-2 mb-3" use:autoAnimate>
                            {#each openBooks as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if openChapters.length > 0}
                        <h3 class="h6 text-center bg-warning bg-opacity-10 rounded-4 py-2">Chapter reports ({openChapters.length})</h3>
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
                <span>Closed <span class="text-primary-emphasis">{visibleClosed.length}</span></span>
            </button>
        </h2>
        <div id="closedReports" class="accordion-collapse collapse" aria-labelledby="closedReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if visibleClosed.length === 0}
                    <div class="text-center py-4">
                        <i class="fas fa-folder-open fa-2x mb-2 text-secondary" aria-hidden="true"></i>
                        <p class="mb-0">No closed reports</p>
                    </div>
                {:else}
                    {#if closedBooks.length > 0}
                        <h3 class="h6 text-center bg-danger bg-opacity-10 rounded-4 py-2">Tale reports ({closedBooks.length})</h3>
                        <div class="row gy-2 mb-3" use:autoAnimate>
                            {#each closedBooks as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                    {#if closedChapters.length > 0}
                        <h3 class="h6 text-center bg-warning bg-opacity-10 rounded-4 py-2">Chapter reports ({closedChapters.length})</h3>
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
