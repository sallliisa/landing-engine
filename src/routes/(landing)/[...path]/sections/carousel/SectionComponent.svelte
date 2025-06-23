<script lang="ts">
  import SectionHeader from "$lib/app/components/app/SectionHeader.svelte";
  import * as Carousel from "$lib/app/components/ui/carousel";

  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full flex flex-col items-center justify-center gap-8 py-6 lg:py-12">
    <div class="w-full max-w-screen-xl px-6 lg:px-12">
      <SectionHeader header={section.data.content} defaultAlign="center"/>
    </div>
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
      <Carousel.Content>
        {#each section.data.gallery as item, i (item.id || `carousel-${i}`)}
          {@render carouselItem(item)}
        {/each}
      </Carousel.Content>
      {#if section.meta.navigation_position == 'bottom'}
        {@render carouselNavigation()}
      {/if}
    </Carousel.Root>
  </div>
</div>

{#snippet carouselItem(item: any)}
  <Carousel.Item 
    class="min-[124rem]:basis-1/3 2xl:basis-1/2 lg:basis-[67%] basis-[85%] h-[450px] ml-1 p-0 before:bg-white/5 active:before:bg-white/10 relative overflow-hidden {item.url ? 'overlay' : ''}"
  >
    <div class="absolute inset-0 -z-10">
      <img 
        src={item.media} 
        alt="" 
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/33 to-black/33"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/33 to-transparent"></div>
    </div>
    {#if item.url}
      <a
        href={item.url}
        class="flex flex-col gap-base p-8 items-start justify-between text-surface h-full w-full group/carouselItem"
      >
        <div class="flex flex-col gap-base">
          <div class="flex flex-col gap-xs">
            <p class="text-2xl md:text-3xl font-bold">{item.title}</p>
            <p class="font-bold text-xl">{item.subtitle}</p>
          </div>
          <div class="flex flex-row gap-lg">
            {#each item.collection as collectionItem}
              <div class="flex flex-row items-center gap-sm">
                <i class={collectionItem.media}></i>
                <p>{collectionItem.title}</p>
              </div>
            {/each}
          </div>
        </div>
        <div class="flex flex-col gap-sm">
          <div class="rtf-content m-base translate-y-[28px] group-hover/carouselItem:translate-y-0 transition-all">{@html item.description}</div>
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
            <p class="font-bold text-xl">{item.subtitle}</p>
          </div>
          <div class="flex flex-row gap-lg">
            {#each item.collection as collectionItem}
              <div class="flex flex-row items-center gap-sm">
                <i class={collectionItem.media}></i>
                <p>{collectionItem.title}</p>
              </div>
            {/each}
          </div>
        </div>
        <div class="rtf-content m-base">{@html item.description}</div>
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