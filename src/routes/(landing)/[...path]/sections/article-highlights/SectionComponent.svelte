<script lang="ts">
  const {section} = $props()  
</script>

<!-- {JSON.stringify(section.data.article)} -->

<div
  class="flex items-center justify-center bg-cover bg-center"
>
  <div class="w-full max-w-screen-xl flex flex-col p-12">
    <div class="gap-6 flex flex-row items-center justify-between">
      <div class="flex flex-col gap-sm">
        <p>{section.data.content.subtitle}</p>
        <p class="text-4xl font-bold">{section.data.content.title}</p>
      </div>
      {#if section.data.content.url}
        <div class="flex flex-row items-center gap-sm">
          <a href={section.data.content.url} class="font-semibold underline">Lebih Banyak</a>
          <i class="ri-arrow-right-line"></i>
        </div>
      {/if}
    </div>
    <div class="w-full grid grid-cols-3 gap-base">
      {#each section.data.article as article}
        <p>{JSON.stringify(article)}</p>
      {/each}
    </div>
  </div>
</div>