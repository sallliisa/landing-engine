import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import { lookup } from 'mime-types';
import path from 'path';
import fsSync from 'fs';
import { saveManifest, type ProcessedImage, type ImageVariant, deleteManifestAndVariants, isProcessableImage, processImage } from './image-processing';

const [
  privateStorageDir,
  publicStorageDir
] = [
    path.join(process.cwd(), 'storage', 'private'),
    path.join(process.cwd(), 'storage', 'public')
  ];

if (!fsSync.existsSync(privateStorageDir)) {
  fsSync.mkdirSync(privateStorageDir, { recursive: true });
}
if (!fsSync.existsSync(publicStorageDir)) {
  fsSync.mkdirSync(publicStorageDir, { recursive: true });
}

export async function saveFileFromTemp(url: string): Promise<string> {
  console.log('[Filestorage] Moving file:', url);
  const urlObject = new URL(url);

  // Get the relative path from the URL and decode it
  const relativePath = decodeURIComponent(urlObject.pathname.substring(1));
  const tempPath = path.resolve(process.cwd(), relativePath);

  // Extract the destination directory (public/private) from the path
  const pathSegments = relativePath.split(/[\\/]+/); // Handle both / and \ as separators
  const storageIndex = pathSegments.indexOf('storage');
  if (storageIndex === -1 || storageIndex >= pathSegments.length - 2) {
    throw new Error('Invalid temp file path: storage directory structure not found');
  }

  // In the path storage/temp/public/..., we want to get 'public'
  const destination = pathSegments[storageIndex + 2];
  if (destination !== 'public' && destination !== 'private') {
    throw new Error(`Invalid destination directory: ${destination}. Must be 'public' or 'private'`);
  }

  const destDir = path.join(process.cwd(), 'storage', destination);
  const filename = path.basename(tempPath);
  const destPath = path.join(destDir, filename);

  try {
    // Ensure temp file exists
    await fs.access(tempPath);

    // Ensure destination directory exists
    await fs.mkdir(path.dirname(destPath), { recursive: true });

    // Read the file from temp
    const buffer = await fs.readFile(tempPath);

    // Determine MIME type
    const ext = path.extname(filename).toLowerCase();
    const mimeType = lookup(ext) || 'application/octet-stream';

    // Check if this is a processable image
    if (isProcessableImage(mimeType)) {
      try {
        // Process the image (compress, generate variants) directly to destination
        const processed = await processImage(buffer, filename, destDir);

        // Create manifest in database with the permanent path
        const permanentPath = `/storage/${destination}/${filename}`;
        await saveManifest(permanentPath, processed);

        console.log(`[Filestorage] Processed and saved ${filename}: ${processed.width}x${processed.height}, ${processed.variants.length} variants`);

        // Delete the temp file
        await fs.unlink(tempPath);
      } catch (err) {
        console.error('[Filestorage] Failed to process image, saving original:', err);
        // Fallback: just move the original file
        await fs.rename(tempPath, destPath);
      }
    } else {
      // Non-image files: just move them
      await fs.rename(tempPath, destPath);
      console.log(`[Filestorage] Moved file (no processing): ${filename}`);
    }

    // Return the new URL for the file
    return new URL(`${urlObject.origin}/storage/${destination}/${filename}`).toString();
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`Temporary file not found: ${tempPath}`);
    }
    throw new Error(`Failed to move file: ${err.message}`);
  }
}

/**
 * Resolves a file path from a URL, handling both local files and HTTP/HTTPS URLs
 */
function resolveFilePath(urlOrPath: string, baseDir: string = process.cwd()): string {
  try {
    // If it's a URL, parse it and get the pathname
    if (urlOrPath.startsWith('http')) {
      const url = new URL(urlOrPath);
      const pathname = decodeURIComponent(url.pathname);
      // Remove leading slash and resolve against base directory
      return path.resolve(baseDir, pathname.startsWith('/') ? pathname.substring(1) : pathname);
    }
    // If it's already a filesystem path, just resolve it
    return path.resolve(baseDir, urlOrPath);
  } catch (err) {
    throw new Error(`Invalid file path or URL: ${urlOrPath}`);
  }
}

export async function readPublicStorageFile(url: string): Promise<Buffer> {
  try {
    const filePath = resolveFilePath(url, path.join(process.cwd(), 'static'));
    await fs.access(filePath);
    return fs.readFile(filePath);
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`File not found: ${url}`);
    }
    throw new Error(`Failed to read file: ${err.message}`);
  }
}

export async function deleteFile(url: string): Promise<string> {
  try {
    const filePath = resolveFilePath(url);
    await fs.access(filePath);
    await fs.unlink(filePath);

    // Also delete variants and manifest if this is an image
    try {
      const urlPath = decodeURIComponent(new URL(url, 'http://localhost').pathname);
      await deleteManifestAndVariants(urlPath, process.cwd());
    } catch (err) {
      // Silently ignore if no manifest/variants exist
      console.log('[deleteFile] No manifest to delete for:', url);
    }

    return `File deleted successfully: ${filePath}`;
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`File not found: ${url}`);
    }
    throw new Error(`Failed to delete file: ${err.message}`);
  }
}

export async function serveFile(
  filename: string,
  storagePath: Array<'temp' | 'private' | 'public'>,
  options: { baseDir?: string } = {}
): Promise<Response> {
  try {
    const baseDir = options.baseDir || process.cwd();
    const filePath = path.join(baseDir, 'storage', ...storagePath, filename);
    const resolvedPath = path.resolve(filePath);

    // Security check: ensure the path is within the intended directory
    if (!resolvedPath.startsWith(path.resolve(baseDir, 'storage'))) {
      throw new Error('Access denied: Invalid file path');
    }

    const file = await fs.readFile(resolvedPath);
    const mimeType = lookup(path.extname(filename).toLowerCase()) || 'application/octet-stream';

    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw error(404, 'File not found');
    }
    console.error('Error serving file:', err);
    throw error(500, 'Internal server error');
  }
}