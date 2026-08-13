<script>
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import { createProfilePath, createBookPath, createChapterPath } from '$lib/utils/slugs.js';
    /** @type {{report: any, image_proxy?: string}} */
    let { report, closeReport, image_proxy = '' } = $props();

    let urlToOpen = $state('');
    if (report.report_type === 'book') {
        // Use placeholder title for admin reports since we don't have the actual book title
        urlToOpen = createBookPath('Book', report.book_id);
    } else if (report.report_type === 'chapter') {
        // Use placeholder titles for admin reports since we don't have the actual titles
        urlToOpen = createChapterPath('Book', report.book_id, 'Chapter', report.chapter_id);
    }

    let isCloseReportActive = false;

    function formatDate(date) {
        if (date === null) {
            return date;
        }
        const finalDate = new Date(date);
        if (finalDate === "Invalid Date" || isNaN(finalDate)) {
            return date;
        }
        return finalDate.toLocaleString();
    }

    async function handleCloseReport() {
        if (isCloseReportActive) return;

        if (!confirm('Are you sure you want to close this report?')) return;

        isCloseReportActive = true;

        const toastId = toast.push('Closing report...', {
            theme: {
                '--toastBackground': '#333',
                '--toastColor': '#fff',
            },
        });

        const formData = new FormData();
        formData.append('report_id', report.id);

        const response = await fetch('?/close_report', {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Report closed successfully', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    },
                });
                closeReport(report.id);
            } else {
                toast.push('Failed to close report', {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    },
                });
            }
        } else {
            toast.push('Failed to close report', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                },
            });
        }


        isCloseReportActive = false;
    }
</script>

<div class="card bg-black bg-opacity-25 shadow">
    <div class="card-title text-uppercase bg-light bg-opacity-10 p-2 rounded-2 mb-0">
        {report.report_type} <span class="fs-6 text-muted">{formatDate(report.created_at)}</span>
        <br>
        <UserAvatarNavbar url={report.profiles.avatar_url} username={report.profiles.username} image_proxy={image_proxy} size="25px" /> <a class="text-warning-emphasis fs-7 text-decoration-none" href={createProfilePath(report.profiles.username, report.profiles.id)}>{report.profiles.username}</a>
    </div>
    <div class="card-body">
        <p class="card-text">{report.report_description}</p>
        <hr>
        <div class="row">
            <div class="col-12">
                <a class="btn btn-open w-100" href="{urlToOpen}" target="_blank">Open {(report.book_id && report.chapter_id) ? 'Chapter' : 'Book'}</a>
            </div>
            <div class="col-12">
                {#if !report.is_closed}
                    <button class="btn btn-danger w-100 mt-2" onclick={handleCloseReport}>
                        Close Report
                    </button>
                {:else}
                    <div class="alert alert-success mt-2 mb-0" role="alert">
                        Report closed
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .btn-open {
        background-color: #5c00a6;
        color: #fff;
    }

    .btn-open:hover {
        background-color: #4d0090;
        color: #fff;
    }

    .fs-7 {
        font-size: 0.875rem;
    }
</style>