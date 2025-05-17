<script lang="ts">
  import DateInput from "$lib/app/components/input/DateInput.svelte";
  import FileInput from "$lib/app/components/input/FileInput.svelte";
  import ImageInput from "$lib/app/components/input/ImageInput.svelte";
  import NumberInput from "$lib/app/components/input/NumberInput.svelte";
  import SelectInput from "$lib/app/components/input/SelectInput.svelte";
  import TextareaInput from "$lib/app/components/input/TextareaInput.svelte";
  import TextInput from "$lib/app/components/input/TextInput.svelte";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";
  import { api } from "$lib/utils/services";

  const {section} = $props();
  let formData = $state<Record<string, any>>(section.data.formDataTemplate)

  let viewIndex = $state<0 | 1>(0)

  const componentTypeMap: Record<string, any> = {
    text: TextInput,
    textarea: TextareaInput,
    number: NumberInput,
    image: ImageInput,
    file: FileInput,
    date: DateInput,
    select: SelectInput
  }

  let formError: Record<string, any> = $state({})
  let test = $state()
  
  async function submitForm() {
    try {
      const {data} = await api.post({path: '/api/public/formSubmission/submit'}, formData)
      console.log('test')
      viewIndex = 1
    } catch (error: any) {
      console.log('test2', error.error)
      formError = error.error
    }
  }
</script>

{JSON.stringify(formError)}
{#if viewIndex === 0}
  <form class="flex flex-col gap-4" onsubmit={submitForm}>
    <div class="grid grid-cols-12 gap-4">
      {#each formData.data as formField}
        {@const InputComponent = componentTypeMap[formField.type]}
        {#if InputComponent}
          <div class="flex flex-col gap-4" style="grid-column: span {formField.col_span} / span {formField.col_span};">
            <InputComponent
              placeholder={formField.placeholder}
              label={formField.label}
              helperMessage={formField.helper_message}
              errorMessage={formError[formField.code]}
              required={formField.required}
              bind:value={formField.value}
              data={formField.data}
              pick="value"
              view="label"
            />
          </div>
        {/if}
      {/each}
    </div>
    <button type="submit">next</button>
  </form>
{:else}
  <div>
    <p>{JSON.stringify(formData)}</p>
  </div>
{/if}