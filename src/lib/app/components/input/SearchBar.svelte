<script lang="ts">
  import { Label } from "bits-ui";
  import TextInput from "./TextInput.svelte";
  import { debounce as debounceFn } from "$lib/utils/common"; // Renamed import to avoid conflict
  import { get } from "svelte/store";

  let {
    value = $bindable(),
    label = null,
    required = false,
    placeholder = '',
    helperMessage = null,
    errorMessage = null,
    icon,
    debounce = true, // New prop, defaults to true
    debounceMs = 300, // Optional: allow customizing debounce time
    ...restProps
  }: {
    value?: string | number | undefined | null,
    label?: string | null,
    required?: boolean,
    placeholder?: string,
    helperMessage?: string | null,
    errorMessage?: string | null,
    debounce?: boolean, // New prop
    debounceMs?: number,
    [key: string]: any;
  } = $props();

  let internalValue = $state(value);

  const commitChange = debounceFn((newValue: typeof value) => {
    value = newValue;
  }, debounceMs);

  function getValue() {
    return internalValue;
  }

  function setValue(newValue: string | number | undefined | null) {
    internalValue = newValue;
    if (debounce) {
      commitChange(newValue);
    } else {
      value = newValue;
    }
  }
</script>

<TextInput bind:value={getValue, setValue} {...restProps}>
  {#snippet icon()}
    <i class="{icon ?? 'ri-search-line'}"></i>
  {/snippet}
</TextInput>