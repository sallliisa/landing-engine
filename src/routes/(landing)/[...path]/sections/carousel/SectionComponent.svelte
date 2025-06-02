<script lang="ts">
  import * as Carousel from "$lib/app/components/ui/carousel";

  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full flex flex-col items-center justify-center gap-8 pt-3 pb-6">
    {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
      <div class="flex max-w-screen-xl flex-col gap-base w-full items-center justify-center px-6 lg:px-12">
        <div class="flex flex-col gap-xs items-center">
          {#if section.data.content.subtitle}<p class="text-center">{section.data.content.subtitle}</p>{/if}
          {#if section.data.content.title}<p class="text-2xl md:text-3xl font-bold text-center">{section.data.content.title}</p>{/if}
        </div>
        {#if section.data.content.description}<p class="rtf-content m-base text-center">{@html section.data.content.description}</p>{/if}
      </div>
    {/if}
    <Carousel.Root
      opts={{
        containScroll: false
      }}
      class="w-full"
    >
      <Carousel.Content>
        {#each section.data.gallery as item, i (item.id || `carousel-${i}`)}
          <Carousel.Item 
            class="md:basis-1/3 basis-[85%] flex flex-col gap-base p-8 items-start justify-end text-surface h-[450px] ml-4 bg-center bg-cover" 
            style="background-image: linear-gradient(rgba(0, 0, 0, 0.33), rgba(0, 0, 0, 0.33)), linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%), url({item.media});"
          >
            <div class="flex flex-col gap-xs">
              <p class="font-bold">{item.subtitle}</p>
              <p class="text-3xl md:text-4xl font-bold">{item.title}</p>
            </div>
            <div class="rtf-content m-base">{@html item.description}</div>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
      <Carousel.Navigation/>
    </Carousel.Root>
  </div>
</div>