<script lang="ts">
  import SearchBar from "$lib/app/components/input/SearchBar.svelte";
  import { Accordion } from "bits-ui";
  import ImagePreview from "$lib/app/components/ui/ImagePreview.svelte";
  import ListView from "./_layouts/ListView.svelte";
  import GalleryView from "./_layouts/GalleryView.svelte";

  const {section} = $props()

  let searchQuery = $state('')

  // Create an array of all childSection values (id or name)
  const allItemValues = section.data.childSections.map((cs: any) => cs.id || cs.name);
  let openItems = $state(allItemValues);

  // Filter sections and contents based on search query
  $effect(() => {
    if (!searchQuery) {
      // If search is empty, keep original state
      openItems = allItemValues;
      return;
    }

    const query = searchQuery.toLowerCase();
    const matchingSectionIds = section.data.childSections
      .filter((childSection: any) => {
        // Check if any content in this section matches the search
        const hasMatchingContent = childSection.contents.some((content: any) => 
          content.title?.toLowerCase().includes(query)
        );
        return hasMatchingContent;
      })
      .map((section: any) => section.id || section.name);

    // Update openItems to only include sections with matching content
    openItems = matchingSectionIds;
  });

  // Filter content items based on search
  function filterContent(contents: any[]) {
    if (!searchQuery) return contents;
    
    const query = searchQuery.toLowerCase();
    return contents.filter(content => 
      content.title?.toLowerCase().includes(query)
    );
  }
</script>

<div class="w-full flex items-center justify-center">
  <Accordion.Root type="multiple" bind:value={openItems} class="w-full {section.meta.type === 'list' ? 'max-w-screen-lg' : 'max-w-screen-xl'} flex flex-col {section.meta.title ? 'gap-lg' : 'gap-base'} py-3 px-12">
    {#if section.meta.searchable}
      <div class="flex flex-row items-center justify-between">
        {#if section.meta.title}<p class="text-xl font-bold">{section.meta.title}</p>{/if}
        <div class="{section.meta.title ? 'max-w-[284px]' : 'w-full'}">
          <SearchBar bind:value={searchQuery}/>
        </div>
      </div>
    {/if}
    {#each section.data.childSections as childSection (childSection.id || childSection.name)}
      {@const filteredContents = filterContent(childSection.contents)}
      {#if !searchQuery || filteredContents.length > 0}
        <Accordion.Item value={childSection.id || childSection.name} class="flex flex-col gap-base">
          {#if section.data.childSections?.length > 1 || section.meta.collapsible}
            <Accordion.Header class="w-full flex flex-row items-center justify-center gap-sm">
              <p class="font-bold min-w-max">{childSection.name}</p>
              <div class="w-full h-[1px] bg-outline"></div>
              {#if section.meta.collapsible}
                <Accordion.Trigger class="data-[state=open]:rotate-180">
                  <i class="ri-arrow-down-s-line"></i>
                </Accordion.Trigger>
              {/if}
            </Accordion.Header>
          {/if}
          <Accordion.Content>
            {#if section.meta.type === 'list' || !section.meta.type}
              <div class="flex flex-col gap-sm">
                {#each filteredContents as content}
                  <ListView {content}/>
                {/each}
              </div>
            {:else if section.meta.type === 'gallery'}
              <div class="flex flex-row gap-6 flex-wrap">
                {#each filteredContents as content}
                  <GalleryView {content}/>
                {/each}
              </div>
            {/if}
          </Accordion.Content>
        </Accordion.Item>
      {/if}
    {/each}
  </Accordion.Root>
</div>