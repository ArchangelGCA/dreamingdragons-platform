<script>
	import { tooltip } from 'svelte-tooltip-gca';
	import { tooltipConfig } from '$lib/utils/gcacommons.js';
	import { fade, fly } from 'svelte/transition';
	import { browser } from '$app/environment';

	/**
	 * The admin console's one dialog. Svelte-controlled Bootstrap markup —
	 * no Bootstrap JS, no manual backdrop cleanup, no native `confirm()`.
	 *
	 * @type {{
	 *   open: boolean,
	 *   title: string,
	 *   confirmLabel?: string,
	 *   cancelLabel?: string,
	 *   tone?: 'danger' | 'warning' | 'primary',
	 *   busy?: boolean,
	 *   showConfirm?: boolean,
	 *   onConfirm?: () => void,
	 *   onClose?: () => void,
	 *   children?: import('svelte').Snippet,
	 *   footer?: import('svelte').Snippet
	 * }}
	 */
	let {
		open,
		title,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		tone = 'danger',
		busy = false,
		showConfirm = true,
		onConfirm = () => {},
		onClose = () => {},
		children,
		footer
	} = $props();

	let confirmClass = $derived(
		tone === 'warning' ? 'btn-warning' : tone === 'primary' ? 'btn-purple' : 'btn-danger'
	);
	let borderClass = $derived(
		tone === 'warning' ? 'border-warning' : tone === 'primary' ? 'border-purple' : 'border-danger'
	);

	// Transitions collapse to zero under prefers-reduced-motion (Svelte
	// transitions are JS-driven, so the CSS kill-switch in style.css can't).
	const reduceMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const duration = reduceMotion ? 0 : 140;

	/** @type {HTMLButtonElement | null} */
	let confirmButton = $state(null);

	function handleKeydown(event) {
		if (event.key === 'Escape' && !busy) onClose();
	}

	// Body scroll lock + keyboard focus land on the dialog while it is open.
	$effect(() => {
		if (!open || !browser) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		confirmButton?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<button
		type="button"
		class="modal-backdrop show admin-backdrop"
		aria-label="Close dialog"
		disabled={busy}
		onclick={onClose}
		transition:fade={{ duration }}
	></button>
	<div
		class="modal show d-block"
		tabindex="-1"
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<div
			class="modal-dialog modal-dialog-centered"
			in:fly={{ y: 14, duration }}
			out:fade={{ duration }}
		>
			<div class="modal-content {borderClass}">
				<div class="modal-header">
					<h5 class="modal-title">{title}</h5>
					<button
						type="button"
						class="btn-close"
						aria-label="Close"
						disabled={busy}
						onclick={onClose}
						use:tooltip={{ ...tooltipConfig, content: 'Close without acting' }}
					></button>
				</div>
				<div class="modal-body">
					{@render children?.()}
				</div>
				<div class="modal-footer">
					{#if footer}
						{@render footer()}
					{:else}
						<button type="button" class="btn btn-outline-secondary" disabled={busy} onclick={onClose}>
							{cancelLabel}
						</button>
						{#if showConfirm}
							<button
								type="button"
								class="btn {confirmClass} min-w-cta"
								disabled={busy}
								onclick={onConfirm}
								bind:this={confirmButton}
							>
								{#if busy}
									<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Working…
								{:else}
									{confirmLabel}
								{/if}
							</button>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop.show {
		opacity: 0.6;
	}
	.admin-backdrop {
		border: 0;
		padding: 0;
		cursor: default;
	}
	.min-w-cta {
		min-width: 7rem;
	}
	.border-purple {
		border-color: var(--primary-color);
	}
</style>
