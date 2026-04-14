<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import IntersectionObserver from '$lib/components/IntersectionObserver.svelte';
	import { sectionComponents } from '../../../routes/(landing)/[...path]/sections/index.js';

	const { data } = $props();

	let loadedComponents: Record<string, any> = {};

	async function getSectionComponent(section_type_code: string) {
		if (!loadedComponents[section_type_code]) {
			const mod = await sectionComponents[section_type_code]();
			loadedComponents[section_type_code] = mod.default;
		}
		return loadedComponents[section_type_code];
	}

	$effect(() => {
		if (!browser) return;

		const hash = $page.url.hash;
		if (!hash) return;

		const id = hash.substring(1);

		const scrollToElement = () => {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		};

		scrollToElement();

		const observer = new MutationObserver((_mutations, obs) => {
			if (document.getElementById(id)) {
				scrollToElement();
				obs.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class="flex flex-col col-span-4">
	{#each data.sections as section, index (section.id)}
		{#if section?.section_type_code}
			{#if section.visible}
				{@const sectionComponentPromise = getSectionComponent(section.section_type_code)}
				{#if sectionComponentPromise}
					{#await sectionComponentPromise then SectionComponent}
						{#if index !== 0}
							<IntersectionObserver threshold={0.05} animationDelay={100} animationDirection="fade-up" once>
								<SectionComponent {section} />
							</IntersectionObserver>
						{:else}
							<SectionComponent {section} />
						{/if}
					{/await}
				{:else}
					<div class="h-[20vh] bg-primary flex items-center justify-center">
						<p class="text-4xl font-bold">Section Missing</p>
					</div>
				{/if}
			{/if}
		{/if}
	{/each}
</div>
