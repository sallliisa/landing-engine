<script lang="ts">
  import Footer from '$lib/app/components/app/Footer.svelte';
  import NavbarDesktop from '$lib/app/components/app/NavbarDesktop.svelte';
  import { fade } from 'svelte/transition';
	import '../app.css';
	import 'remixicon/fonts/remixicon.css'
  import { navigating } from '$app/state';
  import { onMount } from 'svelte';
  import NavbarMobile from '$lib/app/components/app/NavbarMobile.svelte';

	let wInnerWidth = $state(0)
	
	onMount(() => {
    wInnerWidth = window.innerWidth
    window.addEventListener('resize', () => {
      wInnerWidth = window.innerWidth
    })
  })

	let { children } = $props();
</script>

<div class="bg-surface text-on-surface">
	{#if wInnerWidth >= 1024}
		<NavbarDesktop/>
	{:else}
		<NavbarMobile/>
	{/if}
	{#if navigating.complete}
		<div
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			class="fixed top-0 z-[48] w-full min-h-screen h-screen backdrop-blur-md"
		></div>
	{/if}
	{@render children()}
	<Footer/>
</div>
