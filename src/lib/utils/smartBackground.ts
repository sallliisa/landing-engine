/**
 * Smart Background Image Utilities
 * 
 * Provides helpers for using optimized images as CSS backgrounds.
 */

import { getManifest, type ImageVariant } from './image-processing';

export interface BackgroundImageOptions {
    /** Preferred width for the image (picks closest variant) */
    width?: number;
    /** Fallback color while loading */
    fallbackColor?: string;
}

export interface SmartBackgroundResult {
    /** CSS for the background-image property */
    style: string;
    /** The placeholder image (base64) */
    placeholder: string | null;
    /** Aspect ratio for sizing */
    aspectRatio: number | null;
}

/**
 * Gets optimized background image data for a given image URL.
 * 
 * Usage in Svelte:
 * ```svelte
 * <script>
 *   import { getSmartBackground } from '$lib/utils/smartBackground';
 *   let bgData = $state<SmartBackgroundResult | null>(null);
 *   
 *   onMount(async () => {
 *     bgData = await getSmartBackground(imageUrl, { width: 1024 });
 *   });
 * </script>
 * 
 * <div style="background-image: {bgData?.style || `url('${imageUrl}')`}"></div>
 * ```
 */
export async function getSmartBackground(
    imageUrl: string,
    options: BackgroundImageOptions = {}
): Promise<SmartBackgroundResult> {
    try {
        // Extract the storage path from the URL
        const url = new URL(imageUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const imagePath = url.pathname;

        const manifest = await getManifest(imagePath);

        if (!manifest) {
            return {
                style: `url('${imageUrl}')`,
                placeholder: null,
                aspectRatio: null,
            };
        }

        const variants = manifest.variants as unknown as ImageVariant[];
        const preferredWidth = options.width || 1024;

        // Find the best WebP variant for the requested width
        const webpVariants = variants
            .filter(v => v.format === 'webp')
            .sort((a, b) => a.width - b.width);

        // Pick the smallest variant that's >= preferred width, or the largest available
        let bestVariant = webpVariants.find(v => v.width >= preferredWidth);
        if (!bestVariant && webpVariants.length > 0) {
            bestVariant = webpVariants[webpVariants.length - 1];
        }

        // Build the base directory
        const baseDir = imagePath.substring(0, imagePath.lastIndexOf('/') + 1);

        // Use image-set() for modern browsers, with fallback
        const variantUrl = bestVariant ? `${baseDir}${bestVariant.path}` : imageUrl;

        // Modern CSS with fallback
        const style = bestVariant
            ? `url('${variantUrl}')`
            : `url('${imageUrl}')`;

        return {
            style,
            placeholder: manifest.placeholder,
            aspectRatio: manifest.aspect_ratio,
        };
    } catch (err) {
        console.error('[SmartBackground] Error:', err);
        return {
            style: `url('${imageUrl}')`,
            placeholder: null,
            aspectRatio: null,
        };
    }
}

/**
 * Builds a srcset string for background images.
 * Useful when you need to manually construct image-set().
 */
export async function getBackgroundSrcset(imageUrl: string): Promise<string | null> {
    try {
        const url = new URL(imageUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
        const imagePath = url.pathname;

        const manifest = await getManifest(imagePath);

        if (!manifest) {
            return null;
        }

        const variants = manifest.variants as unknown as ImageVariant[];
        const baseDir = imagePath.substring(0, imagePath.lastIndexOf('/') + 1);

        // Build srcset for WebP variants
        const webpSrcset = variants
            .filter(v => v.format === 'webp')
            .sort((a, b) => a.width - b.width)
            .map(v => `url('${baseDir}${v.path}') ${v.width}w`)
            .join(', ');

        return webpSrcset || null;
    } catch (err) {
        return null;
    }
}
