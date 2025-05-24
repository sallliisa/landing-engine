<script lang="ts">
  const {section} = $props()
</script>

<div class="flex flex-col">
  <div
    class="h-[40vh] flex items-center justify-center bg-cover bg-center"
    style="background-image: url({section.meta.background_image})"
  >
    <div class="px-12 pt-24 pb-12 flex sm:flex-row flex-col items-center gap-4 max-w-screen-xl w-full">
      <div class="w-full">
        <p class="text-4xl font-bold">{section.data.contents[0].title}</p>
      </div>
      <div class="w-full flex items-end justify-end">
        <p class="max-w-[50ch]">{@html section.data.contents[0].description}</p>
      </div>
    </div>
  </div>
  <div class="h-[12px] w-full"></div>
</div>