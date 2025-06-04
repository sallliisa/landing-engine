<script lang="ts">
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

  const {section} = $props()

  let activeBannerIndex = $state(0)

  let initialNavbarTextColor = 'var(--colors-surface)';

  onMount(() => {
    if (browser) {
      document.documentElement.style.setProperty('--initial-text-color', initialNavbarTextColor);
    }
  });

  onDestroy(() => {
    if (browser) {
      document.documentElement.style.removeProperty('--initial-text-color');
    }
  });

  setInterval(() => {
    activeBannerIndex = (activeBannerIndex + 1) % section.data.banner.length
  }, 8000)
</script>

<div class="h-screen flex items-end bg-black/80 text-white w-full relative">
  {#if !section.data.banner[activeBannerIndex]?.media_type || section.data.banner[activeBannerIndex]?.media_type === 'image'}
    {#key activeBannerIndex}
      <img transition:fade={{duration: 250}} class="w-full h-full object-center object-cover absolute" src={section.data.banner[activeBannerIndex]?.media} alt="banner"/>
    {/key}
  {:else if section.data.banner[activeBannerIndex]?.media_type === 'video'}
    {#key activeBannerIndex}
      <video transition:fade={{duration: 250}} autoplay muted loop playsinline class="w-full h-full absolute object-cover object-center">
        <source src="{section.data.banner[activeBannerIndex]?.media}"/>
      </video>
    {/key}
  {/if}
  <div class="w-full h-full absolute z-[1]" style="background-image: linear-gradient(rgba(0, 0, 0, 0.32), rgba(0, 0, 0, 0.32));"></div>
  <div class="w-full h-full absolute z-[1]" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);"></div>
  <div class="max-w-screen-xl flex lg:px-12 lg:py-12 px-4 py-8 w-full relative z-10">
    {#key activeBannerIndex}
      <div in:fly={{y: 25, delay: 250, duration: 250, opacity: 0.0001}} out:fly={{y: -25, duration: 250, opacity: 0.0001}} class="flex flex-col gap-sm lg:gap-base max-w-full min-w-full w-full justify-center">
        <div class="flex flex-col gap-xs w-full">
          {#if section.data.banner[activeBannerIndex]?.subtitle}<p class="w-full">{section.data.banner[activeBannerIndex].subtitle}</p>{/if}
          {#if section.data.banner[activeBannerIndex]?.title}<p class="text-5xl lg:text-7xl w-full font-bold">{section.data.banner[activeBannerIndex].title}</p>{/if}
        </div>
        <div class="rtf-content w-full m-base">
          {#if section.data.banner[activeBannerIndex]?.description}{@html section.data.banner[activeBannerIndex].description}{/if}
        </div>
      </div>
    {/key}
  </div>
</div>