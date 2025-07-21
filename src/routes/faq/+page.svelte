<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>FAQ - DreamingDragons</title>
	<meta name="description" content="Frequently Asked Questions about DreamingDragons" />
</svelte:head>

<div class="container mt-5">
	<h1 class="text-center mb-4">Frequently Asked Questions</h1>

	<div class="accordion" id="faqAccordion">
		{#each data.faqData as item, i}
			<div class="accordion-item">
				<h2 class="accordion-header" id="heading{i}">
					<button
						class="accordion-button collapsed"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#collapse{i}"
						aria-expanded="false"
						aria-controls="collapse{i}"
					>
						{item.question}
					</button>
				</h2>
				<div
					id="collapse{i}"
					class="accordion-collapse collapse"
					aria-labelledby="heading{i}"
					data-bs-parent="#faqAccordion"
				>
					<div class="accordion-body">
						{@html item.answer}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.accordion-button {
		background-color: #2c004a;
		color: white;
	}

	.accordion-button:not(.collapsed) {
		background-color: #4a007d;
		color: white;
	}

	.accordion-button:focus {
		box-shadow: 0 0 0 0.25rem rgba(92, 0, 166, 0.5);
	}

	.accordion-item {
		background-color: #1a002e;
		border: 1px solid #4a007d;
	}

	.accordion-body {
		background-color: #23003d;
	}
</style>
