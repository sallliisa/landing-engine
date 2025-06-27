<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import {page} from '$app/state';
  import { getLocale } from '$lib/paraglide/runtime';
</script>

<!-- <div class="h-[36px] w-full"></div> -->
<div class="w-full">
  <div
    class="w-full py-16 flex flex-col items-center justify-center bg-[#ECEFF1] border-t border-outline-variant bg-center bg-cover"
  >
    <div class="w-full max-w-screen-xl px-12 grid grid-dynamic-[250px] gap-8">
      <div class="flex flex-col gap-base">
        <img src="/assets/logo/hkr.svg?{new Date().toJSON()}" alt="HK Realtindo" class="w-[85px] h-[36px]"/>
        <div class="flex flex-col gap-sm">
          <p class="font-semibold">{page.data.companyProfile.name}</p>
          <p>{page.data.companyProfile.address}</p>
        </div>
      </div>
      <div class="flex flex-col gap-base">
        <p class="text-xl font-bold">{m.contact_us()}</p>
        <div class="flex flex-row gap-sm">
          <i class="ri-mail-line"></i>
          <a href="mailto:{page.data.companyProfile.email}" data-analytics-contact={`mailto:${page.data.companyProfile.email}`}>{page.data.companyProfile.email}</a>
        </div>
        <div class="flex flex-row gap-sm">
          <i class="ri-phone-line"></i>
          <a href="tel:{page.data.companyProfile.phone}" data-analytics-contact={`tel:${page.data.companyProfile.phone}`}>{page.data.companyProfile.phone}</a>
        </div>
        <div class="flex flex-row items-center gap-2">
          {#if page.data.companyProfile?.facebook}<a href="https://{page.data.companyProfile?.facebook}" data-analytics-contact={page.data.companyProfile?.facebook} aria-label="Facebook" target="_blank"><i class="ri-facebook-circle-fill text-xl"></i></a>{/if}
          {#if page.data.companyProfile?.instagram}<a href="https://{page.data.companyProfile?.instagram}" data-analytics-contact={page.data.companyProfile?.instagram} aria-label="Instagram"><i class="ri-instagram-fill text-xl"></i></a>{/if}
          {#if page.data.companyProfile?.twitter}<a href="https://{page.data.companyProfile?.twitter}" data-analytics-contact={page.data.companyProfile?.twitter} aria-label="LinkedIn"><i class="ri-linkedin-box-fill text-xl"></i></a>{/if}
          {#if page.data.companyProfile?.youtube}<a href="https://{page.data.companyProfile?.youtube}" data-analytics-contact={page.data.companyProfile?.youtube} aria-label="YouTube"><i class="ri-youtube-fill text-xl"></i></a>{/if}
        </div>
      </div>
      <div class="flex flex-col gap-base">
        <p class="font-bold text-xl">{m.subsidiaries()}</p>
        {#each page.data.companyProfile.subsidiaries as subsidiary}
          <a class="underline" data-analytics-redirect={subsidiary.type === 'external' ? subsidiary.url : undefined} href={subsidiary.type === 'external' ? subsidiary.url : subsidiary.slug} target={subsidiary.type === 'external' ? '_blank' : undefined}>{subsidiary.name}</a>
        {/each}
      </div>
      <div class="flex flex-col gap-base">
        <p class="font-bold text-xl">{m.products()}</p>
        {#each page.data.collection.find((item: any) => item.code === 'project-category')?.data as category}
          <a class="underline" href="/proyek?category_code={category.code}">{getLocale() === 'en' ? category.name_en : category.name_id}</a>
        {/each}
      </div>
    </div>
  </div>
  <div class="w-full h-[9px] bg-primary"></div>
  <div class="w-full h-[6px] bg-secondary"></div>
</div>
