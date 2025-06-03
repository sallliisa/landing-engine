<script lang="ts">
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";
  import { setContext } from "svelte";
  import CalculatorView from "./_layouts/CalculatorView.svelte";
  import ResultView from "./_layouts/ResultView.svelte";

  const {section} = $props();
  setContext('section', section)
  let formData = $state({})
  let viewIndex = $state<0 | 1>(0)
</script>


<div class="flex w-full items-center justify-center">
  <div class="w-full max-w-screen-xl grid grid-cols-1 md:grid-cols-2 gap-lg py-3 px-6 lg:px-12">
    <div class="flex flex-col col-span-1">
      <div class="flex flex-col gap-lg">
        <div class="flex flex-col gap-xs">
          <div class="flex flex-col gap-xs">
            {#if section.data.content.subtitle}<p class="text-xs md:text-sm">{section.data.content.subtitle}</p>{/if}
            {#if section.data.content.title}<p class="text-lg md:text-xl font-bold">{section.data.content.title}</p>{/if}
          </div>
          {#if section.data.content.description}<p class="rtf-content m-base text-outline">{@html section.data.content.description}</p>{/if}
        </div>
        <CalculatorView
          {formData}
          onCalculate={() => viewIndex = 1}
        />
      </div>
    </div>
    <ResultView
      onPrevious={() => viewIndex = 0}
      {formData}
    />
  </div>
</div>

<!-- <div class="flex w-full items-center justify-center">
  <div class="w-full max-w-screen-xl grid grid-cols-1 md:grid-cols-2 gap-x-xl gap-y-lg py-3 px-6 lg:px-12">
    {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
      <div class="flex flex-col gap-base w-full">
        <div class="flex flex-col gap-xs">
          {#if section.data.content.subtitle}<p>{section.data.content.subtitle}</p>{/if}
          {#if section.data.content.title}<p class="text-3xl md:text-4xl font-bold">{section.data.content.title}</p>{/if}
        </div>
        {#if section.data.content.description}<p class="rtf-content m-base">{@html section.data.content.description}</p>{/if}
      </div>
    {/if}
    <div class="flex flex-col">
      {#if viewIndex === 0}
        <CalculatorView
          {formData}
          onCalculate={() => viewIndex = 1}
        />
      {:else}
        <ResultView
          onPrevious={() => viewIndex = 0}
          {formData}
        />
      {/if}
    </div>
  </div>
</div> -->