<script lang="ts">
  import article from "$lib/app/api/models/article";
  import ArticleItem from "$lib/app/components/app/ArticleItem.svelte";
  import { formatDate } from "$lib/utils/common";

  const {section} = $props()  
</script>

<!-- {JSON.stringify(section.data.article)} -->

<div
  class="flex items-center justify-center bg-cover bg-center"
>
  <div class="w-full max-w-screen-xl flex flex-col p-12 gap-6">
    <div class="gap-6 flex flex-row items-center justify-between">
      <div class="flex flex-col gap-sm">
        <p>{section.data.content.subtitle}</p>
        <p class="text-4xl font-bold">{section.data.content.title}</p>
      </div>
      {#if section.data.content.url}
        <div class="flex flex-row items-center gap-sm">
          <a href={section.data.content.url} class="font-semibold underline">Lebih Banyak</a>
          <i class="ri-arrow-right-line"></i>
        </div>
      {/if}
    </div>
    <div class="w-full grid grid-cols-12 gap-lg">
      <a href="/article/{section.data.article[0].slug}" class="col-span-6 flex flex-col gap-base group">
        <img src="{section.data.article[0].thumbnail}" class="w-full h-[320px] rounded-lg object-center object-cover outline outline-outline-variant" alt={section.data.article[0].title}/>
        <div class="flex flex-col gap-sm w-full">
          <p class="group-hover:underline">{formatDate(section.data.article[0].created_at)} • {section.data.article[0].categories.join(', ')}</p>
          <p class="text-xl font-bold group-hover:underline">{section.data.article[0].title}</p>
          <p class="text-outline group-hover:underline">{section.data.article[0].excerpt}</p>
        </div>
      </a>
      <div class="flex flex-col gap-sm col-span-6 -mt-6">
        {#each section.data.article.slice(1) as article}
          <ArticleItem
            title={article.title}
            excerpt={article.excerpt}
            created_at={new Date(article.created_at).toLocaleDateString()}
            categories={article.categories}
            thumbnail={article.thumbnail}
            slug={article.slug}
          />
        {/each}
      </div>
    </div>
  </div>
</div>