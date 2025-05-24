<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import {page} from '$app/state';
  import { getLocale, setLocale } from "$lib/paraglide/runtime";
  import { slide, blur, fade } from "svelte/transition";
  import { debounce } from "$lib/utils/common";
  import { index } from "mathjs";
  import { cubicIn } from "svelte/easing";

  let windowScrollY = $state(0);
  let windowHeight = $state(0);
  let isMenuExpanded = $state(false)
  let activeLevel1Index = $state<number | null>(null)
  let activeLevel2Index = $state<number | null>(null)

  let [currentLevel1Menu, currentLevel2Menu] = $derived.by(() => {
    const l1 = page.data.menu.find((item: any) => item.slug === page.url.pathname.split('/').filter(Boolean)[0])
    const l2 = l1?.children.find((item: any) => item.slug === page.url.pathname.split('/').filter(Boolean)[1])
    return [l1, l2]
  })

  const debouncedMenuExpandMouseHover = debounce((index: number, mode: 'expand' | 'shrink') => {
    if (mode === 'expand') {
      isMenuExpanded = true
      activeLevel1Index = index
      activeLevel2Index = null
    } else {
      isMenuExpanded = false
      activeLevel1Index = null
      activeLevel2Index = null
    }
  }, 100)
</script>

<svelte:window bind:scrollY={windowScrollY} bind:outerHeight={windowHeight}/>
{#if isMenuExpanded}
  <div role="none" transition:blur onmouseenter="{() => debouncedMenuExpandMouseHover(-1, 'shrink')}" class="z-[48] h-screen w-screen top-0 fixed backdrop-blur-md"></div>
{/if}
<div class="lg:flex flex-col hidden">
  <div class="w-full flex flex-col items-center justify-center fixed z-[50] box-border transition-all border-b {(windowScrollY != 0 && !isMenuExpanded) ? 'bg-surface border-b-outline-variant' : 'border-transparent'}">
    <div class="flex flex-row items-center justify-between w-full px-12 py-6 max-w-screen-xl">
      <a href="{page.data.primaryMenuPath}">
        <img src="/assets/logo/hkr.svg" class="w-[64px] h-[27px]" alt="HK Realtindo"/>
      </a>
      <div class="flex flex-row items-center gap-base text-sm xl:text-base">
        {#each page.data.menu as menu, index}
          {#if menu.visible}
            {#if menu.menu_item_type == 'link'}
              <a href={menu.url} class="text-on-surface">{menu.name}</a>
            {:else if menu.menu_item_type == 'page'}
              <div class="relative">
                {#if menu.children?.length > 1}
                  <button
                    onfocus="{() => {}}"
                    onmouseover="{() => debouncedMenuExpandMouseHover(index, 'expand')}"
                    class="text-on-surface flex flex-row gap-xs"
                  >
                    <p>{menu.name}</p>
                    <i class="ri-arrow-down-s-line {activeLevel1Index === index ? 'rotate-180' : 'rotate-0'} transition-transform"></i>
                  </button>
                {:else}
                  <a
                    onfocus="{() => {}}"
                    onmouseover="{() => debouncedMenuExpandMouseHover(index, 'shrink')}"
                    onclick="{() => isMenuExpanded = false}"
                    href="/{menu.slug}"
                    class="text-on-surface"
                  >
                    {menu.name}
                  </a>
                {/if}
              </div>
            {/if}
          {/if}
        {/each}
      </div>
      <div>
        <button onclick={() => getLocale() === 'id' ? setLocale('en') : setLocale('id')} class="bg-surface outline outline-outline-variant flex flex-row items-center justify-between gap-sm px-3 py-2 rounded-sm">
          <img src="/assets/i18n/flags/{getLocale()}.svg" alt="{getLocale()}" class="rounded-full aspect-square w-4 outline outline-outline-variant object-center object-cover"/>
          <p class="font-bold uppercase text-on-surface">{getLocale()}</p>
        </button>
      </div>
    </div>
  </div>
  {#if currentLevel1Menu.show_submenu_below_navbar && !isMenuExpanded}
    <div transition:blur={{duration: 150}} class="w-full z-[51] py-1.5 flex flex-row items-center justify-center gap-4 fixed top-[88px] border-y transition-all {(windowScrollY != 0) ? 'bg-surface border-y-outline-variant mt-0' : 'border-transparent -mt-4'}">
      {#each currentLevel1Menu.children as menu}
        <a href="/{currentLevel1Menu.slug}/{menu.slug}" class="text-start text-sm {menu.slug === currentLevel2Menu.slug ? 'font-semibold underline' : ''}">{menu.translations[0].name}</a>
      {/each}
    </div>
  {/if}
  {#if isMenuExpanded && activeLevel1Index != null}
    <div
      role="menu"
      tabindex="{activeLevel1Index}"
      class="fixed text-sm xl:text-base w-full bg-surface outline-0 z-[49] h-[428px] border-b transition-[border] pt-[88px] border-outline-variant"
      in:slide={{duration: 200}}
      out:slide={{duration: 200, delay: 100}}
    >
      {#key activeLevel1Index}
        <div
          class="w-full max-w-screen-xl px-12 py-6 mx-auto grid grid-cols-3 gap-lg"
          in:blur|global={{duration: 100, delay: 100}}
          out:blur|global={{duration: 100}}
        >
          <div>
            <p class="text-lg xl:text-xl font-bold">{page.data.menu[activeLevel1Index].name}</p>
          </div>
          <div class="flex flex-col gap-base">
            {#each page.data.menu[activeLevel1Index].children as level2Child, level2Index}
              {#if level2Child.children?.length}
                <button
                  onfocus="{() => {}}"
                  class="flex flex-row items-center justify-between group/menuItem"
                  onmouseover="{() => activeLevel2Index = level2Index}"
                >
                  <p>{level2Child.name}</p>
                  <i class="ri-arrow-right-s-line transition-colors {activeLevel2Index === level2Index ? 'text-outline' : 'text-outline-variant'}"></i>
                </button>
              {:else}
                <a href="/{page.data.menu[activeLevel1Index].slug}/{level2Child.slug}" onclick="{() => isMenuExpanded = false}">{level2Child.name}</a>
              {/if}
            {/each}
          </div>
          {#if activeLevel2Index != null}
            {#key activeLevel2Index}
              <div
                class="flex flex-col gap-base"
                in:blur|global={{duration: 100, delay: 100}}
                out:blur|global={{duration: 100}}
              >
                {#each page.data.menu[activeLevel1Index]?.children[activeLevel2Index]?.children as level3Child}
                  <a href="/{page.data.menu[activeLevel1Index].slug}/{page.data.menu[activeLevel1Index]?.children[activeLevel2Index].slug}/{level3Child.slug}" onclick="{() => isMenuExpanded = false}">{level3Child.name}</a>
                {/each}
              </div>
            {/key}
          {/if}
        </div>
      {/key}
    </div>
  {/if}
</div>