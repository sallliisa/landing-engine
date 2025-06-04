<script lang="ts">
  import SearchBar from "$lib/app/components/input/SearchBar.svelte";
  import SelectInput from "$lib/app/components/input/SelectInput.svelte";
  import Tabs from "$lib/app/components/ui/tabs/Tabs.svelte";

  const {section} = $props()

  let searchQuery = $state('')
  let categorySearchQuery = $state<Record<string, any>>({})
  let locationSearchQuery = $state<Record<string, any>>({})
  let categoryActiveTabIndex = $state(0)
  let locationActiveCode = $state('')
  
  // Sync categoryActiveTabIndex with categorySearchQuery
  $effect(() => {
    // Clear all categories first
    Object.keys(categorySearchQuery).forEach(key => {
      categorySearchQuery[key] = false;
    });
    
    // Set the selected category to true
    const selectedCategory = section.data.filter.category[categoryActiveTabIndex];
    if (selectedCategory?.content) {
      categorySearchQuery[selectedCategory.content] = true;
    }
  });

  // Sync locationActiveCode with locationSearchQuery
  $effect(() => {
    // Clear all locations first
    Object.keys(locationSearchQuery).forEach(key => {
      locationSearchQuery[key] = false;
    });
    
    // Set the selected location to true
    const selectedLocation = section.data.filter.location.find((location: Record<string, any>) => location.content === locationActiveCode);
    if (selectedLocation?.content) {
      locationSearchQuery[selectedLocation.content] = true;
    }
  });

  // Updated masterSearchQuery derivation
  let masterSearchQuery = $derived.by<string[]>(() => {
    const categoryKeywords = Object.entries(categorySearchQuery)
      .filter(([_, value]) => value === true)
      .map(([key]) => key.toLowerCase());

    const locationKeywords = Object.entries(locationSearchQuery)
      .filter(([_, value]) => value === true)
      .map(([key]) => key.toLowerCase());

    // Split the text from searchQuery into individual words
    const textSearchKeywords = searchQuery
      .toLowerCase()
      .split(/\s+/) // Split by one or more whitespace characters
      .filter(Boolean); // Remove any empty strings (e.g., from multiple spaces)

    return [
      ...categoryKeywords,
      ...locationKeywords,
      ...textSearchKeywords
    ].filter(Boolean); // Ensures all keywords are non-empty strings
  })

  let filteredProjects = $derived.by<Record<string, any>[]>(() => {
    return section.data.projects.filter((project: any) => {
      const normalizedTitles = project.collection?.map((item: any) => 
        item?.title ? item.title.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase() : ""
      ) || [];
      const normalizedTitle = project.title
        ? project.title.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase()
        : "";
      
      return masterSearchQuery.every(keyword => 
        normalizedTitles.some((title: string) => title.includes(keyword)) || 
        normalizedTitle.includes(keyword)
      );
    });
  })
</script>

{JSON.stringify(masterSearchQuery)}
<div class="flex items-center justify-center">
  <div class="flex flex-col gap-lg w-full max-w-screen-xl mx-auto px-6 md:px-12 py-3">
    <div class="flex flex-row items-center gap-4 justify-between">
      <div class="flex flex-row gap-base w-full">
        <div class="w-[160px]">
          <SelectInput data={section.data.filter.location} bind:value={locationActiveCode} view="title" pick="content" placeholder="Semua Lokasi"/>
        </div>
      </div>
      <div class="w-[240px]">
        <SearchBar bind:value={searchQuery}/>
      </div>
    </div>
    <div class="w-full">
      <Tabs data={section.data.filter.category} bind:activeTabIndex={categoryActiveTabIndex}>
        {#snippet tabItem(item: Record<string, any>)}
          <p>{item.title}</p>
        {/snippet}
      </Tabs>
    </div>
    {#if filteredProjects?.length}
      {#each filteredProjects as project}
        {@render projectItem(project)}
      {/each}
    {:else}
      <p class="text-outline">Proyek tidak ditemukan</p>
    {/if}
  </div>
</div>

{#snippet projectItem(project: Record<string, any>)}
  <a href={project.url} class="overlay before:bg-surface/5 active:before:bg-surface/10 flex flex-col p-4 items-start justify-end w-[290px] aspect-square bg-center bg-cover text-surface" style="background-image: linear-gradient(rgba(0,0,0,0.24), rgba(0,0,0,0.24)), url({project.media});">
    <div class="flex flex-col gap-xs">
      <p class="text-lg font-bold">{project.title}</p>
      <div class="flex flex-row items-center gap-base">
        {#each project.collection as collectionItem}
          <div class="flex flex-row items-center gap-xs">
            <i class={collectionItem.media}></i>
            <p>{collectionItem.title}</p>
          </div>
        {/each}
      </div>
    </div>
  </a>
{/snippet}