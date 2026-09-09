<script>
    import AdminDialog from "$lib/components/admin/AdminDialog.svelte";
    import { toast } from "$lib/components/svelte-toast";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import { createProfilePath, createBookPath, createChapterPath } from '$lib/utils/slugs.js';
    import { formatAdminDate, postAdminAction } from "$lib/utils/admin.js";
    import { notifyError, notifySuccess, notifyWorking } from "$lib/utils/admin-notify.js";
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

    let confirmOpen = $state(false);
    let busy = $state(false);

    async function handleCloseReport() {
        if (busy) return;
        busy = true;
        const toastId = notifyWorking('Closing report...');
        try {
            const formData = new FormData();
            formData.append('report_id', report.id);
            const result = await postAdminAction('close_report', formData);
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                notifySuccess('Report closed');
                confirmOpen = false;
                closeReport(report.id);
            } else {
                notifyError('Could not close report.');
            }
        } catch {
            toast.pop(toastId);
            notifyError('Could not close report.');
        } finally {
            busy = false;
        }
    }
</script>

<div class="admin-card p-3">
    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
        {#if report.report_type === 'book'}
            <span class="badge rounded-pill text-bg-danger">Tale</span>
        {:else}
            <span class="badge rounded-pill text-bg-warning">Chapter</span>
        {/if}
        {#if report.is_closed}
            <span class="badge rounded-pill text-bg-success">Closed</span>
        {:else}
            <span class="badge rounded-pill chip-purple">Open</span>
        {/if}
        <span class="small text-secondary tnum ms-auto">{formatAdminDate(report.created_at)}</span>
    </div>
    <div class="d-flex align-items-center gap-2 mb-2">
        <UserAvatarNavbar url={report.profiles.avatar_url} username={report.profiles.username} image_proxy={image_proxy} size="25px" />
        <a class="text-warning-emphasis small text-decoration-none text-truncate" href={createProfilePath(report.profiles.username, report.profiles.id)}>{report.profiles.username}</a>
    </div>
    <p class="small mb-3">{report.report_description}</p>
    <div class="d-flex flex-column flex-sm-row gap-2">
        <a class="btn btn-sm btn-purple flex-fill" href={urlToOpen} target="_blank" rel="noopener noreferrer">
            Open {(report.book_id && report.chapter_id) ? 'chapter' : 'tale'}
            <i class="fas fa-arrow-up-right-from-square ms-1" aria-hidden="true"></i>
        </a>
        {#if !report.is_closed}
            <button class="btn btn-sm btn-outline-danger flex-fill" disabled={busy} onclick={() => confirmOpen = true}>
                Close report
            </button>
        {/if}
    </div>
</div>

<AdminDialog
    open={confirmOpen}
    title="Close this report?"
    confirmLabel="Close report"
    {busy}
    onClose={() => { if (!busy) confirmOpen = false; }}
    onConfirm={handleCloseReport}
>
    <p class="mb-0">The report moves to Closed. The reported tale or chapter itself is untouched.</p>
</AdminDialog>
