<script lang="ts">
	import { getEmblaContext } from "./context.js";

	const emblaCtx = getEmblaContext("<Carousel.Navigation/>");

	let totalSlides = $state(0);
	let currentIndex = $state(0);

	emblaCtx.api?.on("select", () => {
		currentIndex = emblaCtx.api?.selectedScrollSnap() ?? 0;
	});
	emblaCtx.api?.on("slidesChanged", () => {
		totalSlides = emblaCtx.api?.scrollSnapList().length ?? 0;
        currentIndex = emblaCtx.api?.selectedScrollSnap() ?? 0; // Re-evaluate current index on slides changed
	});

	// Initial setup
	$effect(() => {
		if (emblaCtx.api) {
			totalSlides = emblaCtx.api.scrollSnapList().length;
			currentIndex = emblaCtx.api.selectedScrollSnap();
		}
	})

	function handleDotClick(index: number) {
		emblaCtx.api?.scrollTo(index);
	}
</script>

{#if totalSlides > 0}
<div class="flex items-center justify-center space-x-2 p-4">
		<button
			onclick={emblaCtx.scrollPrev}
			aria-label="Previous slide"
			class="px-4 relative rounded-full {emblaCtx.canScrollPrev ? 'text-on-surface overlay before:bg-on-surface/5 active:before:bg-on-surface/10' : 'text-outline-variant cursor-default'}"
		>
			<i class="ri-arrow-left-s-line"></i>
		</button>
		{#each Array(totalSlides) as _, i}
			<button
				onclick={() => handleDotClick(i)}
				class="h-2 w-2 rounded-full bg-gray-400 transition-all duration-300 ease-in-out {currentIndex === i ? 'w-[32px] bg-on-surface' : 'bg-outline-variant'}"
				aria-label="Go to slide {i + 1}"
			></button>
		{/each}
		<button
			onclick={emblaCtx.scrollNext}
			aria-label="Next slide"
			class="px-4 relative rounded-full {emblaCtx.canScrollNext ? 'text-on-surface overlay before:bg-on-surface/5 active:before:bg-on-surface/10' : 'text-outline-variant cursor-default'}"
		>
			<i class="ri-arrow-right-s-line"></i>
		</button>
	</div>
{/if}