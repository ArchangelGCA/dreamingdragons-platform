<script>
	/**
	 * The admin console's one page header: title, one-line purpose,
	 * optional meta line (counts), optional actions row.
	 * @type {{
	 *   title: string,
	 *   subtitle?: string,
	 *   meta?: string,
	 *   actions?: import('svelte').Snippet,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { title, subtitle = '', meta = '', actions, children } = $props();
</script>

<div class="mb-3">
	<div class="text-center text-md-start">
		<h2 class="mb-1">{title}</h2>
		{#if subtitle}
			<p class="text-secondary small mb-1">{subtitle}</p>
		{/if}
		{#if meta}
			<p class="text-secondary small tnum mb-0">{meta}</p>
		{/if}
	</div>
	{#if actions}
		<div class="mt-2">
			{@render actions()}
		</div>
	{/if}
	{@render children?.()}
</div>
