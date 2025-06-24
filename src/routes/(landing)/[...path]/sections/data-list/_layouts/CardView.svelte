<script lang="ts">
  import { m } from '$lib/paraglide/messages';

  const {childSection} = $props()
</script>

<div class="flex flex-col gap-sm w-full">
  {#each childSection as child (child.id || child.name)}
    {#if child.url}
      <a href="{child.url}" class="w-full flex flex-col justify-between group/carouselItem gap-lg bg-center bg-cover overlay before:bg-surface/5 active:before:bg-surface/10 {child.media ? 'text-surface' : 'text-on-surface'}" style="background-image: linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%), url('{child.media}')">
        {@render cardContent(child)}
      </a>
    {:else}
      <div class="w-full flex flex-col justify-between group/carouselItem gap-lg bg-center bg-cover overlay before:bg-surface/5 active:before:bg-surface/10 {child.media ? 'text-surface' : 'text-on-surface'}" style="background-image: linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%), url('{child.media}')">
        {@render cardContent(child)}
      </div>
    {/if}
  {/each}
</div>

{#snippet cardContent(child: any)}
  <div class="flex flex-col gap-lg justify-between px-6 lg:px-8 py-3 lg:py-9 w-full h-full">
    {#if child.attachment}<img class="max-w-[48px] aspect-square" src={child.attachment} alt={child.title}/>{/if}
    {#if child.title || child.subtitle || child.description}
      <div class="flex flex-col gap-sm">
        <div class="flex flex-col gap-sm translate-y-[28px] group-hover/carouselItem:translate-y-[0px] transition-all">
          {#if child.title || child.subtitle}
            <div class="flex flex-col gap-xs">
              {#if child.subtitle}<p>{child.subtitle}</p>{/if}
              {#if child.title}<p class="text-2xl font-bold">{child.title}</p>{/if}
            </div>
          {/if}
          {#if child.description}
            <p class="rtf-content m-base">{@html child.description}</p>
          {/if}
        </div>
        <p class="text-sm translate-y-[28px] opacity-0 group-hover/carouselItem:translate-y-0 group-hover/carouselItem:opacity-100 transition-all">{child.url_text || m.learn_more()} <i class="ml-1 ri-arrow-right-up-line"></i></p>
      </div>
    {/if}
  </div>
{/snippet}