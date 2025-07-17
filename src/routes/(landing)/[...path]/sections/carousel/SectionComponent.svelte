<script lang="ts">
  import SectionHeader from "$lib/app/components/app/SectionHeader.svelte";
  import * as Carousel from "$lib/app/components/ui/carousel";
  import CenterNavigation from "$lib/app/components/ui/carousel/carousel-center-navigation.svelte";

  const {section} = $props()

  const aspectRatioMap: any = {
    '1/1': 'aspect-[1/1]',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
  }

  section.meta.navigation_position = 'center'
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full flex flex-col items-center justify-center gap-8 py-6 lg:py-12">
    <div class="w-full max-w-screen-xl px-6 lg:px-12">
      <SectionHeader header={section.data.content} defaultAlign="center"/>
    </div>
    <div class="relative w-full">
      <Carousel.Root
        opts={{
          containScroll: false,
          dragFree: true,
          loop: section.meta.loop,
        }}
        class="w-full flex flex-col gap-8"
      >
        {#if section.meta.navigation_position == 'top'}
          {@render carouselNavigation()}
        {/if}
        <div class="relative w-full">
          <Carousel.Content>
            {#each section.data.gallery as item, i (item.id || `carousel-${i}`)}
              {@render carouselItem(item)}
            {/each}
          </Carousel.Content>
          {#if section.meta.navigation_position == 'center'}
            <CenterNavigation />
          {/if}
        </div>
        {#if section.meta.navigation_position == 'bottom'}
          {@render carouselNavigation()}
        {/if}
      </Carousel.Root>
    </div>
  </div>
</div>

{#snippet carouselItem(item: any)}
  <Carousel.Item 
    class="min-[124rem]:basis-1/3 2xl:basis-1/2 lg:basis-[67%] basis-[85%] ml-1 p-0 before:bg-white/5 active:before:bg-white/10 relative overflow-hidden {item.url ? 'overlay' : ''} {section.meta.preserve_aspect_ratio ? aspectRatioMap[section.meta.aspect_ratio || '4/3'] : 'h-[450px]'}"
  >
    <div class="absolute inset-0 -z-10">
      <img 
        src={item.media} 
        alt="" 
        class="w-full h-full object-cover"
      />
      {#if item.title || item.subtitle || item.description || item.collection?.length}
        <div class="absolute inset-0 bg-gradient-to-b from-black/[16%] to-black/[16%]"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/[16%] to-transparent"></div>
      {/if}
    </div>
    {#if item.url}
      <a
        href={item.url}
        class="flex flex-col gap-base p-8 items-start justify-between text-surface h-full w-full group/carouselItem text-shadow-outline-variant"
      >
        <div class="flex flex-col gap-base">
          <div class="flex flex-col gap-xs">
            <p class="text-2xl md:text-3xl font-bold">{item.title}</p>
            <p class="font-semibold text-xl">{item.subtitle}</p>
          </div>
          <div class="flex flex-row gap-lg">
            {#each item.collection as collectionItem}
              <div class="flex flex-row items-center gap-sm">
                <i class={collectionItem.media}></i>
                <p class="text-sm md:text-base">{collectionItem.title}</p>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex flex-col gap-sm">
          <div class="rtf-content m-base translate-y-[28px] group-hover/carouselItem:translate-y-0 transition-all text-sm md:text-base">{@html item.description}</div>
          <div class="flex flex-row items-center gap-sm text-sm opacity-0 group-hover/carouselItem:opacity-100 translate-y-[28px] group-hover/carouselItem:translate-y-0 transition-all">
            <p>Lebih Banyak</p>
            <i class="ri-arrow-right-up-line"></i>
          </div>
        </div>
      </a>
    {:else}
      <div class="flex flex-col gap-base p-8 items-start justify-between text-surface h-full w-full">
        <div class="flex flex-col gap-base">
          <div class="flex flex-col gap-xs">
            <p class="text-2xl md:text-3xl font-bold">{item.title}</p>
            <p class="font-semibold text-xl">{item.subtitle}</p>
          </div>
          <div class="flex flex-row gap-lg">
            {#each item.collection as collectionItem}
              <div class="flex flex-row items-center gap-sm">
                <i class={collectionItem.media}></i>
                <p class="text-sm md:text-base">{collectionItem.title}</p>
              </div>
            {/each}
          </div>
        </div>
        <div class="rtf-content m-base text-sm md:text-base">{@html item.description}</div>
      </div>
    {/if}
  </Carousel.Item>
{/snippet}

{#snippet carouselNavigation()}
  {#if section.meta.use_title_as_navigation}
    <Carousel.Navigation>
      {#snippet navigation({scrollPrev, handleClick, scrollNext, currentIndex}: any)}
        <div class="flex items-center justify-center space-x-4">
          {#each section.data.gallery as item, i}
            <button onclick={() => handleClick(i)} class="{currentIndex === i ? 'text-on-surface font-semibold' : 'text-outline'}">{item.title}</button>
          {/each}
        </div>
      {/snippet}
    </Carousel.Navigation>
  {:else}
    <Carousel.Navigation/>
  {/if}
{/snippet}