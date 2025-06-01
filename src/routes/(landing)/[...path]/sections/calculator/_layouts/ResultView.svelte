<script lang="ts">
  import { getContext } from "svelte";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";

  const {formData, onPrevious} = $props()

  let section = getContext<Record<string, any>>('section')
</script>

<div class="flex flex-col gap-base">
  <div class="flex flex-col gap-base">
    <button class="text-sm text-start max-w-fit" onclick={onPrevious}><i class="ri-arrow-left-line"></i> <span class="underline">Kembali</span></button>
    <div class="flex flex-col">
      <p class="text-outline font-semibold">{section.data.calculatorType.details[0].label}</p>
      <p class="text-xl font-bold">{formatData(mathjs.evaluate(section.data.calculatorType.details[0].formula, formData), section.data.calculatorType.details[0].type)} {section.data.calculatorType.details[0].unit}</p>
    </div>
  </div>
  <table>
    <tbody>
      {#each section.data.calculatorType.details.slice(1) as detailField}
        <tr>
          <td class="w-[1%] whitespace-nowrap">{detailField.label}</td>
          <td class="w-[1%] px-2">:</td>
          <td>{formatData(mathjs.evaluate(detailField.formula, formData), detailField.type)} {detailField.unit}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>