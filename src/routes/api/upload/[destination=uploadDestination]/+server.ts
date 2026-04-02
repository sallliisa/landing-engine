import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { requireAuthenticatedUser } from '$lib/utils/routing';

const [
  privateTempDir,
  publicTempDir
] = [
    path.join(process.cwd(), 'storage', 'temp', 'private'),
    path.join(process.cwd(), 'storage', 'temp', 'public')
  ];

if (!fs.existsSync(privateTempDir)) {
  fs.mkdirSync(privateTempDir, { recursive: true });
}
if (!fs.existsSync(publicTempDir)) {
  fs.mkdirSync(publicTempDir, { recursive: true });
}

export const POST: RequestHandler = async ({ request, url, params, locals }) => {
  try {
    requireAuthenticatedUser(locals);

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const destDir = params.destination === 'private' ? privateTempDir : publicTempDir;
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(destDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    // Just save the raw file - processing happens on save
    fs.writeFileSync(filePath, buffer);

    const baseUrl = url.origin;
    const publicUrl = new URL(`${baseUrl}/storage/temp/${params.destination}/${filename}`);

    return json(publicUrl, { status: 200 });
  } catch (err) {
    console.error('[Upload] Error:', err);
    return json({ message: err }, { status: 500 });
  }
};
