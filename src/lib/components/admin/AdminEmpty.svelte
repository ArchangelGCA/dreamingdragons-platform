<script>
	/**
	 * The admin console's one empty state: icon, title, one hint.
	 * @type {{icon?: string, title: string, hint?: string}}
	 */
	let { icon = 'fa-folder-open', title, hint = '' } = $props();
</script>

<div class="text-center py-5">
	<i class="fas {icon} fa-3x mb-3 text-secondary" aria-hidden="true"></i>
	<h3 class="h5">{title}</h3>
	{#if hint}
		<p class="text-secondary small mb-0">{hint}</p>
	{/if}
</div>
