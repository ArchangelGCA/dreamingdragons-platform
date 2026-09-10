<script>
    import {tooltip} from "svelte-tooltip-gca";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {toast} from "$lib/components/svelte-toast";
    import {invalidateAll} from "$app/navigation";
    import AdminStat from "$lib/components/admin/AdminStat.svelte";
    import AdminPageHeader from "$lib/components/admin/AdminPageHeader.svelte";
    import {postAdminAction} from "$lib/utils/admin.js";
    import {notifyError, notifySuccess, notifyWorking} from "$lib/utils/admin-notify.js";

    /** @type {{data: any}} */
    let { data } = $props();
    let panicWrap = $derived(data.panic);
    // Server returns { panic: {...} }; tolerate a flat shape too.
    let panicObj = $derived(panicWrap?.panic ?? panicWrap ?? {});
    let stats = $derived(data.stats ?? { users: null, books: null, chapters: null, openReports: null });
    let isPanicAction = $state(false);

    const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString());

    async function handlePanic() {
        if (isPanicAction) return;
        isPanicAction = true;

        const active = Boolean(panicObj?.is_active);
        const action = active ? 'disable_panic' : 'enable_panic';
        const toastId = notifyWorking(active ? 'Disabling panic mode...' : 'Enabling panic mode...');

        try {
            const result = await postAdminAction(action, new FormData());
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                notifySuccess(result.data.body.message);
                await invalidateAll();
            } else {
                notifyError(result.data?.body?.message ?? 'Error during toggle action');
            }
        } catch {
            toast.pop(toastId);
            notifyError('Error during toggle action');
        } finally {
            isPanicAction = false;
        }
    }

    let panicActive = $derived(Boolean(panicObj?.is_active ?? false));
</script>

<AdminPageHeader title="Dashboard" subtitle="Health at a glance — pick a section to act." />

<div class="row g-3 mb-3">
    <div class="col-6 col-xl-3">
        <AdminStat icon="fa-users" label="Creators" value={fmt(stats.users)} href="/admin/dashboard/users" linkLabel="Manage users" tip="Search, warn, manage uploads" />
    </div>
    <div class="col-6 col-xl-3">
        <AdminStat icon="fa-book-open" label="Tales" value={fmt(stats.books)} href="/admin/dashboard/content" linkLabel="Review tales" tip="Edit or remove tales and chapters" />
    </div>
    <div class="col-6 col-xl-3">
        <AdminStat icon="fa-feather" label="Chapters" value={fmt(stats.chapters)} href="/admin/dashboard/content" linkLabel="Review chapters" tip="Chapters live under their tale" />
    </div>
    <div class="col-6 col-xl-3">
        <AdminStat
            icon="fa-flag"
            label="Open reports"
            value={fmt(stats.openReports)}
            href="/admin/dashboard/reports"
            linkLabel="Triage reports"
            tip="Reports waiting for review"
            accent={(stats.openReports ?? 0) > 0 ? 'danger' : 'success'}
        />
    </div>
</div>

<div class="row g-3">
    <div class="col-12 col-lg-6">
        <div class="card rounded-4 h-100 bg-black bg-opacity-25 {panicActive ? 'border-danger' : 'border-purple'}">
            <div class="card-body d-flex align-items-center gap-3 p-3">
                <div class="panic-icon {panicActive ? 'panic-on' : ''}" aria-hidden="true">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>
                <div class="flex-grow-1 text-start">
                    <h3 class="h6 mb-1">Panic Mode: <span class={panicActive ? 'text-danger' : 'text-success'}>{panicActive ? 'On' : 'Off'}</span></h3>
                    <p class="small text-secondary mb-2">Emergency switch — restricts the site instantly.</p>
                    <button
                        class="btn btn-sm {panicActive ? 'btn-success' : 'btn-danger'} {isPanicAction ? 'disabled' : ''}"
                        onclick={handlePanic}
                        disabled={isPanicAction}
                        use:tooltip={{...tooltipConfig, content: panicActive ? 'Restore normal operation' : 'Restrict the site immediately'}}
                    >
                        {isPanicAction ? 'Working…' : panicActive ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card rounded-4 h-100 bg-black bg-opacity-25 border-purple">
            <div class="card-body text-center p-3 d-flex flex-column justify-content-center">
                <i class="fas fa-right-left fa-2x mb-2 text-warning" aria-hidden="true"></i>
                <h3 class="h6">Migrations</h3>
                <a href="/admin/dashboard/migrations" class="btn btn-sm btn-outline-warning mt-1">Open</a>
            </div>
        </div>
    </div>
    <div class="col-6 col-lg-3">
        <div class="card rounded-4 h-100 bg-black bg-opacity-25 border-purple">
            <div class="card-body text-center p-3 d-flex flex-column justify-content-center">
                <i class="fas fa-envelope fa-2x mb-2 text-info" aria-hidden="true"></i>
                <h3 class="h6">Newsletter</h3>
                <a href="/admin/dashboard/newsletter" class="btn btn-sm btn-purple mt-1">Open</a>
            </div>
        </div>
    </div>
</div>

<style>
    .border-purple {
        border-color: var(--primary-color) !important;
    }
    .panic-icon {
        width: 2.75rem;
        height: 2.75rem;
        flex: 0 0 2.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.9rem;
        font-size: 1.25rem;
        color: var(--dd-accent-ink);
        background: var(--dd-accent);
        border: 1px solid rgba(var(--dd-bright-rgb),0.35);
    }
    .panic-on {
        background: hsl(0, 70%, 40%);
        border-color: rgba(255, 90, 90, 0.5);
    }
</style>
