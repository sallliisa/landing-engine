<script lang="ts">
  const {section} = $props()
</script>

<div class="flex items-center justify-center w-full">
  <div class="w-full max-w-screen-md flex flex-col gap-6 py-3">
    {#if section.data.content.media}
      <img src={section.data.content.media} alt={section.data.content.title} class="rounded-lg outline outline-outline-variant"/>
    {/if}
    {#if section.data.content.title || section.data.content.subtitle || section.data.content.description}
      <div class="flex flex-col gap-4">
        {#if section.data.content.title || section.data.content.subtitle}
          <div class="flex flex-col gap-xs">
            {#if section.data.content.subtitle}<p>{section.data.content.subtitle}</p>{/if}
            {#if section.data.content.title}<p class="text-2xl font-bold">{section.data.content.title}</p>{/if}
          </div>
        {/if}
        {#if section.data.content.description}
          <p class="rtf-content -mt-4 {section.meta.remove_margin ? 'm-base' : ''}">{@html section.data.content.description}</p>
        {/if}
      </div>
    {/if}
  </div>
</div>