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
		background: var(--forge-iron, #170d21);
		border: 1px solid var(--forge-edge, #342043);
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
		color: #fff;
		background: linear-gradient(135deg, hsl(273, 100%, 39%) 0%, hsl(273, 100%, 33%) 100%);
		border: 1px solid rgba(196, 0, 255, 0.35);
	}
	.stat-danger {
		background: linear-gradient(135deg, hsl(0, 70%, 45%) 0%, hsl(0, 70%, 35%) 100%);
		border-color: rgba(255, 90, 90, 0.4);
	}
	.stat-warning {
		background: linear-gradient(135deg, hsl(45, 90%, 45%) 0%, hsl(35, 85%, 38%) 100%);
		border-color: rgba(255, 200, 90, 0.35);
	}
	.stat-success {
		background: linear-gradient(135deg, hsl(140, 60%, 42%) 0%, hsl(140, 60%, 32%) 100%);
		border-color: rgba(90, 255, 150, 0.3);
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.1;
	}
	.stat-label {
		color: hsl(0, 0%, 65%);
		font-size: 0.875rem;
		margin-bottom: 0.15rem;
	}
	.link-purple {
		color: #c400ff;
	}
	.link-purple:hover {
		color: #ff00fb;
	}
</style>
