<script lang="ts">
  const {section} = $props()

  const bgImage = section.meta.add_overlay_to_background 
    ? `linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%), url(${section.meta.background_image})` 
    : `url(${section.meta.background_image})`;

  const widthPresetClassMap: any = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
  }
</script>

<div class="flex items-center justify-center w-full">
  {#if section.data.content.url}
    <a href="{section.data.content.url}" class="w-full {widthPresetClassMap[section.meta.width_preset]} flex flex-col justify-between group/carouselItem gap-lg bg-center bg-cover overlay before:bg-surface/5 active:before:bg-surface/10 {section.meta.background_image ? 'text-surface' : 'text-on-surface'}" style="background-image: {bgImage}">
      {@render cardContent()}
    </a>
  {:else}
    <div class="w-full {widthPresetClassMap[section.meta.width_preset]} flex flex-col justify-between group/carouselItem gap-lg bg-center bg-cover overlay before:bg-surface/5 active:before:bg-surface/10 {section.meta.background_image ? 'text-surface' : 'text-on-surface'}" style="background-image: {bgImage}">
      {@render cardContent()}
    </div>
  {/if}
</div>

{#snippet cardContent()}
  <div class="flex flex-col gap-lg justify-between px-6 lg:px-8 py-6 w-full h-full">
    <img class="max-w-[48px] aspect-square" src={section.data.content.media} alt={section.data.content.title}/>
    {#if section.data.content.title || section.data.content.subtitle || section.data.content.description}
      <div class="flex flex-col gap-sm translate-y-[16px] group-hover/carouselItem:translate-y-0 transition-all">
        <div class="flex flex-col gap-sm">
          {#if section.data.content.title || section.data.content.subtitle}
            <div class="flex flex-col gap-xs">
              {#if section.data.content.subtitle}<p>{section.data.content.subtitle}</p>{/if}
              {#if section.data.content.title}<p class="text-2xl font-bold">{section.data.content.title}</p>{/if}
            </div>
          {/if}
          {#if section.data.content.description}
            <p class="rtf-content m-base">{@html section.data.content.description}</p>
          {/if}
        </div>
        <p class="text-sm translate-y-[8px] opacity-0 group-hover/carouselItem:translate-y-0 group-hover/carouselItem:opacity-100 transition-all">Kunjungi Laman <i class="ml-1 ri-arrow-right-up-line"></i></p>
      </div>
    {/if}
  </div>
{/snippet}