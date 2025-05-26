<script lang="ts">
  import { Dialog, Label, Separator } from "bits-ui";
  import { fade } from "svelte/transition";
  import { flyAndScale } from "$lib/utils/anims";

  const {
    src,
    alt,
    title, 
    description,
    trigger,
    ...restProps
  } = $props<{
    src?: string,
    alt?: string,
    title?: string,
    description?: string,
    trigger?: () => any,
    [key: string]: any
  }>()
</script>

<Dialog.Root>
  <Dialog.Trigger class={restProps.class} type="button">
    {#if !trigger}
      <div class="text-white rounded-xl bg-center h-full bg-cover flex flex-col text-start items-start group/item justify-end p-6" style="background-image: {(title || description) ? `linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 50%), ` : ``} url('{src}');">
        <p class="font-semibold translate-y-5 group-hover/item:translate-y-0 transition-all">{title}</p>
        <!-- {#if description}<p class="text-sm translate-y-5 group-hover/item:translate-y-0 transition-all rtf-content m-base text-start">{@html description}</p>{/if} -->
        <p class="text-xs mt-2 opacity-0 translate-y-5 transition-all group-hover/item:opacity-100 group-hover/item:translate-y-0"><i class="ri-arrow-right-up-line"></i></p>
      </div>
    {:else}
      {@render trigger()}
    {/if}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/80"
    />
    <Dialog.Content
      class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-[100] w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] p-5 sm:max-w-[490px] md:w-full"
    >
      <div class="relative">
        <img src={src} alt={alt} class="w-full h-auto rounded-xl"/>
        {#if title || description}
          <div class="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 to-transparent"></div>
        {/if}
        <div class="absolute bottom-0 left-0 flex flex-col gap-base p-6 text-white">
          <p class="text-xl font-semibold">{title}</p>
          <p class="text-sm rtf-content m-base">{@html description}</p>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>