<script>
    import ReportItem from "$lib/components/admin/ReportItem.svelte";
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from "@formkit/auto-animate";

    /** @type {{data: any}} */
    let { data } = $props();

    let {openReports, closedReports, image_proxy} = $state(data);
    $effect(() => {
        ({openReports, closedReports} = data);
    });
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Reports</h2>
    </div>
</div>

<div class="accordion" id="reportsAccordion">
    <div class="accordion-item">
        <h2 class="accordion-header" id="openReportsHeading">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#openReports"
                    aria-expanded="true" aria-controls="openReports">
                <span>Open Reports <span
                        class="{openReports.length === 0 ? 'text-success-emphasis' : 'text-danger-emphasis'}">{openReports.length}</span></span>
            </button>
        </h2>
        <div id="openReports" class="accordion-collapse collapse show" aria-labelledby="openReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if openReports.length === 0}
                    <div class="col-12 text-center">
                        <h3 class="mt-1 mb-0">No open reports</h3>
                    </div>
                {:else}
                    <h3 class="collapsible-title text-center link-book bg-danger bg-opacity-10 rounded-4 py-3"
                        data-bs-toggle="collapse" data-bs-target="#openBookReports">Book Reports <i
                            class="fas fa-chevron-down"></i></h3>
                    <div id="openBookReports" class="collapse">
                        <div class="row gy-2" use:autoAnimate>
                            {#each openReports.filter(report => report.report_type === 'book') as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <h3 class="collapsible-title text-center link-chapter bg-warning bg-opacity-10 rounded-4 py-3 mt-4"
                        data-bs-toggle="collapse" data-bs-target="#openChapterReports">Chapter Reports <i
                            class="fas fa-chevron-down"></i></h3>
                    <div id="openChapterReports" class="collapse">
                        <div class="row gy-2" use:autoAnimate>
                            {#each openReports.filter(report => report.report_type === 'chapter') as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} {image_proxy} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    <div class="accordion-item">
        <h2 class="accordion-header" id="closedReportsHeading">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#closedReports" aria-expanded="false" aria-controls="closedReports">
                <span>Closed Reports <span class="text-primary-emphasis">{closedReports.length}</span></span>
            </button>
        </h2>
        <div id="closedReports" class="accordion-collapse collapse" aria-labelledby="closedReportsHeading"
             data-bs-parent="#reportsAccordion">
            <div class="accordion-body">
                {#if closedReports.length === 0}
                    <div class="col-12 text-center">
                        <h3 class="mt-1 mb-0">No closed reports</h3>
                    </div>
                {:else}
                    <h3 class="collapsible-title text-center link-book bg-danger bg-opacity-10 rounded-4 py-3"
                        data-bs-toggle="collapse" data-bs-target="#openBookReports">Book Reports <i
                            class="fas fa-chevron-down"></i></h3>
                    <div id="openBookReports" class="collapse">
                        <div class="row gy-2" use:autoAnimate>
                            {#if closedReports.filter(report => report.report_type === 'book').length === 0}
                                <div class="col-12 text-center">
                                    <h3 class="mt-1 mb-0">No closed book reports</h3>
                                </div>
                            {/if}
                            {#each closedReports.filter(report => report.report_type === 'book') as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    </div>
                    <h3 class="collapsible-title text-center link-chapter bg-warning bg-opacity-10 rounded-4 py-3 mt-4"
                        data-bs-toggle="collapse" data-bs-target="#openChapterReports">Chapter Reports <i
                            class="fas fa-chevron-down"></i></h3>
                    <div id="openChapterReports" class="collapse">
                        <div class="row gy-2" use:autoAnimate>
                            {#if closedReports.filter(report => report.report_type === 'chapter').length === 0}
                                <div class="col-12 text-center">
                                    <h3 class="mt-1 mb-0">No closed chapter reports</h3>
                                </div>
                            {/if}
                            {#each closedReports.filter(report => report.report_type === 'chapter') as report (report.id)}
                                <div class="col-12">
                                    <ReportItem {report} closeReport={() => {invalidateAll()}}/>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .link-book {
        cursor: pointer;
    }

    .link-book:hover {
        color: #ff69b9;
    }

    .link-chapter {
        cursor: pointer;
    }

    .link-chapter:hover {
        color: #ff916f;
    }
</style>

