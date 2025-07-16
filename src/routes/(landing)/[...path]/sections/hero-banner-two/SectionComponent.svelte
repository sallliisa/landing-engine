<script lang="ts">
  import { browser } from "$app/environment";
  import SelectInput from "$lib/app/components/input/SelectInput.svelte";
  import Button from "$lib/app/components/ui/Button.svelte";
  import { getLocale } from "$lib/paraglide/runtime";
  import { onDestroy, onMount } from "svelte";
	import { blur, fade, fly } from "svelte/transition";

  const {section} = $props()

  let activeBannerIndex = $state(0)
  
  // Preload adjacent images
  const preloadIndexes = $derived([
    (activeBannerIndex - 1 + section.data.banner.length) % section.data.banner.length,
    activeBannerIndex,
    (activeBannerIndex + 1) % section.data.banner.length
  ]);

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
  }, 10000)

  let locationActiveCode = $state('')
  let categoryActiveCode = $state('')

  let locale = $derived.by(getLocale)

  const categoryFilterNameMap: Record<string, string> = $derived.by(() => {
    return Object.fromEntries(section.data.filter.category?.map((item: any) => [item.code, locale === 'id' ? item.name_id : item.name_en]) || []);
  })

  const locationFilterNameMap: Record<string, string> = $derived.by(() => {
    return Object.fromEntries(section.data.filter.location?.map((item: any) => [item.code, item.name]) || []);
  })
</script>

<div class="h-screen flex items-end bg-black/80 text-white w-full relative">
  <!-- Preload adjacent images -->
  {#each section.data.banner as banner, i}
    {#if preloadIndexes.includes(i) && banner?.media}
      {#if (!banner?.media_type || banner?.media_type === 'image')}
        {#if i === activeBannerIndex}
          <img 
            transition:fade={{duration: 250}} 
            class="w-full h-full object-center object-cover absolute" 
            src={banner.media} 
            alt="banner"
            loading="eager"
          />
        {:else}
          <img 
            class="hidden" 
            src={banner.media} 
            alt="" 
            loading="eager"
            aria-hidden="true"
          />
        {/if}
      {:else if banner?.media_type === 'video' && i === activeBannerIndex}
        <video 
          transition:fade={{duration: 250}} 
          autoplay 
          muted 
          loop 
          playsinline 
          class="w-full h-full absolute object-cover object-center"
        >
          <source src={banner.media} type="video/mp4"/>
        </video>
      {/if}
    {/if}
  {/each}
  <div class="w-full h-full absolute z-[1]" style="background-image: linear-gradient(rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.16));"></div>
  <div class="w-full h-full absolute z-[1]" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0) 100%);"></div>
  <div class="w-full h-full absolute bottom-0 left-0 z-10 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="flex items-end">
      {#each section.data.banner as banner, i (i)}
        <div class="w-full">
          <div class="flex flex-col gap-4 text-left transition-all duration-500 text-shadow-outline-variant {activeBannerIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}"
            style="
              transition-property: opacity, filter;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-duration: {activeBannerIndex === i ? '500ms' : '250ms'};
              transition-delay: {activeBannerIndex === i ? '150ms' : '0ms'};
              filter: {activeBannerIndex === i ? 'none' : 'blur(8px)'};
              will-change: opacity, filter;
            "
          >
            {#if section.meta.logo}<img src="{section.meta.logo}" class="max-w-[72px]" alt="{banner.subtitle}"/>{/if}
            {#if banner?.subtitle}<p class="text-lg md:text-xl">{banner.subtitle}</p>{/if}
            {#if banner?.title}<h1 class="text-4xl md:text-5xl 2xl:text-6xl font-bold">{banner.title}</h1>{/if}
            {#if banner?.description}<div class="rtf-content mt-4 text-sm">{@html banner.description}</div>{/if}
          </div>
        </div>
      {/each}
    </div>
    <div class="hidden md:flex items-end justify-end">
      <div class="relative">
        <div class="max-w-fit p-4 bg-surface rounded-full flex flex-row items-center gap-base relative outline z-[1] outline-outline-variant text-on-surface">
          <SelectInput
            data={[{code: '', name: 'Semua Lokasi'}, ...(section.data.filter.location || [])]} 
            bind:value={locationActiveCode} 
            view="name" 
            pick="code" 
            placeholder="Semua Lokasi"
            class="w-full sm:w-[280px] outline-none !p-0"
          />
          <div class="h-[24px] w-[1px] border-outline-variant border-l"></div>
          <SelectInput
            data={[{code: '', name_id: 'Semua Kategori'}, ...(section.data.filter.category || [])]}
            bind:value={categoryActiveCode}
            view="name_id"
            pick="code"
            placeholder="Semua Kategori"
            class="w-full sm:w-[280px] outline-none !p-0"
          />
        </div>
        <div
          class="w-full absolute bottom-0 left-0 rounded-b-[32px] rounded-t-[16px] outline outline-outline-variant bg-surface text-on-surface flex flex-col gap-base p-4 pb-8 transition-all duration-400"
          style="height: {locationActiveCode || categoryActiveCode ? '420px' : '0px'};"
        >
          {#if section.data.projects?.length}
            {#each section.data.projects as project}
              <a href={project.url} class="flex flex-row items-center gap-sm hover:bg-surface-muted rounded-sm">
                <img class="w-[66px] aspect-square rounded-sm" src={project.media} alt={project.name}/>
                <div class="flex flex-col gap-xs">
                  <p class="font-bold">{project.title}</p>
                  <p class="text-sm">{categoryFilterNameMap[project.meta?.category]}, {locationFilterNameMap[project.meta?.location]}</p>
                </div>
              </a>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>