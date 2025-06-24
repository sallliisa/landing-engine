<script lang="ts">
	import '../app.css';
	import 'remixicon/fonts/remixicon.css'

	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="/assets/pannellum/pannellum.css" />
	<script type="text/javascript" src="/assets/pannellum/pannellum.js"></script>
</svelte:head>

{@render children()}
