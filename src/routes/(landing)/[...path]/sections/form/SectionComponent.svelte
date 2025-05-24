<script lang="ts">
  import { page } from "$app/state";
  import DateInput from "$lib/app/components/input/DateInput.svelte";
  import FileInput from "$lib/app/components/input/FileInput.svelte";
  import ImageInput from "$lib/app/components/input/ImageInput.svelte";
  import NumberInput from "$lib/app/components/input/NumberInput.svelte";
  import SelectInput from "$lib/app/components/input/SelectInput.svelte";
  import TextareaInput from "$lib/app/components/input/TextareaInput.svelte";
  import TextInput from "$lib/app/components/input/TextInput.svelte";
  import Button from "$lib/app/components/ui/Button.svelte";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";
  import { api } from "$lib/utils/services";
  import { onMount } from "svelte";

  const {section} = $props();
  let formData = $state<Record<string, any>>(section.data.formDataTemplate)

  onMount(() => {
    // loop through formData, and if "code" is found in page.data.currentPageSearchParams, set the value of the form field to the value of the search param
    for (const key in page.data.currentPageSearchParams) {
      if (Object.prototype.hasOwnProperty.call(page.data.currentPageSearchParams, key)) {
        const element = page.data.currentPageSearchParams[key];
        const formField = formData.data.find((formField: any) => formField.code === key)
        if (formField) {
          formField.value = element
        }
      }
    }
  })

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

{#if viewIndex === 0}
  <form class="flex flex-col items-center justify-center gap-4" onsubmit={submitForm}>
    <div class="grid grid-cols-12 gap-4 max-w-screen-xl w-full">
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
    <Button>Kirim</Button>
  </form>
{:else}
  <div>
    <p>{JSON.stringify(section.data.formType.success_message)}</p>
    <p>{JSON.stringify(formData)}</p>
  </div>
{/if}