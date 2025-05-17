<script lang="ts">
  import SelectInput from "$lib/app/components/input/SelectInput.svelte";
  import TextInput from "$lib/app/components/input/TextInput.svelte";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";

  const {section} = $props();
  let formData = $state<Record<string, any>>({})

  let viewIndex = $state<0 | 1>(0)
</script>

{#if viewIndex === 0}
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-12 gap-4">
      {#each section.data.calculatorType.fields as calculatorField}
        <div class="flex flex-col gap-4" style="grid-column: span {calculatorField.col_span} / span {calculatorField.col_span};">
          {#if calculatorField.type === 'text'}
            <TextInput
              placeholder={calculatorField.placeholder}
              label={calculatorField.label}
              required={calculatorField.required}
              bind:value={formData[calculatorField.code]}
            />
          {:else if calculatorField.type === 'select'}
            <SelectInput
              placeholder={calculatorField.placeholder}
              label={calculatorField.label}
              required={calculatorField.required}
              bind:value={formData[calculatorField.code]}
              data={calculatorField.data}
              pick="value"
              view="label"
            />
          {/if}
        </div>
      {/each}
    </div>
    <button onclick={() => viewIndex = 1}>next</button>
  </div>
{:else}
  <div>
    <p>{JSON.stringify(formData)}</p>
    <table>
        <tbody>
        {#each section.data.calculatorType.details as detailField}
          <tr>
            <td class="text-sm w-[1%] whitespace-nowrap">{detailField.label}</td>
            <td class="text-sm w-[1%] px-2">:</td>
            <td>{formatData(mathjs.evaluate(detailField.formula, formData), detailField.type)} {detailField.unit}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <!-- <p>{mathjs.evaluate(section.data.calulatorDetailField.formula, formData)}</p> -->
  </div>
{/if}