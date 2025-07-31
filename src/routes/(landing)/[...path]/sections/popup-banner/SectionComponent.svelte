<script lang="ts">
  import { Dialog } from "bits-ui";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  // import { X } from "lucide-svelte";

  const {section} = $props()

  let shouldPopupOpen = $state(false)
  const cookieName = `has-shown-popup-${section.data.content.id}`

  onMount(() => {
    if (browser) {
      const hasShownPopup = section.meta.show_once && document.cookie.includes(`${cookieName}=true`);
      if (!hasShownPopup) {
        shouldPopupOpen = true;
      }
    }
  });

  $effect(() => {
    if (shouldPopupOpen && browser) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `${cookieName}=true; expires=${expiryDate.toUTCString()}; path=/`;
    }
  })
</script>

<Dialog.Root bind:open={shouldPopupOpen}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/80"
    />
    <Dialog.Content
      class="bg-transparent flex items-center justify-center top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 h-fit data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 w-full md:w-fit z-[100] p-4 sm:p-6 md:inset-auto md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:max-w-[90vw] md:max-h-[90vh] md:p-0"
    >
      <div class="relative w-full bg-surface overflow-y-auto flex flex-col md:m-0 md:w-auto md:max-w-none md:max-h-none md:bg-transparent md:rounded-none md:overflow-visible">
        <Dialog.Close class="absolute top-2 right-2 flex items-center justify-center rounded-full aspect-square bg-black/50 p-1 text-white hover:bg-black/75 transition-colors">
          <!-- <X class="w-5 h-5" /> -->
          <i class="ri-close-line"></i>
        </Dialog.Close>
        <a href={section.data.content.url} target="_blank">
          <img 
            src={section.data.content.media} 
            alt="Pop-up Banner"
            class="w-full h-auto object-cover max-h-[50vh] block md:max-h-[90vh] md:max-w-[90vw] md:object-contain"
          />
        </a>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>