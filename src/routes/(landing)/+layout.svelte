<script lang="ts">
  import Footer from '$lib/app/components/app/Footer.svelte';
  import NavbarDesktop from '$lib/app/components/app/NavbarDesktop.svelte';
  import { fade } from 'svelte/transition';
	import '../../app.css';
	import 'remixicon/fonts/remixicon.css'
  import { navigating } from '$app/state';
  import { onMount } from 'svelte';
  import NavbarMobile from '$lib/app/components/app/NavbarMobile.svelte';
  import DateInput from '$lib/app/components/input/DateInput.svelte';
  import TextInput from '$lib/app/components/input/TextInput.svelte';
  import SelectInput from '$lib/app/components/input/SelectInput.svelte';
  import TextareaInput from '$lib/app/components/input/TextareaInput.svelte';
  import NumberInput from '$lib/app/components/input/NumberInput.svelte';
  import FileInput from '$lib/app/components/input/FileInput.svelte';
  import ImageInput from '$lib/app/components/input/ImageInput.svelte';
  import FloatingContact from '$lib/app/components/app/FloatingContact.svelte';

	let wInnerWidth = $state(0)
	
	onMount(() => {
    wInnerWidth = window.innerWidth
    window.addEventListener('resize', () => {
      wInnerWidth = window.innerWidth
    })
  })

	let { children, data } = $props();

	let testValue = $state<Record<string, any>>({
		input5: "http://localhost:5173/storage/temp/private/1747495836045-6578b26fa3462e7291e1aa87_contact-texture.png"
	})
	
	$effect(() => {
		if (navigating.complete) {
			console.log('nav', navigating.from, 'to', navigating.to)
		}
	})
</script>

<div class="bg-surface text-on-surface min-h-screen flex flex-col justify-between">
	<div class="flex flex-col w-full">
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
	</div>
	<!-- <div class="mt-[400px]"></div>
	<div class="w-full flex items-center justify-center">
		<div class="w-full max-w-screen-2xl flex flex-col gap-12">
			{JSON.stringify(testValue)}
			<SelectInput bind:value={testValue.input1} data={[{id: 'text', name: 'Teks'}, {id: 'image', name: 'Gambar'}]}/>
			<DateInput bind:value={testValue.input2}/>
			<TextInput bind:value={testValue.input3} placeholder="Muslik"/>
			<TextareaInput bind:value={testValue.input3} placeholder="Muslik"/>
			<NumberInput bind:value={testValue.input4} placeholder="Masukkan angka"/>
			<FileInput bind:value={testValue.input5}/>
			<ImageInput bind:value={testValue.input5}/>
		 </div>
	</div> -->
	<Footer/>
	<!-- <FloatingContact /> -->
</div>
