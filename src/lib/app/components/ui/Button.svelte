<script lang="ts">
  import { Button } from "bits-ui";
  import { boolean } from "mathjs";
  import type { HTMLButtonAttributes } from "svelte/elements";

  const {
    children,
    size = 'wide',
    variant = 'filled',
    type = 'button',
    ...restProps
  } = $props<{
    size?: 'wide' | 'square',
    variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'tab',
    type?: HTMLButtonAttributes['type'],
    [key: string]: any;
  }>();
  
  const classMap: any = {
    variant: {
      filled: 'bg-primary text-on-primary before:bg-surface/10 active:before:bg-surface/20 disabled:bg-outline-variant',
      tonal: 'bg-primary-muted text-on-surface before:bg-on-surface/5 active:before:bg-on-surface/10 disabled:bg-outline-variant',
      outlined: 'border border-black/20 before:bg-on-surface/5 active:before:bg-on-surface/10 disabled:bg-outline-variant',
      text: 'before:bg-on-surface/5 active:before:bg-on-surface/10 disabled:text-outline-variant',
    },
    size: {
      square: 'p-3 aspect-square',
			wide: 'px-6 py-3',
    }
  }
  
</script>

<Button.Root
  {...restProps}
  class="flex flex-row gap-2 items-center justify-center {!restProps.disabled ? 'overlay' : ''} {restProps.class} {classMap.variant[variant]} {classMap.size[size]}"
>
  {@render children()}
</Button.Root>