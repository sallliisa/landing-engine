/**
 * Image Processing Utilities
 * 
 * Handles image compression, variant generation, and manifest creation
 * for the progressive image loading system.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
    // Maximum dimension for the original (will be resized if larger)
    maxDimension: 2048,
    // Quality for JPEG/WebP output (0-100)
    quality: 80,
    // Variant widths to generate: tiny placeholder, medium, and max
    variantWidths: [32, 512], // max is handled separately
    // Placeholder size for base64 encoding
    placeholderWidth: 32,
};

// MIME types that should be processed
const PROCESSABLE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/tiff',
]);

// MIME types that should be passed through as-is
const PASSTHROUGH_MIME_TYPES = new Set([
    'image/svg+xml',
    'image/gif', // GIFs often have animations
    'video/mp4',
    'video/webm',
    'video/quicktime',
]);

export interface ImageVariant {
    width: number;
    format: string;
    path: string;
    size: number;
}

export interface ProcessedImage {
    originalPath: string;
    width: number;
    height: number;
    aspectRatio: number;
    format: string;
    size: number;
    placeholder: string;
    variants: ImageVariant[];
}

/**
 * Determines if a file should be processed for optimization
 */
export function isProcessableImage(mimeType: string): boolean {
    return PROCESSABLE_MIME_TYPES.has(mimeType.toLowerCase());
}

/**
 * Determines if a file should be passed through without processing
 */
export function isPassthroughFile(mimeType: string): boolean {
    return PASSTHROUGH_MIME_TYPES.has(mimeType.toLowerCase());
}

/**
 * Gets the format string from a MIME type
 */
function getFormatFromMime(mimeType: string): string {
    const mimeToFormat: Record<string, string> = {
        'image/jpeg': 'jpeg',
        'image/jpg': 'jpeg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/avif': 'avif',
        'image/tiff': 'tiff',
    };
    return mimeToFormat[mimeType.toLowerCase()] || 'jpeg';
}

/**
 * Generates a base64 placeholder image (tiny, blurred)
 */
async function generatePlaceholder(sharpInstance: sharp.Sharp): Promise<string> {
    const placeholderBuffer = await sharpInstance
        .clone()
        .resize(CONFIG.placeholderWidth, null, { fit: 'inside' })
        .blur(2)
        .webp({ quality: 20 })
        .toBuffer();

    return `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
}

/**
 * Generates image variants at specified widths
 */
async function generateVariants(
    buffer: Buffer,
    baseFilename: string,
    destDir: string,
    originalWidth: number
): Promise<ImageVariant[]> {
    const variants: ImageVariant[] = [];
    const baseName = path.parse(baseFilename).name;

    // Determine which widths to generate (skip widths larger than original)
    const widthsToGenerate = CONFIG.variantWidths.filter(w => w < originalWidth);

    // Add max width variant if original is larger than smallest variant
    if (originalWidth > CONFIG.variantWidths[0]) {
        widthsToGenerate.push(Math.min(originalWidth, CONFIG.maxDimension));
    }

    for (const width of widthsToGenerate) {
        // Generate WebP variant
        const webpFilename = `${baseName}__w${width}.webp`;
        const webpPath = path.join(destDir, webpFilename);

        const webpBuffer = await sharp(buffer)
            .resize(width, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: CONFIG.quality })
            .toBuffer();

        await fs.writeFile(webpPath, webpBuffer);

        variants.push({
            width,
            format: 'webp',
            path: webpFilename,
            size: webpBuffer.length,
        });
    }

    return variants;
}

/**
 * Main image processing function
 * 
 * Takes a buffer and filename, generates optimized variants, and returns metadata.
 * Does NOT save the manifest - that's handled separately after persist.
 */
export async function processImage(
    buffer: Buffer,
    filename: string,
    destDir: string
): Promise<ProcessedImage> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
        throw new Error('Unable to read image dimensions');
    }

    let processedBuffer = buffer;
    let { width, height } = metadata;
    const format = metadata.format || 'jpeg';

    // Resize if larger than max dimension
    if (width > CONFIG.maxDimension || height > CONFIG.maxDimension) {
        processedBuffer = await sharp(buffer)
            .resize(CONFIG.maxDimension, CONFIG.maxDimension, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toBuffer();

        const resizedMeta = await sharp(processedBuffer).metadata();
        width = resizedMeta.width!;
        height = resizedMeta.height!;
    }

    // Compress the original format
    const compressedBuffer = await sharp(processedBuffer)
        .jpeg({ quality: CONFIG.quality, mozjpeg: true })
        .toBuffer();

    // Use original if compression made it larger (e.g., for already optimized images)
    const finalBuffer = compressedBuffer.length < processedBuffer.length
        ? compressedBuffer
        : processedBuffer;

    // Save the processed original
    const originalPath = path.join(destDir, filename);
    await fs.writeFile(originalPath, finalBuffer);

    // Generate placeholder
    const placeholder = await generatePlaceholder(sharp(finalBuffer));

    // Generate variants
    const variants = await generateVariants(finalBuffer, filename, destDir, width);

    return {
        originalPath: filename,
        width,
        height,
        aspectRatio: width / height,
        format,
        size: finalBuffer.length,
        placeholder,
        variants,
    };
}

/**
 * Saves the image manifest to the database
 */
export async function saveManifest(
    originalPath: string,
    processedImage: ProcessedImage
): Promise<void> {
    await prisma.imageManifest.upsert({
        where: { original_path: originalPath },
        create: {
            original_path: originalPath,
            width: processedImage.width,
            height: processedImage.height,
            aspect_ratio: processedImage.aspectRatio,
            format: processedImage.format,
            size: processedImage.size,
            placeholder: processedImage.placeholder,
            variants: processedImage.variants as unknown as object,
        },
        update: {
            width: processedImage.width,
            height: processedImage.height,
            aspect_ratio: processedImage.aspectRatio,
            format: processedImage.format,
            size: processedImage.size,
            placeholder: processedImage.placeholder,
            variants: processedImage.variants as unknown as object,
        },
    });
}

/**
 * Gets manifest for an image from the database
 */
export async function getManifest(originalPath: string) {
    return prisma.imageManifest.findUnique({
        where: { original_path: originalPath },
    });
}

/**
 * Deletes manifest and all associated variant files
 */
export async function deleteManifestAndVariants(
    originalPath: string,
    storageDir: string
): Promise<void> {
    console.log('[deleteManifestAndVariants] Looking for manifest:', originalPath);
    const manifest = await getManifest(originalPath);
    console.log('[deleteManifestAndVariants] Manifest found:', !!manifest);

    if (manifest) {
        // Delete variant files
        const variants = manifest.variants as unknown as ImageVariant[];
        const baseDir = path.dirname(path.join(storageDir, originalPath));
        console.log('[deleteManifestAndVariants] Base dir for variants:', baseDir);

        for (const variant of variants) {
            const variantPath = path.join(baseDir, variant.path);
            console.log('[deleteManifestAndVariants] Deleting variant:', variantPath);
            try {
                await fs.unlink(variantPath);
                console.log('[deleteManifestAndVariants] Deleted:', variantPath);
            } catch (err) {
                console.log('[deleteManifestAndVariants] Failed to delete:', variantPath, err);
            }
        }

        // Delete manifest from database
        await prisma.imageManifest.delete({
            where: { original_path: originalPath },
        });
        console.log('[deleteManifestAndVariants] Manifest deleted from DB');
    } else {
        console.log('[deleteManifestAndVariants] No manifest found for:', originalPath);
    }
}

/**
 * Moves variant files from temp to permanent storage
 */
export async function moveVariants(
    tempDir: string,
    destDir: string,
    variants: ImageVariant[]
): Promise<void> {
    for (const variant of variants) {
        const sourcePath = path.join(tempDir, variant.path);
        const destPath = path.join(destDir, variant.path);

        try {
            if (fsSync.existsSync(sourcePath)) {
                await fs.rename(sourcePath, destPath);
            }
        } catch (err) {
            console.error(`Failed to move variant ${variant.path}:`, err);
        }
    }
}
