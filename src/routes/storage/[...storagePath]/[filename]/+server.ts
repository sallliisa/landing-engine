import { serveFile } from '$lib/utils/filestorage.js';

export async function GET({ params }) {
  try {
    return await serveFile(params.filename, params.storagePath.split('/') as any)
  } catch (err: any) {
    throw err
  }
}