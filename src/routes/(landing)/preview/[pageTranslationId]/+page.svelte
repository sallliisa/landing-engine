<script lang="ts">
	import LandingSections from '$lib/components/landing/LandingSections.svelte';

	const { data } = $props();
</script>

<!-- <div class="sticky top-0 z-[45] mx-auto w-full max-w-screen-2xl px-4 pt-4">
	<div class="flex items-center justify-between gap-4 rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-on-surface backdrop-blur-sm">
		<div class="flex items-center gap-2 font-semibold">
			<span class="inline-block h-2 w-2 rounded-full bg-warning"></span>
			<span>Preview Mode</span>
		</div>
		<p class="text-right text-xs sm:text-sm">
			{data.preview.statusCode} · {data.preview.language.toUpperCase()} · {data.preview.pageTranslationId}
		</p>
	</div>
</div> -->

<LandingSections {data} />
