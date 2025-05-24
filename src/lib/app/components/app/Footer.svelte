<script lang="ts">
  import * as m from '$lib/paraglide/messages.js'
  import {page} from '$app/state';
</script>

<div class="h-[36px] w-full"></div>
<div
  class="w-full py-16 flex items-center justify-center border-t border-outline-variant bg-center bg-cover"
  style="background-image: linear-gradient(rgba(255, 249, 245, 0.52), rgba(255, 249, 245, 0.52)), url(/assets/image/background-texture.png);"
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
        <p>{page.data.companyProfile.email}</p>
      </div>
      <div class="flex flex-row gap-sm">
        <i class="ri-phone-line"></i>
        <p>{page.data.companyProfile.phone}</p>
      </div>
      <div class="flex flex-row items-center gap-2">
        {#if page.data.companyProfile?.facebook}<a href="https://{page.data.companyProfile?.facebook}" aria-label="Facebook" target="_blank"><i class="ri-facebook-circle-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.instagram}<a href="https://{page.data.companyProfile?.instagram}" aria-label="Instagram"><i class="ri-instagram-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.twitter}<a href="https://{page.data.companyProfile?.twitter}" aria-label="LinkedIn"><i class="ri-linkedin-box-fill text-xl"></i></a>{/if}
        {#if page.data.companyProfile?.youtube}<a href="https://{page.data.companyProfile?.youtube}" aria-label="YouTube"><i class="ri-youtube-fill text-xl"></i></a>{/if}
      </div>
    </div>
    <div class="flex flex-col gap-base">
      <p class="font-bold text-xl">Subsidiaries</p>
      <!-- <p>{page.data.companyProfile.address}</p> -->
    </div>
    <div class="flex flex-col gap-base">
      <p class="font-bold text-xl">Offerings</p>
      <!-- <p>{page.data.companyProfile.address}</p> -->
    </div>
  </div>
</div>