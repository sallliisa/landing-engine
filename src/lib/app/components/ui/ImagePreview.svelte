<script lang="ts">
  import { Dialog, Label, Separator } from "bits-ui";
  import { fade } from "svelte/transition";
  import { flyAndScale } from "$lib/utils/anims";

  export let src: string
  export let alt: string = 'Image'
  export let title: string = ''
  export let description: string = ''

  let className = ''
  export {className as class}
</script>

<Dialog.Root>
  <Dialog.Trigger class={className}>
    <div class="text-white rounded-xl bg-center h-full bg-cover flex flex-col items-start group/item justify-end p-6" style="background-image: {(title || description) ? `linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 50%), ` : ``} url('{src}');">
      <p class="text-xl font-semibold translate-y-5 group-hover/item:translate-y-0 transition-all">{title}</p>
      {#if description}<p class="text-sm translate-y-5 group-hover/item:translate-y-0 transition-all rtf-content m-base text-start">{@html description}</p>{/if}
      <p class="text-xs mt-2 opacity-0 translate-y-5 transition-all group-hover/item:opacity-100 group-hover/item:translate-y-0"><i class="ri-arrow-right-up-line"></i></p>
    </div>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <Dialog.Content
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] rounded-card-lg bg-background shadow-popover outline-none sm:max-w-[490px] md:w-full"
    >
      <div class="relative">
        <img src={src} alt={alt} class="w-full h-auto rounded-xl"/>
        <div class="absolute bottom-0 left-0 flex flex-col p-6 text-white">
          <p class="text-xl font-semibold">{title}</p>
          <p class="text-sm rtf-content m-base">{@html description}</p>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>