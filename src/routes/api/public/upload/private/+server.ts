import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const privateTempDir = path.join(process.cwd(), 'storage', 'temp', 'private')

if (!fs.existsSync(privateTempDir)) {
  fs.mkdirSync(privateTempDir, { recursive: true });
}

export const POST = async ({ request, url }) => {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(privateTempDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // const baseUrl = request.headers.get('X-Forwarded-Proto') + '://' + request.headers.get('X-Forwarded-Host');
    const baseUrl = url.origin;

    const publicUrl = new URL(`${baseUrl}/storage/temp/private/${filename}`);
    return json(publicUrl, {status: 200})
  } catch (err) {
    return json({message: err}, {status: 500})
  }
};
