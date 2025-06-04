<script lang="ts">
  const {section} = $props()
</script>

<div class="flex items-center justify-center">
  <div class="w-full max-w-screen-xl px-6 md:px-12 py-3 flex flex-col gap-lg">
    {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
      <div class="flex flex-col gap-sm">
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
    {/if}
    <div class="flex flex-col md:grid md:grid-cols-4 outline outline-outline-variant min-h-[300px] md:h-[450px]">
      <div class="embed-preview md:col-span-3">
        <div class="h-full w-full">
          {@html section.data.embed}
        </div>
      </div>
      <div class="w-full md:w-auto md:col-span-1 border-t md:border-t-0 md:border-l border-outline-variant p-4 flex flex-col gap-lg md:max-h-full md:overflow-y-scroll">
        <div class="flex flex-row md:flex-col gap-base overflow-x-auto max-w-full">
          {#each section.data.childSections as childSection}
            <div class="flex flex-col gap-base">
              <div class="flex flex-row items-center justify-center gap-sm">
                <p class="font-semibold min-w-max">{childSection.name}</p>
                <div class="h-[1px] flex-grow w-full bg-outline-variant"></div>
              </div>
              <div class="flex flex-row md:flex-col gap-sm whitespace-nowrap min-w-max">
                {#each childSection.gallery as galleryItem}
                  <div class="inline-flex flex-row items-center gap-sm flex-shrink-0 md:w-full md:flex">
                    <img src={galleryItem.media} alt={galleryItem.title} class="w-16 h-16 aspect-square object-cover flex-shrink-0"/>
                    <p class="text-sm">{galleryItem.title}</p>
                  </div>
                {/each}
              </div>
            </div>
            <!-- <div class="flex flex-row items-center gap-base">
              <img src={childSection.gallery[0].media} alt={childSection.name} class="w-16 h-16 aspect-square rounded-sm object-cover flex-shrink-0"/>
              <p class="font-semibold">{childSection.name}</p>
            </div> -->
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .embed-preview {
    position: relative;
    width: 100%;
    min-height: 300px;
    height: 300px;
  }
  
  @media (min-width: 768px) {
    .embed-preview {
      height: 100%;
      min-height: auto;
    }
  }

  .embed-preview :global(iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 4px; /* Note: radius might be clipped by parent's overflow:hidden */
  }
</style>