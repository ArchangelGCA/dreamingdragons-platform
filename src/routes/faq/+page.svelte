<script>
	import autoAnimate from "@formkit/auto-animate";
	import { onMount } from 'svelte';

	let { data } = $props();
	let searchTerm = $state('');
	let selectedCategory = $state('All');
	
	let filteredFAQs = $derived(
		data.faqData.filter(item => {
			const matchesSearch = searchTerm === '' || 
				item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.answer.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
			return matchesSearch && matchesCategory;
		})
	);
	
	let expandedItems = $state(new Set());
	
	function toggleItem(index) {
		if (expandedItems.has(index)) {
			expandedItems.delete(index);
		} else {
			expandedItems.add(index);
		}
		expandedItems = new Set(expandedItems);
	}

	function handleSearchKeydown(event) {
		// Clear search on Escape key
		if (event.key === 'Escape') {
			searchTerm = '';
			event.target.blur();
		}
	}

	// Ensure Bootstrap dropdowns are initialized on mount
	onMount(() => {
		if (typeof window !== 'undefined' && window.bootstrap) {
			// Initialize all dropdowns
			const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
			dropdownElements.forEach(element => {
				new window.bootstrap.Dropdown(element);
			});
		}
	});
</script>

<div class="container-xxl px-4 py-5">
	<!-- Hero Section -->
	<div class="hero-section text-center mb-5">
		<div class="hero-content">
			<h1 class="hero-title mb-3 display-3 fw-bold">
				<i class="fas fa-question-circle me-3"></i>
				Frequently Asked Questions
			</h1>
			<p class="hero-subtitle mb-4 fs-5">
				Find answers to common questions about DreamingDragons platform
			</p>
			
			<!-- Search Bar with Bootstrap Input Group -->
			<div class="row justify-content-center mb-4">
				<div class="col-12 col-lg-8">
					<div class="input-group input-group-lg search-container">
						<span class="input-group-text search-icon">
							<i class="fas fa-search"></i>
						</span>
						<input 
							type="text" 
							class="form-control search-input"
							placeholder="Search FAQs..."
							bind:value={searchTerm}
							onkeydown={handleSearchKeydown}
							aria-label="Search FAQs"
							aria-describedby="search-help"
						>
						{#if searchTerm}
							<button class="btn btn-outline-secondary clear-btn" onclick={() => searchTerm = ''} type="button" title="Clear search">
								<i class="fas fa-times"></i>
								<span class="visually-hidden">Clear search</span>
							</button>
						{/if}
					</div>
				</div>
			</div>

			<div id="search-help" class="form-text text-center">Search through questions and answers, or filter by category</div>
		</div>
	</div>

	<!-- Results Counter using Bootstrap Alert -->
	{#if searchTerm || selectedCategory !== 'All'}
		<div class="d-flex justify-content-center mb-4">
			<div class="alert alert-info results-alert" role="status">
				<i class="fas fa-info-circle me-2"></i>
				<strong>{filteredFAQs.length}</strong> result{filteredFAQs.length !== 1 ? 's' : ''} found
				{#if searchTerm && selectedCategory !== 'All'}
					for <em>"{searchTerm}"</em> in <strong>{selectedCategory}</strong>
				{:else if searchTerm}
					for <em>"{searchTerm}"</em>
				{:else if selectedCategory !== 'All'}
					in <strong>{selectedCategory}</strong>
				{/if}
				<div class="progress mt-2" style="height: 4px;">
					<div 
						class="progress-bar bg-info" 
						role="progressbar" 
						style="width: {(filteredFAQs.length / data.faqData.length) * 100}%"
						aria-valuenow={filteredFAQs.length}
						aria-valuemin="0"
						aria-valuemax={data.faqData.length}
					></div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Show completion progress when no search -->
		<div class="d-flex justify-content-center mb-4">
			<div class="card progress-card border-0">
				<div class="card-body p-3">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<small class="text-muted fw-semibold">FAQ Progress</small>
						<small class="text-muted">{expandedItems.size} / {data.faqData.length} expanded</small>
					</div>
					<div class="progress" style="height: 6px;">
						<div 
							class="progress-bar bg-primary" 
							role="progressbar"
							style="width: {expandedItems.size > 0 ? (expandedItems.size / data.faqData.length) * 100 : 0}%"
							aria-valuenow={expandedItems.size}
							aria-valuemin="0"
							aria-valuemax={data.faqData.length}
						></div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- FAQ Items -->
	<div class="accordion accordion-flush faq-accordion" id="faqAccordion" use:autoAnimate>
		{#if filteredFAQs.length === 0}
			<div class="card border-0 bg-transparent">
				<div class="card-body text-center py-5">
					<div class="no-results-icon mb-4">
						<i class="fas fa-search display-1 text-muted"></i>
					</div>
					<h4 class="card-title text-muted mb-3">No results found</h4>
					<p class="card-text text-muted">Try adjusting your search terms or browse all questions</p>
				</div>
			</div>
		{:else}
			{#each filteredFAQs as item, i (i)}
				<div class="accordion-item faq-item mb-4 {expandedItems.has(i) ? 'expanded' : ''}">
					<h2 class="accordion-header" id="heading{i}">
						<button 
							class="accordion-button {expandedItems.has(i) ? '' : 'collapsed'}"
							type="button"
							onclick={() => toggleItem(i)}
							aria-expanded={expandedItems.has(i)}
							aria-controls="collapse{i}"
						>
							<div class="question-wrapper d-flex align-items-center w-100">
								<div class="question-icon me-3">
									<i class="fas fa-question"></i>
								</div>
								<div class="flex-grow-1">
									<div class="d-flex align-items-center mb-1">
										<span class="badge bg-{item.categoryColor} me-2 category-badge">
											{item.category}
										</span>
									</div>
									<span class="question-text">{item.question}</span>
								</div>
								<div class="expand-icon ms-3 {expandedItems.has(i) ? 'rotated' : ''}">
									<i class="fas fa-chevron-down"></i>
								</div>
							</div>
						</button>
					</h2>
					{#if expandedItems.has(i)}
						<div 
							id="collapse{i}"
							class="accordion-collapse collapse show"
							aria-labelledby="heading{i}"
						>
							<div class="accordion-body">
								<div class="answer-wrapper d-flex">
									<div class="answer-icon me-3">
										<i class="fas fa-lightbulb"></i>
									</div>
									<div class="answer-text flex-grow-1">
										{@html item.answer}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Footer CTA using Bootstrap Card -->
	<div class="row justify-content-center mt-5 pt-5">
		<div class="col-lg-8">
			<div class="card footer-cta-card border-0">
				<div class="card-body text-center p-5">
					<div class="cta-icon mb-4">
						<i class="fas fa-question-circle display-1"></i>
					</div>
					<h3 class="card-title cta-title mb-3">Still have questions?</h3>
					<p class="card-text cta-text mb-4 fs-6">
						Can't find what you're looking for? Join our community or check out our updates for the latest information!
					</p>
					<div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
						<a href="https://discord.com/invite/u6qFjfDDy2" target="_blank" 
						   class="btn btn-lg btn-discord d-inline-flex align-items-center justify-content-center">
							<i class="fab fa-discord me-2"></i>
							Join Discord
						</a>
						<a href="/updates" 
						   class="btn btn-lg btn-updates d-inline-flex align-items-center justify-content-center">
							<i class="fas fa-newspaper me-2"></i>
							Latest Updates
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Hero Section */
	.hero-section {
		background: linear-gradient(135deg, 
			hsla(var(--primary-hue), 80%, 15%, 0.9) 0%,
			hsla(var(--primary-hue), 60%, 25%, 0.6) 50%,
			hsla(var(--primary-hue), 40%, 35%, 0.4) 100%
		);
		border-radius: 24px;
		padding: 3rem 2rem;
		margin-bottom: 2rem;
		position: relative;
		overflow: hidden;
		backdrop-filter: blur(10px);
		border: 1px solid hsla(var(--primary-hue), 50%, 50%, 0.2);
	}

	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg,
			transparent 0%,
			hsla(var(--primary-hue), 70%, 50%, 0.1) 25%,
			transparent 50%,
			hsla(var(--primary-hue), 70%, 60%, 0.1) 75%,
			transparent 100%
		);
		animation: shimmer 8s ease-in-out infinite;
		pointer-events: none;
	}

	.hero-content {
		position: relative;
		z-index: 1;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		background: linear-gradient(135deg, 
			var(--primary-color), 
			hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%))
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 4px 20px hsla(var(--primary-hue), 70%, 50%, 0.3);
	}

	.hero-subtitle {
		font-size: 1.2rem;
		color: var(--text-color);
		opacity: 0.9;
	}

	/* Search Container with Bootstrap styling */
	.search-container {
		position: relative;
		border-radius: 16px !important;
		overflow: hidden;
		box-shadow: 0 4px 15px hsla(var(--primary-hue), 50%, 30%, 0.2);
	}

	.search-icon {
		background: linear-gradient(135deg, 
			hsla(var(--primary-hue), 80%, 20%, 0.8),
			hsla(var(--primary-hue), 60%, 30%, 0.6)
		);
		border: 1px solid hsla(var(--primary-hue), 50%, 50%, 0.3);
		color: var(--primary-color);
		border-radius: 16px 0 0 16px !important;
		border-right: none !important;
	}

	.search-input {
		background: hsla(var(--primary-hue), 20%, 15%, 0.8) !important;
		border: 1px solid hsla(var(--primary-hue), 50%, 50%, 0.3) !important;
		color: var(--text-color) !important;
		font-size: 1.1rem !important;
		backdrop-filter: blur(10px);
		border-radius: 0 !important;
		transition: all 0.3s ease !important;
		border-left: none !important;
		border-right: none !important;
	}

	.search-input:focus {
		background: hsla(var(--primary-hue), 30%, 20%, 0.9) !important;
		border-color: var(--primary-color) !important;
		box-shadow: 0 0 0 0.2rem hsla(var(--primary-hue), 60%, 50%, 0.25) !important;
		color: var(--text-color) !important;
	}

	.clear-btn {
		border: 1px solid hsla(var(--primary-hue), 50%, 50%, 0.3) !important;
		background: hsla(var(--primary-hue), 80%, 20%, 0.8) !important;
		color: var(--text-color) !important;
		border-radius: 0 16px 16px 0 !important;
		transition: all 0.3s ease;
		border-left: none !important;
	}

	.clear-btn:hover {
		background: hsla(var(--primary-hue), 60%, 40%, 0.8) !important;
		color: white !important;
		border-color: hsla(var(--primary-hue), 50%, 50%, 0.6) !important;
	}

	/* Results Alert styling */
	.results-alert {
		background: linear-gradient(135deg, 
			hsla(200, 70%, 20%, 0.8), 
			hsla(210, 60%, 25%, 0.6)
		) !important;
		border: 1px solid hsla(200, 50%, 50%, 0.3) !important;
		color: hsl(200, 50%, 80%) !important;
		border-radius: 15px !important;
		backdrop-filter: blur(10px);
		font-size: 0.95rem;
	}

	.progress-card {
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 20%, 15%, 0.6),
			hsla(var(--primary-hue), 15%, 20%, 0.4)
		) !important;
		backdrop-filter: blur(10px);
		border-radius: 15px !important;
		border: 1px solid hsla(var(--primary-hue), 30%, 30%, 0.3) !important;
		min-width: 280px;
	}

	.progress-card .progress {
		background: hsla(var(--primary-hue), 20%, 10%, 0.5) !important;
		border-radius: 10px;
	}

	.progress-card .progress-bar {
		background: linear-gradient(90deg, 
			var(--primary-color), 
			hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%))
		) !important;
		border-radius: 10px;
		transition: width 0.4s ease;
	}

	/* FAQ Container */
	.faq-accordion {
		max-width: 900px;
		margin: 0 auto;
	}

	/* Bootstrap Accordion Customizations */
	.accordion-item {
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 20%, 12%, 0.8),
			hsla(var(--primary-hue), 15%, 18%, 0.6)
		);
		border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
		border-radius: 20px !important;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(15px);
		position: relative;
		margin-bottom: 1.5rem !important;
	}

	.accordion-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, 
			transparent, 
			var(--primary-color), 
			transparent
		);
		transition: left 0.5s ease;
		z-index: 1;
	}

	.accordion-item:hover::before {
		left: 100%;
	}

	.accordion-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 15px 35px hsla(var(--primary-hue), 70%, 50%, 0.15);
		border-color: hsla(var(--primary-hue), 60%, 50%, 0.5);
	}

	.accordion-item.expanded {
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 25%, 15%, 0.9),
			hsla(var(--primary-hue), 20%, 22%, 0.7)
		);
		border-color: hsla(var(--primary-hue), 50%, 50%, 0.6);
		box-shadow: 0 8px 32px hsla(var(--primary-hue), 70%, 50%, 0.2);
	}

	.accordion-button {
		background: transparent !important;
		border: none !important;
		color: var(--text-color) !important;
		padding: 1.5rem 2rem !important;
		font-weight: 600 !important;
		font-size: 1.1rem !important;
		border-radius: 0 !important;
		transition: all 0.3s ease !important;
		box-shadow: none !important;
		position: relative;
		z-index: 2;
	}

	.accordion-button:hover {
		background: hsla(var(--primary-hue), 30%, 20%, 0.3) !important;
	}

	.accordion-button:focus {
		box-shadow: 0 0 0 0.2rem hsla(var(--primary-hue), 60%, 50%, 0.25) !important;
	}

	.accordion-button:not(.collapsed) {
		color: var(--text-color) !important;
		background: hsla(var(--primary-hue), 30%, 20%, 0.4) !important;
	}

	.accordion-button::after {
		display: none !important;
	}

	.question-wrapper {
		align-items: center;
		gap: 1rem;
	}

	.accordion-item:hover::before {
		left: 100%;
	}

	.accordion-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 15px 35px hsla(var(--primary-hue), 70%, 50%, 0.15);
		border-color: hsla(var(--primary-hue), 60%, 50%, 0.5);
	}

	.accordion-item.expanded {
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 25%, 15%, 0.9),
			hsla(var(--primary-hue), 20%, 22%, 0.7)
		);
		border-color: hsla(var(--primary-hue), 50%, 50%, 0.6);
		box-shadow: 0 8px 32px hsla(var(--primary-hue), 70%, 50%, 0.2);
	}

	.accordion-button {
		background: transparent !important;
		border: none !important;
		color: var(--text-color) !important;
		padding: 1.5rem 2rem !important;
		font-weight: 600 !important;
		font-size: 1.1rem !important;
		border-radius: 0 !important;
		transition: all 0.3s ease !important;
		box-shadow: none !important;
		position: relative;
		z-index: 2;
	}

	.accordion-button:hover {
		background: hsla(var(--primary-hue), 30%, 20%, 0.3) !important;
	}

	.accordion-button:focus {
		box-shadow: 0 0 0 0.2rem hsla(var(--primary-hue), 60%, 50%, 0.25) !important;
	}

	.accordion-button:not(.collapsed) {
		color: var(--text-color) !important;
		background: hsla(var(--primary-hue), 30%, 20%, 0.4) !important;
	}

	.accordion-button::after {
		display: none !important;
	}

	.question-wrapper {
		align-items: center;
		gap: 1rem;
	}

	.question-icon {
		width: 50px;
		height: 50px;
		border-radius: 15px;
		background: linear-gradient(135deg, 
			var(--primary-color), 
			hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%))
		);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.2rem;
		flex-shrink: 0;
		transition: all 0.3s ease;
	}

	.accordion-item.expanded .question-icon {
		background: linear-gradient(135deg, 
			hsl(140, 60%, 50%), 
			hsl(120, 70%, 60%)
		);
		transform: rotate(180deg);
	}

	.question-text {
		font-weight: 600;
		color: var(--text-color);
		margin: 0;
		line-height: 1.4;
	}

	.category-badge {
		font-size: 0.7rem !important;
		font-weight: 600 !important;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-radius: 8px !important;
		padding: 0.25rem 0.5rem !important;
	}

	.category-filter {
		background: linear-gradient(135deg, 
			hsla(var(--primary-hue), 70%, 35%, 0.8),
			hsla(var(--primary-hue), 60%, 45%, 0.6)
		) !important;
		border: 1px solid hsla(var(--primary-hue), 50%, 50%, 0.4) !important;
		color: white !important;
		font-weight: 600 !important;
		border-radius: 15px !important;
		backdrop-filter: blur(10px);
		transition: all 0.3s ease !important;
		min-width: 180px;
		white-space: nowrap;
	}

	.category-filter:hover,
	.category-filter:focus,
	.category-filter:active,
	.category-filter.show {
		background: linear-gradient(135deg, 
			hsla(var(--primary-hue), 70%, 45%, 0.9),
			hsla(var(--primary-hue), 60%, 55%, 0.7)
		) !important;
		border-color: hsla(var(--primary-hue), 50%, 50%, 0.6) !important;
		color: white !important;
		transform: translateY(-1px);
		box-shadow: 0 0 0 0.2rem hsla(var(--primary-hue), 60%, 50%, 0.25) !important;
	}

	.category-text {
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: inline-block;
		vertical-align: top;
	}

	.expand-controls {
		border-radius: 15px !important;
		overflow: hidden;
		box-shadow: 0 2px 8px hsla(var(--primary-hue), 50%, 30%, 0.3);
	}

	.expand-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: hsla(var(--primary-hue), 40%, 30%, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--primary-color);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.expand-icon.rotated {
		transform: rotate(180deg);
		background: var(--primary-color);
		color: white;
	}

	/* Accordion Body */
	.accordion-body {
		padding: 2rem !important;
		border-top: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 15%, 10%, 0.8),
			hsla(var(--primary-hue), 10%, 15%, 0.6)
		);
		animation: slideDown 0.4s ease;
	}

	.answer-wrapper {
		align-items: flex-start;
		gap: 1rem;
	}

	.answer-icon {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: linear-gradient(135deg, 
			hsl(45, 90%, 50%), 
			hsl(40, 100%, 60%)
		);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.answer-text {
		color: var(--text-color);
		font-size: 1.1rem;
		line-height: 1.7;
		opacity: 0.95;
	}

	.answer-text :global(a) {
		color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%));
		text-decoration: underline;
		transition: all 0.3s ease;
	}

	.answer-text :global(a:hover) {
		color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 30%));
		text-shadow: 0 0 8px hsla(var(--primary-hue), 70%, 50%, 0.4);
	}

	.answer-text :global(ul) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.answer-text :global(li) {
		margin-bottom: 0.5rem;
		position: relative;
	}

	.answer-text :global(li::marker) {
		color: var(--primary-color);
	}

	.answer-text :global(strong) {
		color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 25%));
		font-weight: 700;
	}

	/* Footer CTA using Bootstrap Card */
	.footer-cta-card {
		background: linear-gradient(135deg,
			hsla(var(--primary-hue), 60%, 20%, 0.6),
			hsla(var(--primary-hue), 40%, 30%, 0.4)
		) !important;
		border-radius: 24px !important;
		border: 1px solid hsla(var(--primary-hue), 40%, 40%, 0.3) !important;
		backdrop-filter: blur(10px);
		box-shadow: 0 15px 35px hsla(var(--primary-hue), 70%, 50%, 0.1);
	}

	.cta-icon {
		color: var(--primary-color);
		opacity: 0.8;
	}

	.cta-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-color);
	}

	.cta-text {
		color: var(--text-color);
		opacity: 0.9;
	}

	.btn-discord {
		background: linear-gradient(135deg, #7289da, #5865f2) !important;
		border: none !important;
		color: white !important;
		font-weight: 600 !important;
		text-decoration: none !important;
		transition: all 0.3s ease !important;
		border-radius: 15px !important;
	}

	.btn-discord:hover {
		transform: translateY(-3px) !important;
		box-shadow: 0 10px 25px rgba(114, 137, 218, 0.4) !important;
		color: white !important;
		text-decoration: none !important;
	}

	.btn-updates {
		background: linear-gradient(135deg, 
			var(--primary-color), 
			hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%))
		) !important;
		border: none !important;
		color: white !important;
		font-weight: 600 !important;
		text-decoration: none !important;
		transition: all 0.3s ease !important;
		border-radius: 15px !important;
	}

	.btn-updates:hover {
		transform: translateY(-3px) !important;
		box-shadow: 0 10px 25px hsla(var(--primary-hue), 70%, 50%, 0.4) !important;
		color: white !important;
		text-decoration: none !important;
	}

	.help-item {
		padding: 1rem;
		border-radius: 15px;
		background: hsla(var(--primary-hue), 20%, 15%, 0.3);
		border: 1px solid hsla(var(--primary-hue), 30%, 30%, 0.2);
		transition: all 0.3s ease;
	}

	.help-item:hover {
		background: hsla(var(--primary-hue), 25%, 20%, 0.5);
		border-color: hsla(var(--primary-hue), 40%, 40%, 0.4);
		transform: translateY(-2px);
	}

	/* No Results with Bootstrap Card */
	.no-results-icon {
		opacity: 0.5;
	}

	/* Animations */
	@keyframes shimmer {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.8; }
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-section {
			padding: 2rem 1.5rem;
			border-radius: 20px;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		/* Better mobile layout for controls */
		.expand-controls {
			width: 100%;
			max-width: 280px;
		}

		.btn-expand,
		.btn-collapse {
			flex: 1;
			min-width: 0;
			font-size: 0.9rem;
		}

		.category-filter {
			width: 100%;
			max-width: 280px;
			min-width: auto;
			font-size: 0.9rem;
		}

		.category-text {
			max-width: 150px;
		}

		/* Search improvements for mobile */
		.search-container {
			border-radius: 12px !important;
		}

		.search-icon {
			border-radius: 12px 0 0 12px !important;
		}

		.clear-btn {
			border-radius: 0 12px 12px 0 !important;
		}

		.search-input {
			font-size: 1rem !important;
		}

		/* FAQ Items mobile improvements */
		.question-wrapper {
			gap: 1rem;
		}

		.question-icon {
			width: 45px;
			height: 45px;
		}

		.question-text {
			font-size: 1.05rem;
			line-height: 1.3;
		}

		.answer-wrapper {
			gap: 1rem;
		}

		.answer-icon {
			width: 35px;
			height: 35px;
			font-size: 1rem;
		}

		.answer-text {
			font-size: 1rem;
			line-height: 1.6;
		}

		.accordion-body {
			padding: 1.5rem !important;
		}

		.accordion-button {
			padding: 1.25rem 1.5rem !important;
			font-size: 1rem !important;
			min-height: 70px;
		}

		/* Improve touch targets */
		.btn-expand,
		.btn-collapse,
		.category-filter {
			min-height: 44px;
			padding: 0.75rem 1rem !important;
		}

		/* Progress card mobile */
		.progress-card {
			min-width: 250px;
		}
	}

	@media (max-width: 576px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-section {
			padding: 1.5rem 1rem;
			border-radius: 16px;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		/* Stack controls vertically on very small screens */
		.expand-controls {
			flex-direction: column;
			width: 100%;
			max-width: 200px;
		}

		.btn-expand,
		.btn-collapse {
			border-radius: 12px !important;
			width: 100%;
			margin-bottom: 0.25rem;
		}

		.btn-expand {
			margin-bottom: 0.25rem;
		}

		.category-filter {
			max-width: 200px;
			font-size: 0.9rem;
		}

		.category-text {
			max-width: 100px;
		}

		/* Compact FAQ items for very small screens */
		.accordion-item {
			border-radius: 16px !important;
			margin-bottom: 1rem !important;
		}

		.accordion-button {
			padding: 1rem 1.25rem !important;
			font-size: 0.95rem !important;
			min-height: 64px;
		}

		.accordion-body {
			padding: 1rem !important;
		}

		/* Ensure good touch targets on small screens */
		.btn-expand,
		.btn-collapse,
		.category-filter {
			min-height: 40px;
			padding: 0.6rem 0.8rem !important;
		}

		.question-icon,
		.expand-icon {
			width: 40px;
			height: 40px;
		}

		.answer-icon {
			width: 32px;
			height: 32px;
			font-size: 0.9rem;
		}

		.question-text {
			font-size: 1rem;
		}

		.answer-text {
			font-size: 0.95rem;
			line-height: 1.5;
		}

		.category-badge {
			font-size: 0.65rem !important;
			padding: 0.2rem 0.4rem !important;
		}

		/* Footer CTA mobile */
		.footer-cta-card .card-body {
			padding: 2rem !important;
		}

		.cta-title {
			font-size: 1.5rem;
		}

		.help-item {
			padding: 0.75rem;
		}
	}

	@media (max-width: 400px) {
		.hero-title {
			font-size: 1.75rem;
		}

		.category-filter,
		.expand-controls {
			max-width: 180px;
		}

		.category-text {
			max-width: 80px;
		}

		.progress-card {
			min-width: 200px;
		}
	}
</style>
