<script lang="ts">
  import { page } from "$app/state";
  
  import Button from "$lib/app/components/ui/Button.svelte";
  import { parseSearchParams } from "$lib/utils/common";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";
  import { api } from "$lib/utils/services";
  import { onMount, setContext } from "svelte";
  import FormView from "./_layouts/FormView.svelte";
  import SuccessView from "./_layouts/SuccessView.svelte";

  const {section} = $props();
  setContext('section', section)
  let viewIndex = $state<0 | 1>(0)
</script>

<div class="flex w-full items-center justify-center">
  <div class="w-full max-w-screen-xl flex flex-col gap-4">
    {#if viewIndex === 0}
      <FormView onSubmit={() => viewIndex = 1}/>
    {:else}
      <SuccessView onPrevious={() => viewIndex = 0}/>
    {/if}
  </div>
</div>