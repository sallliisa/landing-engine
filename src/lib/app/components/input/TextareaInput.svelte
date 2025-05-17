<script lang="ts">
  import { Label } from "bits-ui";

  let {
    value = $bindable(),
    label = null,
    required = false,
    placeholder = '',
    ...restProps
  } = $props();
</script>

<div class="flex flex-col gap-xs">
  {#if label}
    <Label.Root>
      {label}
      {#if required}<span class="text-xs text-primary">*</span>{/if}
    </Label.Root>
  {/if}
  <div class="px-4 py-3 rounded-sm outline outline-outline-variant focus-within:outline-outline select-none flex flex-row items-center justify-between text-sm tracking-[0.01em]">
    <textarea
      bind:value={value}
      class="p-0 w-full border-none bg-transparent outline-none focus:ring-0 focus:ring-offset-0"
      rows="3"
      {placeholder}
      {...restProps}
    ></textarea>
  </div>
</div>