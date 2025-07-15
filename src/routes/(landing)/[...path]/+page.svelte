<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { sectionComponents } from './sections/index.js'
  import SectionWrapper from './SectionWrapper.svelte';
  import IntersectionObserver from '$lib/components/IntersectionObserver.svelte';

  export let data;

  // Helper to load and cache components
  let loadedComponents: Record<string, any> = {};

  async function getSectionComponent(section_type_code: string) {
    if (!loadedComponents[section_type_code]) {
      const mod = await sectionComponents[section_type_code]();
      loadedComponents[section_type_code] = mod.default;
    }
    return loadedComponents[section_type_code];
  }
</script>

<div class="flex flex-col col-span-4">
  {#each data.sections as section, index (section.id)}
    {#if section?.section_type_code}
      {#if section.visible}
      {@const sectionComponentPromise = getSectionComponent(section.section_type_code)}
        {#if sectionComponentPromise}
          {#await sectionComponentPromise then SectionComponent}
            {#if index != 0}
            <!-- <IntersectionObserver
              threshold={0.1} 
              animationDelay={100} 
              animationDirection="fade-up"
              once
            > -->
              <SectionComponent {section}/>
            <!-- </IntersectionObserver> -->
            {:else}
              <SectionComponent {section}/>
            {/if}
          {/await}
        {:else}
          <!-- <SectionWrapper {section} {index}> -->
            <div class="h-[20vh] bg-primary flex items-center justify-center">
              <p class="text-4xl font-bold">Section Missing</p>
            </div>
          <!-- </SectionWrapper> -->
        {/if}
      {/if}
    {/if}
  {/each}
</div>