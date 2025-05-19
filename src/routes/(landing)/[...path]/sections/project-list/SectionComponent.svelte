<script lang="ts">
  import SearchBar from "$lib/app/components/input/SearchBar.svelte";

  const {section} = $props()

  let searchQuery = $state('')
  let categorySearchQuery = $state<Record<string, any>>({})
  let locationSearchQuery = $state<Record<string, any>>({})

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
      const normalizedLabel = project.label
        ? project.label.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase()
        : "";
      const normalizedTitle = project.title
        ? project.title.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase()
        : "";
      return masterSearchQuery.every(keyword => normalizedLabel.includes(keyword) || normalizedTitle.includes(keyword));
    });
  })
</script>

<div class="flex flex-col gap-12">
  <div class="flex flex-row items-center gap-4 justify-between">
    <div class="flex flex-col gap-4">
      {masterSearchQuery}
      <div class="flex flex-row items-center gap-base">
        {#each section.data.filter.category as category}
          <button
            onclick={() => categorySearchQuery[category.title] = !categorySearchQuery[category.title]}
            class="flex flex-row gap-xs {categorySearchQuery[category.title] ? 'text-on-surface' : 'text-outline'}"
          >
            <i class={category.media}></i>
            <p>{category.title}</p>
          </button>
        {/each}
      </div>
      <div class="flex flex-row items-center gap-base">
        {#each section.data.filter.location as location}
          <button
            onclick={() => locationSearchQuery[location.title] = !locationSearchQuery[location.title]}
            class="flex flex-row gap-xs {locationSearchQuery[location.title] ? 'text-on-surface' : 'text-outline'}"
          >
            <p>{location.title}</p>
          </button>
        {/each}
      </div>
    </div>
    <SearchBar bind:value={searchQuery}/>
  </div>
  {#each filteredProjects as project}
    <div>
      <p>{project.title}</p>
      <p>{project.label}</p>
    </div>
  {/each}
</div>