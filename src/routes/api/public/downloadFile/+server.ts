import { readPublicStorageFile } from "$lib/utils/filestorage";

export async function POST({ request }) {
  try {
    const body = await request.json()
    const fileBuffer = await readPublicStorageFile(body.url);

    const fileName = decodeURIComponent(body.url.split('/').pop() ?? 'file');

    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
    };

    return new Response(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response('File not found', {
      status: 404,
    });
  }
}
