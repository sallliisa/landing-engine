<script lang="ts">
  import ArticleItem from "$lib/app/components/app/ArticleItem.svelte";
  import { formatDate } from "$lib/utils/common";

  const {section} = $props()
</script>

<div
  class="flex items-center justify-center bg-cover bg-center"
>
  <div class="w-full max-w-screen-xl flex flex-col py-3 gap-6 px-6 lg:px-12">
    <div class="gap-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <div class="flex flex-col gap-sm">
        <div class="flex flex-col gap-xs">
          <p>{section.data.content.subtitle}</p>
          <p class="text-2xl md:text-3xl font-bold">{section.data.content.title}</p>
        </div>
        {#if section.data.content.description}<p class="rtf-content m-base text-sm text-outline">{@html section.data.content.description}</p>{/if}
      </div>
      {#if section.data.content.url}
        <a href={section.data.content.url} class="font-semibold underline">{section.data.content.url_text}<i class="ri-arrow-right-line"></i></a>
      {/if}
    </div>
    <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-lg">
      {#if section.data.article && section.data.article.length > 0}
        <a href={`/article/${section.data.article[0].slug}`} class="col-span-1 md:col-span-1 lg:col-span-6 flex flex-col gap-base group">
          <img src="{section.data.article[0].thumbnail}" class="w-full h-[240px] sm:h-[320px] object-center object-cover outline outline-outline-variant" alt={section.data.article[0].title}/>
          <div class="flex flex-col gap-sm w-full">
            <p class="text-sm sm:text-base group-hover:underline">{formatDate(section.data.article[0].created_at)} • {section.data.article[0].categories.join(', ')}</p>
            <p class="text-lg sm:text-xl font-bold group-hover:underline">{section.data.article[0].title}</p>
            <p class="text-sm text-outline group-hover:underline">{section.data.article[0].excerpt}</p>
          </div>
        </a>
        <div class="flex flex-col gap-sm col-span-1 md:col-span-1 lg:col-span-6 lg:-mt-6">
          {#each section.data.article.slice(1) as articleItem}, index (articleItem.id || index)}
            <ArticleItem
              title={articleItem.title}
              excerpt={articleItem.excerpt}
              created_at={formatDate(articleItem.created_at)}
              categories={articleItem.categories}
              thumbnail={articleItem.thumbnail}
              slug={articleItem.slug}
            />
          {/each}
        </div>
      {:else}
        <p class="col-span-full text-center py-10">No articles to display.</p>
      {/if}
    </div>
  </div>
</div>