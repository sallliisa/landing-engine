<script lang="ts">
  const {section} = $props()
</script>

<div class="flex flex-col">
  <div
    class="h-fit md:h-[40vh] flex items-center justify-center bg-cover bg-center"
    style="background-image: url({section.meta.background_image})"
  >
    <div class="px-6 lg:px-12 pt-12 lg:pt-24 pb-12 flex md:flex-row flex-col items-center gap-4 max-w-screen-xl w-full">
      <div class="w-full">
        <p class="text-2xl md:text-4xl font-bold">{section.data.contents[0].title}</p>
      </div>
      <div class="w-full flex md:items-end md:justify-end">
        <p class="max-w-[50ch]">{@html section.data.contents[0].description}</p>
      </div>
    </div>
  </div>
  <div class="h-[12px] w-full flex items-center justify-center">
    <div class="max-w-screen-xl w-full h-full relative">
      <!-- <div class="flex flex-col gap-3 fixed pt-12">
        <button class="text-start underline font-semibold">Pesan Direktur</button>
        <button class="text-start text-outline">Visi & Misi</button>
        <button class="text-start text-outline">Pencapaian Perusahaan</button>
        <button class="text-start text-outline">Struktur Organisasi</button>
        <button class="text-start text-outline">Manajemen</button>
        <button class="text-start text-outline">Anak Perusahaan</button>
      </div> -->
    </div>
  </div>
</div>