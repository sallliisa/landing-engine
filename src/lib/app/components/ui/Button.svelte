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
    variant?: 'filled' | 'tonal' | 'outlined' | 'text',
    type?: HTMLButtonAttributes['type'],
    [key: string]: any;
  }>();
  
  const classMap: any = {
    variant: {
      filled: 'bg-primary text-on-primary after:bg-white/10 after:active:bg-white/15 disabled:bg-outline-variant',
      tonal: 'bg-primary-container text-on-primary-container after:bg-black/5 after:active:bg-black/10 disabled:bg-outline-variant',
      outlined: 'border border-black/20 after:bg-black/5 after:active:bg-black/10 disabled:bg-outline-variant',
      text: 'after:hover:bg-black/5 after:active:bg-black/50 disabled:text-outline-variant',
    },
    size: {
      square: 'p-3',
			wide: 'px-6 py-3',
    }
  }
  
</script>

<Button.Root
  {...restProps}
  class="rounded-sm flex items-center justify-center overlay {restProps.class} {classMap.variant[variant]} {classMap.size[size]}"
>
  {@render children()}
</Button.Root>