<script lang="ts">
  import { Label } from "bits-ui";

  let {
    value = $bindable(), // URL of the file
    label = null,
    required = false,
    placeholder = 'No file chosen',
    accept = '', // e.g., "image/*,application/pdf"
    ...restProps
  }: {
    value?: string,
    label?: string | null,
    required?: boolean,
    placeholder?: string,
    accept?: string,
    [key: string]: any;
  } = $props();

  let selectedFile = $state<File | null>(null);
  let inputElement: HTMLInputElement;
  let isUploading = $state(false);

  let displayFileName = $derived.by(() => {
    if (selectedFile) {
      return selectedFile.name;
    }
    if (value) {
      try {
        // Assuming the URL format from your server is /.../timestamp-originalname
        const urlParts = value.split('/');
        const encodedNameWithTimestamp = urlParts[urlParts.length - 1];
        const nameWithoutTimestamp = encodedNameWithTimestamp.substring(encodedNameWithTimestamp.indexOf('-') + 1);
        return decodeURIComponent(nameWithoutTimestamp || 'File selected');
      } catch (e) {
        return 'File selected'; // Fallback
      }
    }
    return placeholder;
  });

  async function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      selectedFile = file;
      isUploading = true;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/public/upload/private', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const publicUrl = await response.json();
          value = publicUrl; 
        } else {
          console.error('File upload failed:', await response.text());
          selectedFile = null; 
          value = ''; // Clear value on failure
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        selectedFile = null; 
        value = ''; // Clear value on error
      } finally {
        isUploading = false;
      }
    } else {
      // If user cancels file dialog, and a file was previously selected (but not yet uploaded)
      // or a value (URL) already exists, we don't want to clear it.
      // Only clear selectedFile if no file was chosen in this interaction.
      if (!target.files || target.files.length === 0) {
        selectedFile = null;
      }
    }
  }

  function clearFile(event?: MouseEvent) {
    event?.stopPropagation(); // Prevent the main div's click from triggering inputElement.click()
    value = '';
    selectedFile = null;
    if (inputElement) {
      inputElement.value = ''; // Reset the file input so the same file can be re-selected
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
  <div 
    class="px-4 py-3 rounded-sm outline outline-outline-variant focus-within:outline-outline select-none flex flex-row items-center justify-between text-sm tracking-[0.01em] cursor-pointer"
    onclick={() => !isUploading && !(value || selectedFile) && inputElement?.click()}
    role="button"
    tabindex="0"
    onkeypress={(e) => { if (!isUploading && !(value || selectedFile) && (e.key === 'Enter' || e.key === ' ')) inputElement?.click(); }}
    aria-disabled={isUploading}
  >
    <button
      class="text-start truncate pr-2 flex-grow {(selectedFile || value) && !isUploading ? '' : 'text-muted'}"
      onclick={() => !isUploading && inputElement?.click()}
    >
      {#if isUploading}
        Uploading...
      {:else}
        {displayFileName}
      {/if}
    </button>
    <input
      type="file"
      bind:this={inputElement}
      onchange={handleFileChange}
      class="hidden"
      {accept}
      disabled={isUploading}
      {...restProps}
    />
    {#if isUploading}
      <i class="ri-loader-4-line animate-spin text-lg ml-2"></i>
    {:else if value || selectedFile}
      <button 
        type="button" 
        onclick={clearFile} 
        class="p-0 m-0 bg-transparent border-none text-muted hover:text-default focus:text-default"
        aria-label="Clear file"
      >
        <i class="ri-close-circle-line text-lg ml-2"></i>
      </button>
    {:else}
      <i class="ri-upload-cloud-2-line text-lg ml-2"></i>
    {/if}
  </div>
</div>