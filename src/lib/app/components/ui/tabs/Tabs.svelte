<script lang="ts">
  import TabItem from "./TabItem.svelte";

  let {activeTabIndex = $bindable(0), tabItem, data} = $props()


</script>

{#each data as item, index}
  <TabItem onclick={() => activeTabIndex = index} active={index === activeTabIndex}>{@render tabItem(item)}</TabItem>
{/each}