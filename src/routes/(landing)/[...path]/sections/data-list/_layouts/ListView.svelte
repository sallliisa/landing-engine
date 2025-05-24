<script lang="ts">
  const {content} = $props()
</script>

<div class="outline outline-outline-variant rounded-lg p-4 flex flex-row gap-8 items-center justify-center">
  {#if content.media}<img src={content.media} alt={content.title ?? ''} class="w-[96px] aspect-square rounded-sm"/>{/if}
  <div class="w-full flex flex-col gap-sm">
    <div class="flex flex-col gap-xs">
      <p class="font-semibold">{content.title}{#if content.status}<span class="ml-2"><i class="ri-lock-line"></i></span>{/if}</p>
      <p>{content.description}</p>
    </div>
    <div class="flex flex-row items-center gap-base flex-wrap text-sm">
      {#if content.url}<a href={content.url} target="_blank" rel="noopener noreferrer"><span class="underline">Kunjungi Kami</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
      {#if content.attachment}<a href={content.attachment} target="_blank" rel="noopener noreferrer"><span class="underline">Download</span> <i class="ri-download-line"></i></a>{/if}
      {#if content.status}<a href="/kontak/permohonan-dokumen?nama_dokumen={content.title}"><span class="underline">Ajukan Permohonan Dokumen</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
    </div>
  </div>
</div>