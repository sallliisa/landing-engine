<script lang="ts">
  import { Accordion } from "bits-ui";
  const {childSection} = $props()
</script>

<div class="w-full flex items-center justify-center">
  {#if childSection.length === 0}
    <p class="whitespace-nowrap min-w-max text-outline text-sm py-6">Tidak ada data</p>
  {/if}
  <Accordion.Root type="multiple" class="w-full max-w-screen-xl flex flex-col gap-base">
    {#each childSection as child (child.id || child.name)}
      <Accordion.Item value={child.id || child.name} class="flex flex-col py-6 border-b border-outline-variant">
        <Accordion.Header>
          <Accordion.Trigger class="w-full flex flex-row items-center justify-between gap-sm">
            <p class="font-semibold min-w-max">{child.title}</p>
            <div class="data-[state=open]:rotate-90 transition-all">
              <i class="ri-add-line text-outline"></i>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <div class="h-4 w-full"></div>
          <p class="rtf-content m-base text-sm text-outline">{@html child.description}</p>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</div>