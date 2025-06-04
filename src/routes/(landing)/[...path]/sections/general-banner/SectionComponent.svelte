<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';

  const {section} = $props()

  const isEmptyDescription = !section.data.contents[0].description || section.data.contents[0].description.trim() === '';
  const bgImage = section.meta.add_overlay 
    ? `linear-gradient(rgba(0,0,0,0.33), rgba(0,0,0,0.33)), url(${section.meta.background_image})` 
    : `url(${section.meta.background_image})`;

  let initialNavbarTextColor = section.meta.add_overlay ? 'var(--colors-surface)' : 'var(--colors-on-surface)'; // Or your specific color values

  onMount(() => {
    if (browser) {
      document.documentElement.style.setProperty('--initial-text-color', initialNavbarTextColor);
    }
  });

  onDestroy(() => {
    if (browser) {
      // Optional: Reset the variable when the component is destroyed if needed
      document.documentElement.style.removeProperty('--initial-text-color');
    }
  });
</script>

<div class="flex flex-col {section.meta.add_overlay ? 'text-surface' : 'text-on-surface'}">
  <div
    class="h-fit md:h-[40vh] flex justify-center bg-cover bg-center border border-b border-outline-variant {isEmptyDescription ? 'items-end' : 'items-center'}"
    style="background-image: {bgImage}"
  >
    <div class="px-6 lg:px-12 {isEmptyDescription ? 'pb-12' : 'pt-12 lg:pt-24 pb-12'} flex {isEmptyDescription ? 'flex-col items-center text-center' : 'md:flex-row flex-col items-center'} gap-4 max-w-screen-xl w-full">
      <div class="w-full">
        <p class="text-2xl md:text-3xl font-bold">{section.data.contents[0].title}</p>
      </div>
      {#if !isEmptyDescription}
        <div class="w-full flex md:items-end md:justify-end">
          <p class="max-w-[50ch]">{@html section.data.contents[0].description}</p>
        </div>
      {/if}
    </div>
  </div>
  <div class="h-[12px] w-full flex items-center justify-center">
    <div class="max-w-screen-xl w-full h-full relative">
      <!-- <div class="flex flex-col gap-3 fixed pt-12">
        <button class="text-start underline font-semibold">Pesan Direktur</button>
        <button class="text-start text-outline">Visi & Misi</button>
        <button class="text-start text-outline">Pencapaian Perusahaan</button>
        <button class="text-start text-outline">Struktur Organisasi</button>
        <button class="text-start text-outline">Manajemen</button>
        <button class="text-start text-outline">Anak Perusahaan</button>
      </div> -->
    </div>
  </div>
</div>