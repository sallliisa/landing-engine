<script lang="ts">
	import LandingSections from '$lib/components/landing/LandingSections.svelte';

	const { data } = $props();
</script>

<LandingSections {data} />
