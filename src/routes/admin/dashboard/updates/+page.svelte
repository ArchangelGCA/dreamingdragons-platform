<script>
	import { tooltip } from 'svelte-tooltip-gca';
	import { tooltipConfig } from '$lib/utils/gcacommons.js';
	import { toast } from '$lib/components/svelte-toast';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminDialog from '$lib/components/admin/AdminDialog.svelte';
	import { formatAdminDate, postAdminAction } from '$lib/utils/admin.js';
	import { notifyError, notifySuccess, notifyWorking } from '$lib/utils/admin-notify.js';
	import {
		buildUpdateHtml,
		DEFAULT_EXCLUDED_SECTIONS,
		htmlToPlainText,
		parseChangelogBlock,
		UPDATE_CONTENT_MAX_LENGTH
	} from '$lib/utils/changelog.js';

	/** @type {{data: any}} */
	let { data } = $props();
	// Writable derived: local add/edit/delete assign locally, server data re-evaluates on navigation.
	let updates = $derived(data.updates ?? []);

	const PASTE_PLACEHOLDER =
		'## [0.17.0] - 2026-09-10\n\n### Added\n\n- **Feature:** what changed, with `code` and [links](https://example.com)';

	// ---- Composer state -----------------------------------------------------
	let mode = $state('changelog'); // 'changelog' | 'html'
	let paste = $state('');
	let excludedSections = $state([...DEFAULT_EXCLUDED_SECTIONS]);
	let includeVersion = $state(true);
	// null = finalHtml follows the generated changelog HTML; a string = the
	// admin hand-edited the output (in raw mode this is the whole content).
	let manualHtml = $state(null);
	let editingId = $state(null);
	let isPublishing = $state(false);

	// Delete confirmation.
	let deleteTarget = $state(null);
	let isDeleting = $state(false);

	let parsed = $derived(parseChangelogBlock(paste));
	let generatedHtml = $derived(
		buildUpdateHtml(parsed, { excludedSections, includeVersion })
	);
	let finalHtml = $derived(mode === 'changelog' ? (manualHtml ?? generatedHtml) : (manualHtml ?? ''));

	let htmlModified = $derived(mode === 'changelog' && manualHtml !== null && manualHtml !== generatedHtml);
	let trimmedHtml = $derived(finalHtml.trim());
	let canPublish = $derived(trimmedHtml.length > 0 && trimmedHtml.length <= UPDATE_CONTENT_MAX_LENGTH && !isPublishing);
	let editingTarget = $derived(editingId !== null ? updates.find((u) => String(u.id) === String(editingId)) : null);

	function setFinalHtml(event) {
		manualHtml = event.currentTarget.value;
	}

	function switchMode(next) {
		if (next === mode) return;
		// Carry the current content into raw mode for deep editing; when going
		// back to changelog mode, regenerate from the pasted block.
		manualHtml = next === 'html' ? finalHtml : null;
		mode = next;
	}

	function toggleSection(name) {
		excludedSections = excludedSections.includes(name)
			? excludedSections.filter((n) => n !== name)
			: [...excludedSections, name];
	}

	function resetComposer() {
		paste = '';
		manualHtml = null;
		editingId = null;
	}

	function handleEdit(update) {
		mode = 'html';
		editingId = update.id;
		manualHtml = update.content ?? '';
	}

	async function handlePublish(e) {
		e?.preventDefault();
		if (isPublishing) return;
		if (!trimmedHtml) {
			notifyError('Write the update content first.');
			return;
		}
		if (trimmedHtml.length > UPDATE_CONTENT_MAX_LENGTH) {
			notifyError(`Update too long (max ${UPDATE_CONTENT_MAX_LENGTH} characters).`);
			return;
		}

		isPublishing = true;
		const toastId = notifyWorking(editingId ? 'Saving update...' : 'Publishing update...');

		try {
			const formData = new FormData();
			formData.append('content', trimmedHtml);
			if (editingId) formData.append('id', String(editingId));
			const result = await postAdminAction('publish_update', formData);
			toast.pop(toastId);
			if (result.type === 'success' && result.data.status === 200) {
				const saved = result.data.body.update;
				if (editingId) {
					updates = updates.map((u) => (String(u.id) === String(editingId) ? saved : u));
				} else if (saved) {
					updates = [saved, ...updates].slice(0, 15);
				}
				notifySuccess(result.data.body.message);
				resetComposer();
			} else {
				notifyError(result.data?.body?.message ?? 'Could not publish the update.');
			}
		} catch {
			toast.pop(toastId);
			notifyError('Could not publish the update.');
		} finally {
			isPublishing = false;
		}
	}

	async function confirmDelete() {
		if (isDeleting || !deleteTarget) return;
		isDeleting = true;
		const toastId = notifyWorking('Deleting update...');

		try {
			const formData = new FormData();
			formData.append('id', String(deleteTarget.id));
			const result = await postAdminAction('delete_update', formData);
			toast.pop(toastId);
			if (result.type === 'success' && result.data.status === 200) {
				updates = updates.filter((u) => String(u.id) !== String(deleteTarget.id));
				if (editingId !== null && String(editingId) === String(deleteTarget.id)) resetComposer();
				notifySuccess(result.data.body.message);
				deleteTarget = null;
			} else {
				notifyError(result.data?.body?.message ?? 'Could not delete the update.');
			}
		} catch {
			toast.pop(toastId);
			notifyError('Could not delete the update.');
		} finally {
			isDeleting = false;
		}
	}
</script>

<AdminPageHeader
	title="Updates"
	subtitle="Announce what's new on /updates — paste a CHANGELOG block and it's formatted for you, or write raw HTML."
/>

<div class="row g-3">
	<!-- Composer -->
	<div class="col-12 col-lg-7">
		<div class="admin-card p-3">
			<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
				<div class="btn-group btn-group-sm" role="group" aria-label="Composer mode">
					<button
						type="button"
						class="btn {mode === 'changelog' ? 'btn-purple' : 'btn-outline-secondary'}"
						onclick={() => switchMode('changelog')}
						use:tooltip={{ ...tooltipConfig, content: 'Paste a version block from CHANGELOG.md' }}
					>
						<i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> From changelog
					</button>
					<button
						type="button"
						class="btn {mode === 'html' ? 'btn-purple' : 'btn-outline-secondary'}"
						onclick={() => switchMode('html')}
						use:tooltip={{ ...tooltipConfig, content: 'Write or edit the update HTML directly' }}
					>
						<i class="fas fa-code" aria-hidden="true"></i> Raw HTML
					</button>
				</div>
				{#if editingId !== null}
					<span class="small text-warning">
						<i class="fas fa-pen" aria-hidden="true"></i> Editing: {formatAdminDate(editingTarget?.created_at)}
						<button type="button" class="btn btn-sm btn-outline-secondary ms-1" onclick={() => resetComposer()}>
							Cancel
						</button>
					</span>
				{/if}
			</div>

			{#if mode === 'changelog'}
				<div class="mb-3">
					<label for="changelogPaste" class="form-label small">
						Changelog block <span class="text-secondary">(e.g. <code>## [0.17.0] - 2026-09-10</code> down to the next version)</span>
					</label>
					<textarea
						id="changelogPaste"
						class="form-control update-textarea"
						rows="10"
						placeholder={PASTE_PLACEHOLDER}
						bind:value={paste}
					></textarea>
				</div>

				{#if parsed.sections.length > 0}
					<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
						{#if parsed.version}
							<span class="badge rounded-pill chip-dragon tnum">v{parsed.version}</span>
						{/if}
						{#if parsed.date}
							<span class="small text-secondary tnum">{parsed.date}</span>
						{/if}
						{#each parsed.sections as section (section.name)}
							<button
								type="button"
								class="btn btn-sm section-chip {!excludedSections.includes(section.name) ? 'chip-on' : ''}"
								aria-pressed={!excludedSections.includes(section.name)}
								onclick={() => toggleSection(section.name)}
								use:tooltip={{
									...tooltipConfig,
									content: excludedSections.includes(section.name)
										? 'Excluded from the update — click to include'
										: 'Included in the update — click to exclude'
								}}
							>
								{#if !excludedSections.includes(section.name)}
									<i class="fas fa-check" aria-hidden="true"></i>
								{/if}
								{section.name || 'Ungrouped'}
								<span class="tnum">({section.itemCount})</span>
							</button>
						{/each}
						<label class="small text-secondary ms-auto mb-0 form-check">
							<input type="checkbox" class="form-check-input me-1" bind:checked={includeVersion} />
							Show version
						</label>
					</div>
				{:else if paste.trim()}
					<p class="small text-warning mb-3">No sections recognized — check the block format (needs <code>### Section</code> headings or bullets).</p>
				{/if}
			{/if}

			<div class="mb-3">
				<label for="updateHtml" class="form-label small d-flex align-items-center gap-2">
					Update HTML
					{#if htmlModified}
						<span class="text-warning" title="Hand-edited — no longer matches the generated output">
							<i class="fas fa-circle dot" aria-hidden="true"></i> modified
						</span>
					{/if}
					<span class="ms-auto text-secondary tnum">{trimmedHtml.length} / {UPDATE_CONTENT_MAX_LENGTH}</span>
				</label>
				<textarea
					id="updateHtml"
					class="form-control update-textarea"
					class:is-invalid={trimmedHtml.length > UPDATE_CONTENT_MAX_LENGTH}
					rows={mode === 'changelog' ? 8 : 12}
					placeholder={mode === 'html' ? '<p>Write the update in HTML…</p>' : ''}
					readonly={mode === 'changelog' && !paste.trim()}
					value={finalHtml}
					oninput={setFinalHtml}
				></textarea>
			</div>

			<div class="d-flex flex-wrap gap-2">
				<button
					type="button"
					class="btn btn-purple"
					disabled={!canPublish}
					onclick={handlePublish}
					use:tooltip={{ ...tooltipConfig, content: editingId ? 'Save over the existing update' : 'Publish to /updates right away' }}
				>
					{#if isPublishing}
						<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Working…
					{:else}
						<i class="fas fa-bullhorn" aria-hidden="true"></i> {editingId ? 'Save update' : 'Publish update'}
					{/if}
				</button>
				{#if htmlModified}
					<button
						type="button"
						class="btn btn-outline-secondary"
						onclick={() => (manualHtml = null)}
						use:tooltip={{ ...tooltipConfig, content: 'Discard hand edits and regenerate from the changelog block' }}
					>
						<i class="fas fa-rotate-left" aria-hidden="true"></i> Regenerate
					</button>
				{/if}
				{#if paste || finalHtml}
					<button type="button" class="btn btn-outline-secondary" onclick={() => resetComposer()}>
						<i class="fas fa-broom" aria-hidden="true"></i> Clear
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Live preview -->
	<div class="col-12 col-lg-5">
		<div class="admin-card p-3 preview-sticky">
			<h3 class="h6 mb-2"><i class="fas fa-eye" aria-hidden="true"></i> Preview</h3>
			<div class="update-preview card mb-0">
				<div class="card-body">
					<h5 class="card-title">
						<i class="fas fa-pencil" aria-hidden="true"></i>
						{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
						<span class="text-muted text-sm">{new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric' })}</span>
					</h5>
					{#if trimmedHtml}
						<div class="card-text text-secondary-emphasis">{@html finalHtml}</div>
					{:else}
						<p class="text-secondary small mb-0">Nothing to preview yet — paste a changelog block or write some HTML.</p>
					{/if}
				</div>
			</div>
			<p class="small text-secondary mt-2 mb-0">Shown exactly as it will appear on the public Updates page.</p>
		</div>
	</div>
</div>

<!-- History -->
<div class="admin-card p-3 mt-3">
	<h3 class="h6 mb-2"><i class="fas fa-clock-rotate-left" aria-hidden="true"></i> Published updates <span class="tnum text-secondary">({updates.length})</span></h3>
	{#if data.loadError}
		<p class="small text-danger mb-0">Could not load existing updates — publishing still works, history doesn't.</p>
	{:else if updates.length === 0}
		<p class="small text-secondary mb-0">No updates published yet.</p>
	{:else}
		<ul class="list-group">
			{#each updates as update (update.id)}
				<li class="list-group-item d-flex align-items-center gap-2">
					<div class="min-w-0 flex-grow-1">
						<div class="small text-secondary tnum">{formatAdminDate(update.created_at)}</div>
						<div class="small text-truncate">{htmlToPlainText(update.content)}</div>
					</div>
					<button
						type="button"
						class="btn btn-sm btn-outline-secondary flex-shrink-0"
						onclick={() => handleEdit(update)}
						use:tooltip={{ ...tooltipConfig, content: 'Load in the composer to edit it' }}
						aria-label="Edit this update"
					>
						<i class="fas fa-pen" aria-hidden="true"></i>
					</button>
					<button
						type="button"
						class="btn btn-sm btn-outline-danger flex-shrink-0"
						onclick={() => (deleteTarget = update)}
						use:tooltip={{ ...tooltipConfig, content: 'Delete from /updates' }}
						aria-label="Delete this update"
					>
						<i class="fas fa-trash" aria-hidden="true"></i>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<AdminDialog
	open={deleteTarget !== null}
	title="Delete update?"
	tone="danger"
	confirmLabel="Delete"
	busy={isDeleting}
	onConfirm={confirmDelete}
	onClose={() => !isDeleting && (deleteTarget = null)}
>
	{#if deleteTarget}
		<p class="small mb-1">This update will be removed from the public page immediately:</p>
		<p class="small text-secondary mb-0"><span class="tnum">{formatAdminDate(deleteTarget.created_at)}</span> — {htmlToPlainText(deleteTarget.content, 90)}</p>
	{/if}
</AdminDialog>

<style>
	.update-textarea {
		background: rgba(0, 0, 0, 0.35);
		border-color: var(--dd-edge);
		font-size: 0.85rem;
	}
	.update-textarea:focus {
		background: rgba(0, 0, 0, 0.45);
	}
	.update-textarea[readonly] {
		opacity: 0.65;
	}
	.preview-sticky {
		position: sticky;
		top: 0.75rem;
	}
	.update-preview {
		background-color: rgba(var(--dd-accent-rgb), 0.12);
		border: 1px solid var(--dd-edge);
		box-shadow: 0 0 10px rgba(var(--dd-bright-rgb), 0.25);
	}
	.update-preview .fa-pencil {
		color: var(--dd-accent-bright);
	}
	.text-sm {
		font-size: 0.8rem;
	}
	.dot {
		font-size: 0.5rem;
		vertical-align: middle;
	}
	.section-chip {
		border: 1px solid var(--dd-edge);
		color: var(--text-secondary);
		background: transparent;
	}
	.section-chip.chip-on {
		background: var(--dd-accent);
		border-color: var(--dd-accent);
		color: var(--dd-accent-ink);
	}
</style>
