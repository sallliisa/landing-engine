<script lang="ts">
  import { page } from '$app/state';
</script>


<div class="flex flex-col gap-4">
  <!-- <Navbar/> -->
  <div class="h-[400px]"></div>
  <!-- <div class="flex flex-col gap-4">
    <p>{JSON.stringify(page.data.menu)}</p>
    <p>{JSON.stringify(page.data.currentPageTranslation)}</p>
  </div> -->
  <!-- <div class="flex flex-col gap-2">
    <a href="/beranda">beranda</a>
    <a href="/tentang-kami">tentang kami</a>
    <button on:click={() => setLocale('en')}>set to en</button>
    <button on:click={() => setLocale('id')}>set to id</button>
  </div> -->
  <p>{page.data.currentPageSectionGroup}</p>
  <!-- <Footer/> -->
</div>