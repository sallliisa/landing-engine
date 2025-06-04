<script lang="ts">
  import { browser } from "$app/environment";
  import { debounce } from "$lib/utils/common";
  import { onDestroy, onMount } from "svelte";
  import { blur, fade } from "svelte/transition";

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

  let activeProjectCategoryIndex = $state(0)

  let windowWidth = $state(0)

  const debouncedOnCategoryHover = debounce((index: number) => {
    activeProjectCategoryIndex = index
  }, 100)

  setInterval(() => {
    activeBannerIndex = (activeBannerIndex + 1) % section.data.banner.length
  }, 8000)
</script>

<svelte:window bind:innerWidth={windowWidth}/>
<div class="flex flex-col items-center justify-center">
  <div class="min-h-[80vh] h-[80vh] flex flex-col items-center justify-center bg-black/80 text-white w-full relative">
    {#if section.data.banner[activeBannerIndex]?.media}
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
      <div class="w-full h-full absolute z-[1]" style="background-image: linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%);"></div>
    {/if}
    <div class="flex w-full h-full items-center justify-center">
      <div class="flex flex-col gap-base items-center justify-center z-[10] max-w-[90ch]">
        <div class="flex flex-col gap-xs">
          {#if section.data.banner[activeBannerIndex]?.subtitle}<p class="text-center">{section.data.banner[activeBannerIndex]?.subtitle}</p>{/if}
          {#if section.data.banner[activeBannerIndex]?.title}<p class="text-center text-4xl md:text-5xl 2xl:text-6xl font-bold ">{section.data.banner[activeBannerIndex]?.title}</p>{/if}
        </div>
        {#if section.data.banner[activeBannerIndex]?.description}<p class="rtf-content m-base text-center text-sm text-outline">{@html section.data.banner[activeBannerIndex]?.description}</p>{/if}
      </div>
    </div>
    <div class="md:px-6 px-12 py-6 flex flex-row items-center gap-base z-[10]">
      {#each section.data.quickAccess as quickAccess}
        <a href={quickAccess.url} class="w-[384px] p-6 outline outline-outline bg-surface text-on-surface flex flex-row items-start gap-base overlay before:bg-on-surface/5 active:before:bg-on-surface/10">
          <i class="{quickAccess.media} text-lg"></i>
          <div class="flex flex-col gap-sm">
            <p class="font-bold">{quickAccess.title}</p>
            <p class="text-sm text-outline">{quickAccess.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
  <div class="h-[20vh] w-full p-[1px] flex flex-row items-center gap-[1px]">
    {#each section.data.projectCategory as projectCategory, index}
      <div
        class="flex bg-center relative bg-cover flex-col text-surface h-full items-start justify-end gap-xs {activeProjectCategoryIndex === index ? 'px-6 py-4' : 'px-1 py-1'} transition-all"
        style="
          background-image: linear-gradient(rgba(0,0,0,0.32), rgba(0,0,0,0.32)), linear-gradient(to top, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 100%), url({projectCategory.media});
          width: {activeProjectCategoryIndex === index ? `${(windowWidth-2)*0.475}px` : `${((windowWidth-2)-((windowWidth-2)*0.475))/(section.data.projectCategory?.length-1)}px`};
        "
        onmouseover={() => debouncedOnCategoryHover(index)}
        role="button"
        onfocus={() => {}}
        tabindex={index}
      >
        {#if activeProjectCategoryIndex === index}
          <div
            in:blur={{duration: 100, delay: 100}}
            out:blur={{duration: 100}}
            class="flex flex-col gap-sm absolute bottom-4 left-6"
          >
            <div class="flex flex-col">
              <p class="font-bold">{projectCategory.title}</p>
              {#if projectCategory.description}<p>{projectCategory.description}</p>{/if}
            </div>
            <p class="text-xs">Lihat Selengkapnya <i class="ri-arrow-right-up-line"></i></p>
          </div>
          {:else}
            <p
              in:blur={{duration: 100}}
              out:blur={{duration: 100}}
              class="font-bold bottom-1 left-1"
            >
              {projectCategory.title}
            </p>
          {/if}
      </div>
    {/each}
  </div>
</div>