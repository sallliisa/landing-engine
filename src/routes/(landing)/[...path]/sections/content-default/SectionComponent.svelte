<script lang="ts">
  import { widthPresetClassMap } from "$lib/utils/uicommon";

  const {section} = $props()

  const contentAlignClassMap = {
    left: {
      container: 'flex-col items-start justify-center',
      content: {
        container: 'flex flex-col items-start justify-center',
        content: 'text-left'
      }
    },
    center: {
      container: 'flex-col items-center justify-center',
      content: {
        container: 'flex flex-col items-center justify-center',
        content: 'text-center'
      }
    },
    right: {
      container: 'flex-col items-end justify-center',
      content: {
        container: 'flex flex-col items-end justify-center',
        content: 'text-right'
      }
    }
  }
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full {widthPresetClassMap[section.meta.width_preset]} flex flex-col gap-6 py-6 lg:py-12 px-6 lg:px-12 {(contentAlignClassMap as any)[section.meta.content_align].container}">
    {#if section.data.content.media}
      <img src={section.data.content.media} alt={section.data.content.title} class="{!section.meta.remove_outline_on_images ? 'outline outline-outline-variant' : ''} "/>
    {/if}
    {#if section.data.content.title || section.data.content.subtitle || section.data.content.description}
      <div class="flex flex-col gap-4 {(contentAlignClassMap as any)[section.meta.content_align].content.container}">
        {#if section.data.content.title || section.data.content.subtitle}
          <div class="flex flex-col gap-xs">
            {#if section.data.content.subtitle}<p class="{(contentAlignClassMap as any)[section.meta.content_align].content.content}">{section.data.content.subtitle}</p>{/if}
            {#if section.data.content.title}<p class="text-2xl font-bold {(contentAlignClassMap as any)[section.meta.content_align].content.content}">{section.data.content.title}</p>{/if}
          </div>
        {/if}
        {#if section.data.content.description}
          <p class="rtf-content -mt-4 {section.meta.remove_margin ? 'm-base' : ''} {(contentAlignClassMap as any)[section.meta.content_align].content.content}">{@html section.data.content.description}</p>
        {/if}
      </div>
    {/if}
  </div>
</div>