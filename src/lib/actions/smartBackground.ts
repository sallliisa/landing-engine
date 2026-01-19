/**
 * Smart Background Action
 * 
 * A Svelte action that automatically optimizes background images by
 * fetching manifests and replacing URLs with WebP variants.
 * 
 * This is BACKWARDS COMPATIBLE - if no manifest exists, the original URL is used.
 * 
 * Usage:
 * ```svelte
 * <script>
 *   import { smartBg } from '$lib/actions/smartBackground';
 * </script>
 * 
 * <div use:smartBg={imageUrl} style="background-image: url('{imageUrl}')">
 *   Content
 * </div>
 * ```
 * 
 * The action will:
 * 1. Extract the URL from the existing background-image style
 * 2. Fetch the manifest for that URL
 * 3. Replace with the best WebP variant if available
 * 4. Fall back to original if no manifest exists
 */

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

function getBaseDir(imageSrc: string): string {
    try {
        const url = new URL(imageSrc, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const pathname = url.pathname;
        return pathname.substring(0, pathname.lastIndexOf('/') + 1);
    } catch {
        return '';
    }
}

function getManifestUrl(imageSrc: string): string {
    try {
        const url = new URL(imageSrc, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        return `/api/image/manifest${url.pathname}`;
    } catch {
        return '';
    }
}

export function smartBg(node: HTMLElement, imageUrl: string | undefined) {
    if (!imageUrl) return;

    async function optimize() {
        if (!imageUrl) return;

        const manifestUrl = getManifestUrl(imageUrl);
        if (!manifestUrl) return;

        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) return; // No manifest, keep original

            const manifest: ImageManifest = await response.json();

            // Find best WebP variant (largest available)
            const webpVariants = manifest.variants
                .filter((v: ImageVariant) => v.format === 'webp')
                .sort((a: ImageVariant, b: ImageVariant) => b.width - a.width);

            if (webpVariants.length === 0) return;

            const bestVariant = webpVariants[0];
            const baseDir = getBaseDir(imageUrl);
            const optimizedUrl = `${baseDir}${bestVariant.path}`;

            // Replace the URL in the background-image style
            const currentBg = node.style.backgroundImage;
            if (currentBg) {
                // Replace the original URL with optimized URL
                const newBg = currentBg.replace(
                    new RegExp(escapeRegExp(imageUrl), 'g'),
                    optimizedUrl
                );
                node.style.backgroundImage = newBg;
            }
        } catch (err) {
            // Silently fail - keep original URL
        }
    }

    optimize();

    return {
        update(newUrl: string | undefined) {
            imageUrl = newUrl;
            optimize();
        }
    };
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Helper to build background-image style with optional overlay
 * Returns a reactive background-image URL that can be optimized
 */
export function buildBgStyle(
    imageUrl: string | undefined,
    options: {
        overlay?: boolean;
        overlayGradient?: string;
    } = {}
): string {
    if (!imageUrl) return '';

    const {
        overlay = false,
        overlayGradient = 'linear-gradient(rgba(0,0,0,0.16), rgba(0,0,0,0.16)), linear-gradient(to top, rgba(0,0,0,0.33) 0%, rgba(0,0,0,0) 50%)'
    } = options;

    if (overlay) {
        return `${overlayGradient}, url('${imageUrl}')`;
    }

    return `url('${imageUrl}')`;
}
