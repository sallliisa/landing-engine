<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { sectionComponents } from './sections/index.js'

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

<div class="flex flex-col gap-6 col-span-4">
  {#each data.sections as section, index (section.id)}
    {#if section?.section_type_code}
      {@const sectionComponentPromise = getSectionComponent(section.section_type_code)}
      {#if sectionComponentPromise}
        {#await sectionComponentPromise then SectionComponent}
          <SectionComponent {section}/>
        {/await}
      {:else}
        <div class="h-[20vh] bg-primary flex items-center justify-center">
          <p class="text-4xl font-bold">Section Missing</p>
        </div>
      {/if}
    {/if}
  {/each}
</div>