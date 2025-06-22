<script lang="ts">
	import { browser } from '$app/environment';
	import { formatDate } from '$lib/utils/common';

  export let data
</script>

<svelte:head>
  <meta name="description" content="{data.article.excerpt}"/>
</svelte:head>

<div class="flex flex-col w-full min-h-screen h-full lg:mt-[88px] text-on-surface">
  <div class="flex items-center justify-center w-full bg-center bg-cover py-6 lg:py-12" style="margin-top: var(--topbarHeight);">
    <div class="flex flex-col gap-16 max-w-screen-xl px-12 w-full justify-center pt-8 lg:pt-0">
      <div class="flex flex-col items-center justify-center gap-8">
        <div class="flex flex-col gap-4 max-w-[680px]">
          <p class="text-sm">{formatDate(new Date(data.article.created_at).toJSON())} • {data.article.categories?.map(category => category.name).join(', ')}</p>
          <p class="text-2xl lg:text-3xl font-semibold font-title">{data.article.title}</p>
          <p class="text-muted">{data.article?.excerpt}</p>
        </div>
        {#if data.article.thumbnail}<img src={data.article.thumbnail} alt={data.article.title} class="max-w-full outline outline-outline-variant"/>{/if}
        <div class="rtf-content max-w-[60ch]">{@html data.article.content}</div>
      </div>
    </div>
  </div>
</div>