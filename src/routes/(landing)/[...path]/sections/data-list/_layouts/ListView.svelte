<script lang="ts">
  const {content} = $props()
</script>

<div class="border border-outline-variant rounded-lg p-4 flex flex-col md:flex-row gap-4 md:gap-8 items-center md:justify-center">
  <!-- Row 1 (Mobile): Image and Title -->
  <div class="w-full flex flex-row items-center gap-4 md:w-auto md:contents">
    {#if content.media}
      <img src={content.media} alt={content.title ?? ''} class="w-16 h-16 md:w-[96px] md:h-[96px] aspect-square rounded-sm object-cover flex-shrink-0"/>
    {/if}
    <p class="font-semibold md:hidden">{content.title}{#if content.status}<span class="ml-2"><i class="ri-lock-line"></i></span>{/if}</p>
  </div>

  <div class="w-full flex flex-col gap-sm">
    <!-- Title (Desktop) / Row 2 (Mobile): Description -->
    <div class="flex flex-col gap-xs">
      <p class="font-semibold hidden md:block">{content.title}{#if content.status}<span class="ml-2"><i class="ri-lock-line"></i></span>{/if}</p>
      <p>{content.description}</p>
    </div>
    <!-- Row 3 (Mobile): Actions -->
    <div class="flex flex-row items-center gap-base flex-wrap text-sm mt-2 md:mt-0">
      {#if content.url}<a href={content.url} target="_blank" rel="noopener noreferrer"><span class="underline">Kunjungi Kami</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
      {#if content.attachment}<a href={content.attachment} target="_blank" rel="noopener noreferrer"><span class="underline">Download</span> <i class="ri-download-line"></i></a>{/if}
      {#if content.status}<a href={`/kontak/permohonan-dokumen?nama_dokumen=${encodeURIComponent(content.title ?? '')}`}><span class="underline">Ajukan Permohonan Dokumen</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
    </div>
  </div>
</div>