<script lang="ts">
  import SectionHeader from "$lib/app/components/app/SectionHeader.svelte";

  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full max-w-screen-xl flex flex-col gap-6 pt-3 pb-6 px-6 lg:px-12">
    <SectionHeader header={section.data.content} defaultAlign="center"/>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-base">
      {#each section.data.gallery as item, i (item.id || `testimonial-${i}`)}
        {@render testimonialItem(item)}
      {/each}
    </div>
  </div>
</div>

{#snippet testimonialItem(data: any)}
  <div class="h-full outline outline-outline-variant flex flex-col gap-6 justify-between p-8">
    <p class="rtf-content m-base">{@html data.description}</p>
    <div class="flex flex-row items-center gap-base">
      <img src="{data.media}" class="w-[48px] rounded-full" alt="{data.title}"/>
      <p>{data.title}</p>
    </div>
  </div>
{/snippet}

<!-- <div class="flex items-center justify-center w-full">
  <div class="w-full max-w-screen-xl flex flex-col gap-6 pt-3 pb-6 px-6 lg:px-12">
    {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
      <div class="flex flex-col gap-base w-full items-center justify-center">
        <div class="flex flex-col gap-xs items-center">
          {#if section.data.content.subtitle}<p class="text-center">{section.data.content.subtitle}</p>{/if}
          {#if section.data.content.title}<p class="text-2xl md:text-3xl font-bold text-center">{section.data.content.title}</p>{/if}
        </div>
        {#if section.data.content.description}<p class="rtf-content m-base text-center">{@html section.data.content.description}</p>{/if}
      </div>
    {/if}
    {#if section.data.gallery?.length}
      {@const itemsPerRowDesktop = 6}
      {@const itemsPerRowTablet = 4} 

      <div class="flex flex-col gap-6">
        <div class="hidden lg:flex flex-col gap-6">
          {#each Array(Math.ceil(section.data.gallery.length / itemsPerRowDesktop)) as _, rowIndex}
            {@const rowItems = section.data.gallery.slice(rowIndex * itemsPerRowDesktop, (rowIndex + 1) * itemsPerRowDesktop)}
            <div class="flex flex-row gap-6">
              {#each Array(3) as _, colIndex}
                {@const colStartIndex = colIndex * 2}
                {@const colItems = rowItems.slice(colStartIndex, colStartIndex + 2)}
                {#if colItems.length > 0}
                  <div class="flex flex-col gap-6 flex-1">
                    {#each colItems as item, itemIdx (item.id || `desktop-${rowIndex}-${colIndex}-${itemIdx}`)}
                      <div class="h-fit outline outline-outline-variant flex flex-col gap-6 p-8 rounded-lg">
                        <p class="rtf-content m-base">{@html item.description}</p>
                        <div class="flex flex-row items-center gap-base">
                          <img src="{item.media}" class="w-[48px] rounded-full" alt="{item.title}"/>
                          <p>{item.title}</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              {/each}
            </div>
          {/each}
        </div>

        <div class="hidden md:flex lg:hidden flex-col gap-6">
          {#each Array(Math.ceil(section.data.gallery.length / itemsPerRowTablet)) as _, rowIndex}
            {@const rowItems = section.data.gallery.slice(rowIndex * itemsPerRowTablet, (rowIndex + 1) * itemsPerRowTablet)}
            <div class="flex flex-row gap-6">
              {#each Array(2) as _, colIndex}
                {@const colStartIndex = colIndex * 2}
                {@const colItems = rowItems.slice(colStartIndex, colStartIndex + 2)}
                {#if colItems.length > 0}
                  <div class="flex flex-col gap-6 flex-1">
                    {#each colItems as item, itemIdx (item.id || `tablet-${rowIndex}-${colIndex}-${itemIdx}`)}
                       <div class="h-fit outline outline-outline-variant flex flex-col gap-6 p-8 rounded-lg">
                        <p class="rtf-content m-base">{@html item.description}</p>
                        <div class="flex flex-row items-center gap-base">
                          <img src="{item.media}" class="w-[48px] rounded-full" alt="{item.title}"/>
                          <p>{item.title}</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              {/each}
            </div>
          {/each}
        </div>

        <div class="flex md:hidden flex-col gap-6">
          {#each section.data.gallery as item, i (item.id || `mobile-${i}`)}
            <div class="h-fit outline outline-outline-variant flex flex-col gap-6 p-8 rounded-lg">
              <p class="rtf-content m-base">{@html item.description}</p>
              <div class="flex flex-row items-center gap-base">
                <img src="{item.media}" class="w-[48px] rounded-full" alt="{item.title}"/>
                <p>{item.title}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div> -->