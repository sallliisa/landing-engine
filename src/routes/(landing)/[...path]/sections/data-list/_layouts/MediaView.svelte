<script lang="ts">
  import { page } from "$app/state";
  import { m } from "$lib/paraglide/messages";

  const {content} = $props()
</script>

<div class="flex flex-col gap-sm">
  <img class="aspect-[2/3] object-center object-cover" src={content.media} alt={content.title ?? ''}/>
  <div class="flex flex-col gap-xs">
    <p class="font-bold">{content.title}</p>
    <div class="flex flex-row items-center gap-base flex-wrap text-sm">
      {#if content.url}<a href={content.url} target="_blank" rel="noopener noreferrer"><span class="underline">{content.url_text || m.learn_more()}</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
      {#if content.attachment && !content.status}
        <a href="/media-preview?url={content.attachment}&title={content.title}&description={content.description}"><span class="underline">Preview</span> <i class="ri-eye-line"></i></a>
        <a href={content.attachment} target="_blank" rel="noopener noreferrer"><span class="underline">Download</span> <i class="ri-download-line"></i></a>
      {/if}
      {#if content.status}<a href={`${page.data.documentRequestMenuPath}?nama_dokumen=${encodeURIComponent(content.title ?? '')}`}><span class="underline">Pengajuan Dokumen</span> <i class="ri-arrow-right-up-line"></i></a>{/if}
    </div>
  </div>
</div>