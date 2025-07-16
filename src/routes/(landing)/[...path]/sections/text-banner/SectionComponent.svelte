<script lang="ts">
  import { browser } from '$app/environment';
  import SectionHeader from '$lib/app/components/app/SectionHeader.svelte';
  import { onMount, onDestroy } from 'svelte';

  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full max-w-screen-xl py-6 lg:py-12 px-6 lg:px-12 grid grid-cols-3 gap-lg">
    <div class="col-span-1">
      <img src="{section.data.content.media}" alt="{section.data.content.title}" class="w-full h-[240px] sm:h-[320px] object-center object-cover outline outline-outline-variant"/>
    </div>
    <div class="col-span-2">
      <SectionHeader header={section.data.content}/>
    </div>
  </div>
</div>