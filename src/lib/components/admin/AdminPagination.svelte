<script>
	/** Compact, touch-friendly pagination for admin lists (server-driven via ?page=).
	 *  @type {{page: number, totalPages: number, total: number, baseParams?: Record<string,string>, label?: string}} */
	let { page, totalPages, total, baseParams = {}, label = 'results' } = $props();

	function hrefFor(p) {
		const params = new URLSearchParams();
		for (const [k, v] of Object.entries(baseParams)) {
			if (v !== '' && v !== null && v !== undefined) params.set(k, String(v));
		}
		params.set('page', String(p));
		return `?${params.toString()}`;
	}

	let pages = $derived.by(() => {
		const span = 2;
		const out = new Set([1, totalPages, page - span, page - span + 1, page, page + span - 1, page + span]);
		return [...out].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
	});
</script>

{#if totalPages > 1}
	<nav aria-label="Admin list pagination" class="d-flex flex-column align-items-center gap-2 mt-3">
		<div class="btn-group flex-wrap justify-content-center" role="group">
			<a class="btn btn-sm btn-outline-secondary {page <= 1 ? 'disabled' : ''}" href={hrefFor(page - 1)} aria-label="Previous page" aria-disabled={page <= 1}>
				<i class="fas fa-chevron-left" aria-hidden="true"></i>
			</a>
			{#each pages as p (p)}
				<a
					href={hrefFor(p)}
					class="btn btn-sm {p === page ? 'btn-purple' : 'btn-outline-secondary'}"
					aria-label={`Page ${p}`}
					aria-current={p === page ? 'page' : undefined}
				>{p}</a>
			{/each}
			<a class="btn btn-sm btn-outline-secondary {page >= totalPages ? 'disabled' : ''}" href={hrefFor(page + 1)} aria-label="Next page" aria-disabled={page >= totalPages}>
				<i class="fas fa-chevron-right" aria-hidden="true"></i>
			</a>
		</div>
		<p class="small-text text-secondary mb-0">Page {page} of {totalPages} · {total} {label}</p>
	</nav>
{:else if total > 0}
	<p class="small-text text-secondary text-center mt-3 mb-0">{total} {label}</p>
{/if}
