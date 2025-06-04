<script lang="ts">
  import * as Carousel from "$lib/app/components/ui/carousel";

  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full flex flex-col items-center justify-center gap-8 pt-3 pb-6">
    {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
      <div class="flex flex-row items-center justify-between max-w-screen-xl w-full px-6 lg:px-12">
        <div class="flex flex-col gap-sm {section.data.content.url ? '' : 'items-center justify-center text-center'}">
          <div class="flex flex-col gap-xs">
            {#if section.data.content.subtitle}<p class="">{section.data.content.subtitle}</p>{/if}
            {#if section.data.content.title}<p class="text-2xl md:text-3xl font-bold ">{section.data.content.title}</p>{/if}
          </div>
          {#if section.data.content.description}<p class="rtf-content m-base text-sm text-outline">{@html section.data.content.description}</p>{/if}
        </div>
        {#if section.data.content.url}
          <div class="flex flex-row items-center gap-sm flex-shrink-0">
            <a href={section.data.content.url} class="font-semibold underline">Lebih Banyak</a>
            <i class="ri-arrow-right-line"></i>
          </div>
        {/if}
      </div>
    {/if}
    <Carousel.Root
      opts={{
        containScroll: false
      }}
      class="w-full"
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
    class="md:basis-1/3 basis-[80%] h-[450px] ml-4 bg-center bg-cover p-0 before:bg-white/5 active:before:bg-white/10 {item.url ? 'overlay' : ''}" 
    style="background-image: linear-gradient(rgba(0, 0, 0, 0.33), rgba(0, 0, 0, 0.33)), linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%), url({item.media});"
  >
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
          <div class="flex flex-row items-center gap-sm text-sm opacity-0 group-hover/carouselItem:opacity-100 translate-y-[28px] group-hover/carouselItem:translate-y-0 transition-all font-semibold">
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
        <div class="flex items-center justify-center space-x-2 p-4">
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