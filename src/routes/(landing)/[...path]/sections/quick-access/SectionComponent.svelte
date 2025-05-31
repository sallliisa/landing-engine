<script lang="ts">
  const {section} = $props()
</script>

<div class="flex w-full items-center justify-center">
  <div class="flex flex-row flex-wrap items-center justify-center gap-base w-full max-w-screen-xl px-12 py-6">
    {#each section.data.gallery as item}
      <a href={item.url} class="w-[384px] p-6 outline outline-outline flex flex-row items-start gap-base overlay before:bg-on-surface/5 active:before:bg-on-surface/10">
        <i class="{item.media} text-lg"></i>
        <div class="flex flex-col gap-sm">
          <p class="font-bold">{item.title}</p>
          <p class="text-sm text-outline">{item.description}</p>
        </div>
      </a>
    {/each}
  </div>
</div>