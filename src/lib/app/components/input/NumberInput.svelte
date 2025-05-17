<script lang="ts">
  import { Label } from "bits-ui";

  type $$Props = {
    value?: number | undefined | null; // The bound numeric value
    label?: string | null;
    required?: boolean;
    placeholder?: string;
    // Allow any other HTML input attributes to be passed down
    [key: string]: any;
  };

  let {
    value = $bindable<number | undefined | null>(), // External numeric value
    label = null,
    required = false,
    placeholder = '',
    ...restProps
  }: $$Props = $props();

  // Internal string representation for the <input> element.
  // This is what the user sees and types into.
  // Initialize with the string version of the 'value' prop.
  let inputValue = $state(value === undefined ? '' : String(value));

  // This effect synchronizes the internal 'inputValue' (string)
  // when the external 'value' prop (number) changes.
  $effect(() => {
    if (value === undefined) {
      // If the external value becomes undefined, and inputValue is not already
      // an empty or partial state (like just "."), clear inputValue.
      if (inputValue !== '' && inputValue !== '.') {
        inputValue = '';
      }
    } else {
      // If external value is a number, convert inputValue to a number for comparison.
      const currentNumericInputValue = parseFloat(inputValue);
      // Update inputValue if it doesn't numerically match 'value'.
      // This preserves user's partial input like "123." if 'value' is 123.
      if (isNaN(currentNumericInputValue) || currentNumericInputValue !== value) {
        inputValue = String(value);
      }
    }
  });

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    const currentTarget = event.currentTarget;
    let currentDOMValue = currentTarget.value;
    
    // Sanitize the input:
    // 1. Remove any characters that are not digits or a period.
    let sanitized = currentDOMValue.replace(/[^0-9.]/g, '');
    
    // 2. Ensure there's at most one decimal point.
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      // If more than one dot, reconstruct with only the first dot.
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    // If sanitization changed the string, update the input field's value directly.
    // This provides immediate feedback to the user.
    if (currentDOMValue !== sanitized) {
      // Note: More sophisticated cursor position management could be added here if needed,
      // but for simplicity, direct value assignment is used.
      currentTarget.value = sanitized;
    }
    
    // Update the reactive Svelte state 'inputValue'.
    // This will ensure Svelte's view of the input's value is consistent.
    inputValue = sanitized;

    // Convert the sanitized string to a number and update the external 'value' prop.
    if (sanitized === '' || sanitized === '.') {
      // If input is empty or just a dot, the numeric value is undefined.
      value = undefined;
    } else {
      const num = parseFloat(sanitized);
      // If parsing results in NaN (e.g., for "."), treat as undefined.
      value = isNaN(num) ? undefined : num;
    }
  }
</script>

<div class="flex flex-col gap-xs">
  {#if label}
    <Label.Root>
      {label}
      {#if required}<span class="text-xs text-primary">*</span>{/if}
    </Label.Root>
  {/if}
  <div class="px-4 py-3 rounded-sm outline outline-outline-variant focus-within:outline-outline select-none flex flex-row items-center justify-between text-sm tracking-[0.01em]">
    <input
      type="text"
      inputmode="decimal"
      value={inputValue}
      oninput={handleInput}
      class="p-0 w-full border-none bg-transparent outline-none focus:ring-0 focus:ring-offset-0"
      {placeholder}
      {...restProps}
    />
  </div>
</div>