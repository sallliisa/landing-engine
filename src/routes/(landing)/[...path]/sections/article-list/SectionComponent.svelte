<script lang="ts">
  import { api } from "$lib/utils/services";
  import { onMount } from "svelte"; // Added afterUpdate for $effect in Svelte 4
  import { debounce } from "$lib/utils/common";

  const {section} = $props()

  let loading = $state(false);
  let articles = $state<any[]>([]); // Initialize with an empty array and specify type if known
  let rawSearchInput = $state(''); // For direct input binding

  // Initialize urlSearchParameters, now using article_category_ids as an array
  let urlSearchParameters = $state<{
    search?: string,
    article_category_ids?: string[], // <-- changed to array
    page?: number,
    limit?: number,
  }>({
    article_category_ids: section.data?.articleCategory?.id ? [section.data.articleCategory.id] : undefined,
    page: 1,
    limit: 10,
  });

  const fetchArticles = async () => {
    loading = true;
    try {
      // Construct query parameters, filtering out undefined values
      const params: Record<string, string | number | (string[]) | undefined> = {};
      if (urlSearchParameters.search) params.search = urlSearchParameters.search;
      if (urlSearchParameters.article_category_ids && urlSearchParameters.article_category_ids.length > 0) {
        // For array params, append each as article_category_ids[]
        params["article_category_ids[]"] = urlSearchParameters.article_category_ids;
      }
      if (urlSearchParameters.page) params.page = urlSearchParameters.page;
      if (urlSearchParameters.limit) params.limit = urlSearchParameters.limit;

      const response = await api.get({path: '/api/public/article/list', query: params as any});
      articles = response.data || [];
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      articles = [];
    } finally {
      loading = false;
    }
  };

  // Debounced function to update the actual search parameter
  const debouncedSetSearchQuery = debounce((value: string) => {
    urlSearchParameters.search = value || undefined; // Set to undefined if empty to remove from query
    urlSearchParameters.page = 1; // Reset to first page on new search
  }, 500); // 500ms debounce delay

  // Svelte 5 runes: $effect to react to changes
  $effect(() => {
    // This effect runs whenever urlSearchParameters.search or article_category_id changes
    // We need to ensure it doesn't run on initial mount unnecessarily if onMount already fetches.
    // However, with $state, direct assignment triggers the effect.
    fetchArticles();
  });

  onMount(() => {
    // Initial fetch is now handled by $effect due to urlSearchParameters initialization
    // If section.data.articleCategory.id was not initially set but becomes available later,
    // and you want to trigger a fetch, you'd need to ensure urlSearchParameters.article_category_id is updated.
    // For now, $effect will run once on mount due to initial state.
  });

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    rawSearchInput = target.value;
    debouncedSetSearchQuery(rawSearchInput);
  }

</script>

<div>
  <!-- Category Filter List -->
  <div class="mb-4 flex flex-wrap gap-2">
    {#each section.data.articleCategory as category (category.id)}
      <button
        type="button"
        class="px-3 py-1 rounded border transition
          {urlSearchParameters.article_category_ids && urlSearchParameters.article_category_ids.includes(category.id)
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-black border-gray-300'}"
        onclick={() => {
          // Toggle category selection
          if (!urlSearchParameters.article_category_ids) {
            urlSearchParameters.article_category_ids = [category.id];
          } else if (urlSearchParameters.article_category_ids.includes(category.id)) {
            urlSearchParameters.article_category_ids = urlSearchParameters.article_category_ids.filter(id => id !== category.id);
            // If none selected, set to undefined to remove from query
            if (urlSearchParameters.article_category_ids.length === 0) {
              urlSearchParameters.article_category_ids = undefined;
            }
          } else {
            urlSearchParameters.article_category_ids = [...urlSearchParameters.article_category_ids, category.id];
          }
          urlSearchParameters.page = 1; // Reset to first page on filter change
        }}
      >
        {category.name}
      </button>
    {/each}
  </div>
  <input
    type="text"
    placeholder="Search articles..."
    value={rawSearchInput}
    oninput={handleInput}
    class="mb-4 p-2 border rounded w-full"
  />
</div>

{#if loading}
  <p>Loading articles...</p>
{:else if articles.length > 0}
  <ul>
    {#each articles as article (article.id)}
      <a href="/article/{article.slug}">
        <li class="mb-2 p-2 border rounded">
          <h3 class="text-lg font-semibold">{article.title}</h3>
          {#if article.categories?.length}
            <p class="text-sm text-gray-600">Category: {article.categories.join(', ')}</p>
          {/if}
          <p class="text-sm">{article.excerpt}</p>
          <small>{new Date(article.created_at).toLocaleDateString()}</small>
        </li>
      </a>
    {/each}
  </ul>
  <!-- Basic pagination example (needs more logic for page numbers, disabling buttons) -->
  <div class="mt-4 flex justify-between">
    <button
      onclick={() => {
        if (urlSearchParameters.page && urlSearchParameters.page > 1) {
          urlSearchParameters.page -= 1;
        }
      }}
      disabled={urlSearchParameters.page === 1 || loading}
      class="p-2 border rounded"
    >
      Previous
    </button>
    <span>Page {urlSearchParameters.page}</span>
    <button
      onclick={() => {
        // Need total count from API to determine if there's a next page
        if (urlSearchParameters.page) {
           urlSearchParameters.page += 1;
        }
      }}
      disabled={loading} 
      class="p-2 border rounded"
    >
      Next
    </button>
  </div>
{:else}
  <p>No articles found.</p>
{/if}

<!-- Debugging -->
<!-- <pre>Raw Search Input: {rawSearchInput}</pre> -->
<!-- <pre>URL Search Parameters: {JSON.stringify(urlSearchParameters, null, 2)}</pre> -->
<!-- <pre>Section Data: {JSON.stringify(section.data, null, 2)}</pre> -->
