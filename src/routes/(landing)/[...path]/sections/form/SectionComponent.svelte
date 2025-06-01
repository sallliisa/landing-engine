<script lang="ts">
  import { page } from "$app/state";
  
  import Button from "$lib/app/components/ui/Button.svelte";
  import { parseSearchParams } from "$lib/utils/common";
  import { formatData } from "$lib/utils/format";
  import { mathjs } from "$lib/utils/math";
  import { api } from "$lib/utils/services";
  import { onMount, setContext } from "svelte";
  import FormView from "./_layouts/FormView.svelte";
  import SuccessView from "./_layouts/SuccessView.svelte";

  const {section} = $props();
  setContext('section', section)
  let viewIndex = $state<0 | 1>(0)
</script>

<div class="flex w-full items-center justify-center">
  <div class="w-full max-w-screen-xl grid grid-cols-1 {section.meta.type === 'one-column' ? 'md:grid-cols-6 gap-lg' : 'md:grid-cols-2 gap-x-xl gap-y-lg'} py-3 px-6 lg:px-12">
    {#if section.meta.type === 'two-column'}
      <div class="flex flex-col gap-lg">
        {#if section.data.content.subtitle || section.data.content.title || section.data.content.description}
          <div class="flex flex-col gap-base w-full">
            <div class="flex flex-col gap-xs">
              {#if section.data.content.subtitle}<p>{section.data.content.subtitle}</p>{/if}
              {#if section.data.content.title}<p class="text-3xl md:text-4xl font-bold">{section.data.content.title}</p>{/if}
            </div>
            {#if section.data.content.description}<p class="rtf-content m-base">{@html section.data.content.description}</p>{/if}
          </div>
        {/if}
        {#if section.data.contactDetail.visible}
          {@render contactDetail()}
        {/if}
      </div>
    {/if}
    <div class="flex flex-col {section.meta.type === 'one-column' ? 'col-span-4' : 'col-span-1'}">
      {#if viewIndex === 0}
        <div class="flex flex-col gap-lg">
          {#if section.meta.type === 'one-column'}
            <div class="flex flex-col gap-xs">
              <div class="flex flex-col gap-xs">
                {#if section.data.content.subtitle}<p class="text-xs md:text-sm">{section.data.content.subtitle}</p>{/if}
                {#if section.data.content.title}<p class="text-lg md:text-xl font-bold">{section.data.content.title}</p>{/if}
              </div>
              {#if section.data.content.description}<p class="rtf-content m-base text-outline">{@html section.data.content.description}</p>{/if}
            </div>
          {/if}
          <FormView onSubmit={() => viewIndex = 1}/>
        </div>
      {:else}
        <SuccessView onPrevious={() => viewIndex = 0}/>
      {/if}
    </div>
    {#if section.meta.type === 'one-column' && section.data.contactDetail.visible}
      {@render contactDetail()}
    {/if}
  </div>
</div>

{#snippet contactDetail()}
  <div class="col-span-2 outline outline-outline-variant p-6 flex flex-col gap-lg">
    {#if section.data.contactDetail.content.title || section.data.contactDetail.content.description}
      <div class="flex flex-col gap-sm">
        <p class="text-xl font-semibold">{section.data.contactDetail.content.title}</p>
        <p class="text-sm text-outline rtf-content m-base">{@html section.data.contactDetail.content.description}</p>
      </div>
    {/if}
    <div class="flex flex-col gap-base">
      {#each section.data.contactDetail.contact as contactItem}
        <div class="flex flex-col gap-xs">
          <p class="text-xs text-outline">{contactItem.title}</p>
          <div class="flex flex-row gap-sm">
            <i class={contactItem.media}></i>
            <p>{contactItem.value}</p>
          </div>
        </div>
      {/each}
      <div class="flex flex-row items-center gap-2">
        {#each section.data.contactDetail.socialMedia as socialMedia}
          <a href="https://{socialMedia.url}" aria-label="Social Media" target="_blank"><i class="{socialMedia.media} text-xl"></i></a>
        {/each}
        <!-- {#if page.data.companyProfile?.facebook}<a href="https://{page.data.companyProfile?.facebook}" aria-label="Facebook" target="_blank"><i class="ri-facebook-circle-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.instagram}<a href="https://{page.data.companyProfile?.instagram}" aria-label="Instagram"><i class="ri-instagram-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.twitter}<a href="https://{page.data.companyProfile?.twitter}" aria-label="LinkedIn"><i class="ri-linkedin-box-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.youtube}<a href="https://{page.data.companyProfile?.youtube}" aria-label="YouTube"><i class="ri-youtube-fill text-xl"></i></a>{/if} -->
      </div>
    </div>
  </div>
{/snippet}