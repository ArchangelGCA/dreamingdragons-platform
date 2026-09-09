<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import AdminDialog from "$lib/components/admin/AdminDialog.svelte";
    import { tooltip } from "svelte-tooltip-gca";
    import { toast } from "$lib/components/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import {invalidateAll} from "$app/navigation";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import { resolveImageUrl } from "$lib/utils/images.js";
    import { formatAdminDate, postAdminAction } from "$lib/utils/admin.js";
    import { notifyError, notifySuccess, notifyWorking } from "$lib/utils/admin-notify.js";

    /** @type {{profile: any, image_proxy: any}} */
    let { profile, image_proxy } = $props();

    let busy = $state(false);
    let warnOpen = $state(false);
    let avatarOpen = $state(false);
    let coverOpen = $state(false);
    let deleteWarningId = $state(null);
    let warningMessage = $state('');

    let warningCount = $derived(profile.notifications?.length ?? 0);
    let coverSrc = $derived(resolveImageUrl(profile.cover_url, image_proxy));

    async function runAction(action, formData, successMessage) {
        if (busy) return false;
        busy = true;
        const toastId = notifyWorking(successMessage.verb);
        try {
            const result = await postAdminAction(action, formData);
            toast.pop(toastId);
            if (result.type === 'success' && result.data.status === 200) {
                notifySuccess(result.data.body.message ?? successMessage.done);
                await invalidateAll();
                return true;
            }
            notifyError(result.data?.body?.message ?? successMessage.fail);
            return false;
        } catch {
            toast.pop(toastId);
            notifyError(successMessage.fail);
            return false;
        } finally {
            busy = false;
        }
    }

    async function confirmDeleteWarning() {
        if (!deleteWarningId) return;
        const formData = new FormData();
        formData.append("warningId", deleteWarningId);
        const ok = await runAction('delete_warning', formData, {
            verb: 'Deleting warning...',
            done: 'Warning deleted',
            fail: 'Could not delete warning.'
        });
        if (ok) deleteWarningId = null;
    }

    async function confirmSendWarning() {
        if (!warningMessage.trim()) {
            notifyError('Write a warning message first.');
            return;
        }
        const formData = new FormData();
        formData.append('recipientId', profile.id);
        formData.append('warningMessage', warningMessage.trim());
        const ok = await runAction('send_warning', formData, {
            verb: 'Sending warning...',
            done: 'Warning sent',
            fail: 'Could not send warning.'
        });
        if (ok) {
            warningMessage = '';
            warnOpen = false;
        }
    }

    async function confirmToggleUpload() {
        const formData = new FormData();
        formData.append('userId', profile.id);
        formData.append('uploadStatus', String(!profile.can_upload));
        await runAction('toggle_upload', formData, {
            verb: 'Updating upload permission...',
            done: 'Upload permission updated',
            fail: 'Could not update upload permission.'
        });
    }

    async function confirmResetAvatar() {
        const formData = new FormData();
        formData.append('userId', profile.id);
        const ok = await runAction('reset_avatar', formData, {
            verb: 'Resetting avatar...',
            done: 'Avatar reset',
            fail: 'Could not reset avatar.'
        });
        if (ok) avatarOpen = false;
    }

    async function confirmResetCover() {
        const formData = new FormData();
        formData.append('userId', profile.id);
        const ok = await runAction('reset_cover', formData, {
            verb: 'Resetting cover...',
            done: 'Cover reset',
            fail: 'Could not reset cover.'
        });
        if (ok) coverOpen = false;
    }

    async function handleCopyToClipboard() {
        try {
            await navigator.clipboard.writeText(profile.id);
            notifySuccess('User ID copied');
        } catch {
            notifyError('Could not copy ID.');
        }
    }
</script>

<div class="admin-card mb-4 p-3 p-md-4 {profile.can_upload ? '' : 'border-danger'}">
    <div class="d-flex flex-column flex-md-row align-items-center gap-3">
        <UserAvatar url={profile.avatar_url} username={profile.username} id={profile.id} {image_proxy} size="72px" />
        <div class="text-center text-md-start min-w-0 flex-grow-1">
            <h3 class="h5 mb-1 text-truncate">{profile.username}</h3>
            <div class="d-flex flex-wrap justify-content-center justify-content-md-start gap-1">
                {#if profile.can_upload}
                    <span class="badge rounded-pill text-bg-success">Can upload</span>
                {:else}
                    <span class="badge rounded-pill text-bg-danger">Blocked</span>
                {/if}
                {#if warningCount > 0}
                    <span class="badge rounded-pill text-bg-warning tnum">{warningCount} warning{warningCount === 1 ? '' : 's'}</span>
                {/if}
            </div>
            <p class="small text-secondary tnum mb-0 mt-1">
                <span class="text-truncate d-inline-block align-middle" style="max-width: 16rem;">{profile.id}</span>
                <button class="btn btn-sm btn-link p-0 ms-1" onclick={handleCopyToClipboard} use:tooltip={{...tooltipConfig, content: 'Copy user ID'}}>
                    <i class="fas fa-copy" aria-hidden="true"></i><span class="visually-hidden">Copy user ID</span>
                </button>
            </p>
        </div>
        <div class="d-flex flex-md-column gap-2 w-100 w-md-auto">
            <button type="button" class="btn btn-sm btn-warning flex-fill" onclick={() => warnOpen = true}>
                <i class="fas fa-triangle-exclamation me-1" aria-hidden="true"></i>Warn
            </button>
            <button type="button" class="btn btn-sm flex-fill {profile.can_upload ? 'btn-danger' : 'btn-success'}" disabled={busy} onclick={confirmToggleUpload}>
                <i class="fas fa-ban me-1" aria-hidden="true"></i>{profile.can_upload ? 'Block' : 'Unblock'}
            </button>
        </div>
    </div>

    <div class="accordion mt-3" id="profileAccordion-{profile.id}">
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne-{profile.id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne-{profile.id}" aria-expanded="false" aria-controls="collapseOne-{profile.id}">
                    Details
                </button>
            </h2>
            <div id="collapseOne-{profile.id}" class="accordion-collapse collapse" aria-labelledby="headingOne-{profile.id}" data-bs-parent="#profileAccordion-{profile.id}">
                <div class="accordion-body">
                    <dl class="row small mb-0">
                        <dt class="col-4 col-md-3 text-secondary">Name</dt>
                        <dd class="col-8 col-md-9">{profile.full_name ?? '—'}</dd>
                        <dt class="col-4 col-md-3 text-secondary">Email</dt>
                        <dd class="col-8 col-md-9 text-truncate">{profile.email ?? '—'}</dd>
                        <dt class="col-4 col-md-3 text-secondary">Website</dt>
                        <dd class="col-8 col-md-9 text-truncate">{profile.website || '—'}</dd>
                        <dt class="col-4 col-md-3 text-secondary">Joined</dt>
                        <dd class="col-8 col-md-9 tnum">{formatAdminDate(profile.created_at)}</dd>
                        <dt class="col-4 col-md-3 text-secondary">Updated</dt>
                        <dd class="col-8 col-md-9 tnum">{formatAdminDate(profile.updated_at)}</dd>
                    </dl>
                    <div class="border-top border-light-subtle pt-3 mt-2 text-center">
                        <p class="small text-secondary mb-2">Profile cover</p>
                        {#if profile.cover_url}
                            <a href={coverSrc} target="_blank" rel="noopener noreferrer">
                                <img src={coverSrc} alt="Profile cover of {profile.username}" class="img-fluid rounded-4" loading="lazy" decoding="async" use:tooltip={{...tooltipConfig, content: 'View cover'}} />
                            </a>
                        {:else}
                            <p class="text-secondary small mb-0">No cover image</p>
                        {/if}
                    </div>
                    <div class="d-flex flex-wrap gap-2 justify-content-center mt-3">
                        {#if profile.avatar_url}
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick={() => avatarOpen = true}>
                                <i class="fas fa-rotate me-1" aria-hidden="true"></i>Reset avatar
                            </button>
                        {/if}
                        {#if profile.cover_url}
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick={() => coverOpen = true}>
                                <i class="fas fa-rotate me-1" aria-hidden="true"></i>Reset cover
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        {#if warningCount > 0}
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingNotifications-{profile.id}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNotifications-{profile.id}" aria-expanded="false" aria-controls="collapseNotifications-{profile.id}">
                        Warnings <span class="badge rounded-pill text-bg-warning ms-2 tnum">{warningCount}</span>
                    </button>
                </h2>
                <div id="collapseNotifications-{profile.id}" class="accordion-collapse collapse" aria-labelledby="headingNotifications-{profile.id}" data-bs-parent="#profileAccordion-{profile.id}">
                    <div class="accordion-body" use:autoAnimate>
                        {#each profile.notifications as notification (notification.id)}
                            <div class="alert alert-warning d-flex justify-content-between align-items-start gap-2 py-2">
                                <div class="min-w-0">
                                    <p class="mb-0 small">{notification.content}</p>
                                    <small class="text-muted tnum">{formatAdminDate(notification.created_at)}</small>
                                </div>
                                <button class="btn btn-outline-danger btn-sm flex-shrink-0" onclick={() => deleteWarningId = notification.id} aria-label="Delete warning" use:tooltip={{...tooltipConfig, content: 'Delete warning'}}>
                                    <i class="fas fa-trash" aria-hidden="true"></i>
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<AdminDialog
    open={warnOpen}
    title="Warn {profile.username}"
    tone="warning"
    confirmLabel="Send warning"
    {busy}
    onClose={() => { if (!busy) warnOpen = false; }}
    onConfirm={confirmSendWarning}
>
    <label class="form-label small" for="warningMessage-{profile.id}">Message the user will receive</label>
    <textarea
        class="form-control"
        id="warningMessage-{profile.id}"
        rows="3"
        maxlength="1000"
        placeholder="State what broke the rules and what happens next…"
        bind:value={warningMessage}
    ></textarea>
</AdminDialog>

<AdminDialog
    open={deleteWarningId !== null}
    title="Delete this warning?"
    confirmLabel="Delete"
    {busy}
    onClose={() => { if (!busy) deleteWarningId = null; }}
    onConfirm={confirmDeleteWarning}
>
    <p class="mb-0">The warning is removed from {profile.username}'s record. This can't be undone.</p>
</AdminDialog>

<AdminDialog
    open={avatarOpen}
    title="Reset avatar?"
    confirmLabel="Reset avatar"
    {busy}
    onClose={() => { if (!busy) avatarOpen = false; }}
    onConfirm={confirmResetAvatar}
>
    <p class="mb-0">{profile.username}'s avatar returns to the default and the stored file is deleted.</p>
</AdminDialog>

<AdminDialog
    open={coverOpen}
    title="Reset cover?"
    confirmLabel="Reset cover"
    {busy}
    onClose={() => { if (!busy) coverOpen = false; }}
    onConfirm={confirmResetCover}
>
    <p class="mb-0">{profile.username}'s cover is removed and the stored file is deleted.</p>
</AdminDialog>

<style>
    .min-w-0 {
        min-width: 0;
    }
    @media (min-width: 768px) {
        .w-md-auto {
            width: auto !important;
        }
    }
</style>
