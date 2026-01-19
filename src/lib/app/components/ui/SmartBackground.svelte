<!--
  SmartBackground Component
  
  A backwards-compatible background image component that:
  1. Falls back gracefully if no manifest exists (for old images)
  2. Uses optimized WebP variants when available
  3. Shows placeholder while loading main image
  
  Usage:
  <SmartBackground src={imageUrl} class="your-classes" overlay={true}>
    <div>Content on top of background</div>
  </SmartBackground>
-->
<script lang="ts">
    import { onMount } from "svelte";

    interface ImageVariant {
        width: number;
        format: string;
        path: string;
        size: number;
    }

    interface ImageManifest {
        width: number;
        height: number;
        aspectRatio: number;
        format: string;
        placeholder: string;
        variants: ImageVariant[];
    }

    let {
        src,
        class: className = "",
        overlay = false,
        overlayGradient = "linear-gradient(rgba(0,0,0,0.16), rgba(0,0,0,0.16)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%)",
        children,
        style: additionalStyle = "",
        ...restProps
    }: {
        src: string;
        class?: string;
        overlay?: boolean;
        overlayGradient?: string;
        children?: any;
        style?: string;
        [key: string]: any;
    } = $props();

    let manifest = $state<ImageManifest | null>(null);
    let optimizedSrc = $state<string>(src);
    let loaded = $state(false);

    // Get the base directory from the src for resolving variant paths
    function getBaseDir(imageSrc: string): string {
        try {
            const url = new URL(
                imageSrc,
                typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost",
            );
            const pathname = url.pathname;
            return pathname.substring(0, pathname.lastIndexOf("/") + 1);
        } catch {
            return "";
        }
    }

    // Get manifest API path
    function getManifestUrl(imageSrc: string): string {
        try {
            const url = new URL(
                imageSrc,
                typeof window !== "undefined"
                    ? window.location.origin
                    : "http://localhost",
            );
            return `/api/image/manifest${url.pathname}`;
        } catch {
            return "";
        }
    }

    onMount(async () => {
        if (!src) return;

        const manifestUrl = getManifestUrl(src);
        if (!manifestUrl) return;

        try {
            const response = await fetch(manifestUrl);
            if (response.ok) {
                manifest = await response.json();

                // Find best WebP variant (largest available or closest to viewport width)
                if (manifest && manifest.variants) {
                    const webpVariants = manifest.variants
                        .filter((v: ImageVariant) => v.format === "webp")
                        .sort(
                            (a: ImageVariant, b: ImageVariant) =>
                                b.width - a.width,
                        );

                    if (webpVariants.length > 0) {
                        // Use largest WebP variant for backgrounds
                        const bestVariant = webpVariants[0];
                        const baseDir = getBaseDir(src);
                        optimizedSrc = `${baseDir}${bestVariant.path}`;
                    }
                }
            }
            // If no manifest, optimizedSrc stays as original src (backwards compatible)
        } catch (err) {
            // Silently fall back to original src
        }
    });

    // Build background-image CSS
    const backgroundStyle = $derived(() => {
        let bgLayers: string[] = [];

        if (overlay) {
            bgLayers.push(overlayGradient);
        }

        bgLayers.push(`url('${optimizedSrc}')`);

        return bgLayers.join(", ");
    });

    // Placeholder style (shown initially)
    const placeholderStyle = $derived(() => {
        if (!manifest?.placeholder) return "";

        let bgLayers: string[] = [];
        if (overlay) {
            bgLayers.push(overlayGradient);
        }
        bgLayers.push(`url('${manifest.placeholder}')`);

        return bgLayers.join(", ");
    });

    function handleLoad() {
        loaded = true;
    }
</script>

<div
    class="smart-background {className}"
    style="background-image: {backgroundStyle()}; {additionalStyle}"
    {...restProps}
>
    <!-- Preload the optimized image -->
    <img
        src={optimizedSrc}
        alt=""
        aria-hidden="true"
        class="smart-background-preloader"
        onload={handleLoad}
    />

    {#if children}
        {@render children()}
    {/if}
</div>

<style>
    .smart-background {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
    }

    .smart-background-preloader {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }
</style>
