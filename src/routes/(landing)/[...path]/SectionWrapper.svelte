<script lang="ts">
  import IntersectionObserver from '$lib/components/IntersectionObserver.svelte';

  const {children, index} = $props()
</script>

{#if index != 0}
  <IntersectionObserver 
    threshold={0.1} 
    animationDelay={100} 
    animationDirection="fade-up"
    once
  >
    {@render children()}
  </IntersectionObserver>
{:else}
  {@render children()}
{/if}