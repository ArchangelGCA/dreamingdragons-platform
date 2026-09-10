<script>
	import { tooltip } from 'svelte-tooltip-gca';
	import { tooltipConfig } from '$lib/utils/gcacommons.js';

	/** @type {{icon: string, label: string, value: string | number, href: string, linkLabel: string, tip?: string, accent?: 'purple' | 'danger' | 'warning' | 'success'}} */
	let { icon, label, value, href, linkLabel, tip = '', accent = 'purple' } = $props();
</script>

<div class="card admin-stat h-100 rounded-4">
	<div class="card-body d-flex align-items-center gap-3 p-3">
		<div class="stat-icon stat-{accent}" aria-hidden="true">
			<i class="fas {icon}"></i>
		</div>
		<div class="min-w-0 flex-grow-1">
			<div class="stat-value">{value}</div>
			<div class="stat-label">{label}</div>
			<a
				{href}
				class="stretched-link small link-purple"
				use:tooltip={tip ? { ...tooltipConfig, content: tip } : { ...tooltipConfig, content: linkLabel }}
				aria-label={linkLabel}
			>
				{linkLabel} <i class="fas fa-arrow-right small-text" aria-hidden="true"></i>
			</a>
		</div>
	</div>
</div>

<style>
	.admin-stat {
		background: var(--forge-iron, var(--dd-surface));
		border: 1px solid var(--forge-edge, var(--dd-edge));
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
	}
	.stat-icon {
		width: 2.75rem;
		height: 2.75rem;
		flex: 0 0 2.75rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.9rem;
		font-size: 1.2rem;
		color: var(--dd-accent-ink);
		background: var(--dd-accent);
		border: 1px solid rgba(var(--dd-bright-rgb), 0.35);
	}
	.stat-danger {
		background: hsl(0, 70%, 40%);
		border-color: rgba(255, 90, 90, 0.4);
		color: var(--text-color);
	}
	.stat-warning {
		background: hsl(45, 90%, 40%);
		border-color: rgba(255, 200, 90, 0.35);
		color: var(--dd-gold-ink);
	}
	.stat-success {
		background: hsl(140, 60%, 38%);
		border-color: rgba(90, 255, 150, 0.3);
		color: var(--dd-accent-ink);
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.1;
	}
	.stat-label {
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin-bottom: 0.15rem;
	}
	.link-purple {
		color: var(--dd-accent-bright);
	}
	.link-purple:hover {
		color: var(--dd-accent-hover);
	}
</style>
