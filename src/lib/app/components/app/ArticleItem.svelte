<script lang="ts">
  import { formatDate } from "$lib/utils/common";

  const {
    title,
    excerpt,
    created_at,
    categories,
    thumbnail,
    slug
  } = $props<{
    title: string,
    excerpt: string,
    created_at: string,
    categories: string[],
    thumbnail?: string,
    slug: string
  }>();
</script>

<a href="/article/{slug}" class="py-6 flex flex-col md:flex-row items-start md:items-center gap-4 group">
  <img 
    src="{thumbnail}" 
    class="w-full md:w-[160px] aspect-video rounded-sm object-center object-cover outline outline-outline-variant"
    alt="{title} - {excerpt}"
  />
  <div class="flex flex-col gap-sm w-full md:flex-1">
    <p class="group-hover:underline text-sm">{formatDate(created_at)} • {categories.join(', ')}</p>
    <p class="text-xl font-bold group-hover:underline">{title}</p>
    <p class="text-outline group-hover:underline">{excerpt}</p>
  </div>
</a>