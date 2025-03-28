import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import { lookup } from 'mime-types';
import path from 'path';
import fsSync from 'fs';

const [
  privateStorageDir,
  publicStorageDir
] = [
  path.join(process.cwd(), 'storage', 'private'),
  path.join(process.cwd(), 'storage', 'public')
]

if (!fsSync.existsSync(privateStorageDir)) {
  fsSync.mkdirSync(privateStorageDir, { recursive: true });
}
if (!fsSync.existsSync(publicStorageDir)) {
  fsSync.mkdirSync(publicStorageDir, { recursive: true });
}

export async function saveFileFromTemp(url: string): Promise<string> {
  const urlObject = new URL(url);
  const tempPath = path.resolve(process.cwd(), decodeURI(urlObject.pathname.substring(1)));
  
  // Determine destination directory based on parameter
  const destination = tempPath.split('\\').slice(-2)[0]; // 'private' or 'public'
  const destDir = path.join(process.cwd(), 'storage', destination);
  const filename = path.basename(tempPath);
  const destPath = path.resolve(destDir, filename);

  try {
    // Ensure temp file exists
    await fs.access(tempPath);
    
    // Ensure destination directory exists
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    
    // Move the file
    await fs.rename(tempPath, destPath);
    
    // Return the new URL for the file
    return new URL(`${urlObject.origin}/storage/${destination}/${filename}`).toString()
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`Temporary file not found: ${tempPath}`);
    }
    throw new Error(`Failed to move file: ${err.message}`);
  }
}

export async function readPublicStorageFile(url: string): Promise<Buffer> {
  const urlObject = new URL(url)
  const filePath = path.resolve('static', decodeURI(urlObject.pathname.substring(1)));

  try {
    await fs.access(filePath)
  } catch (err) {
    throw Error(`File not found`)
  }

  return fs.readFile(filePath)
}

export async function deleteFile(url: string): Promise<string> {
  const urlObject = new URL(url);
  const filePath = path.resolve('static', decodeURI(urlObject.pathname.substring(1)));
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return `File deleted successfully: ${filePath}`;
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to delete file: ${err}`);
  }
}

export async function serveFile(filename: string, storagePath: Array<'temp' | 'private' | 'public'>): Promise<Response> {
  try {
    const filePath = path.join(path.join(process.cwd(), 'storage', ...storagePath), filename);
    const file = await fs.readFile(filePath);

    return new Response(file, {
      headers: {
        'Content-Type': lookup(path.extname(filename).toLowerCase()) || 'application/octet-stream',
      }
    });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw error(404, 'File not found');
    }
    throw error(500, 'Internal server error');
  }
}