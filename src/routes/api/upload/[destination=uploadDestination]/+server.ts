// import { json } from '@sveltejs/kit';
// import fs from 'fs';
// import path from 'path';

// const [
//   privateTempDir,
//   publicTempDir
// ] = [
//   path.join(process.cwd(), 'storage', 'temp', 'private'),
//   path.join(process.cwd(), 'storage', 'temp', 'public')
// ]

// if (!fs.existsSync(privateTempDir)) {
//   fs.mkdirSync(privateTempDir, { recursive: true });
// }
// if (!fs.existsSync(publicTempDir)) {
//   fs.mkdirSync(publicTempDir, { recursive: true });
// }

// export const POST = async ({ request, url, params }) => {
//   try {
//     const contentType = request.headers.get('content-type');
//     if (!contentType?.includes('multipart/form-data')) {
//       return new Response(JSON.stringify({ error: 'Invalid content type' }), { status: 400 });
//     }

//     const formData = await request.formData();
//     const file = formData.get('file') as File;

//     if (!file) {
//       return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
//     }

//     const filename = `${Date.now()}-${file.name}`;
//     const filePath = path.join(params.destination === 'private' ? privateTempDir : publicTempDir, filename);

//     const buffer = Buffer.from(await file.arrayBuffer());
//     fs.writeFileSync(filePath, buffer);

//     // const baseUrl = request.headers.get('X-Forwarded-Proto') + '://' + request.headers.get('X-Forwarded-Host');
//     const baseUrl = url.origin;

//     const publicUrl = new URL(`${baseUrl}/storage/temp/${params.destination}/${filename}`);

//     return json(publicUrl, {status: 200})
//   } catch (err) {
//     return json({message: err}, {status: 500})
//   }
// };

// import { pipeline } from 'stream/promises';
// import { json } from '@sveltejs/kit';
// import fs from 'fs';
// import path from 'path';
// import Busboy from 'busboy';

// const [
//   privateTempDir,
//   publicTempDir
// ] = [
//   path.join(process.cwd(), 'storage', 'temp', 'private'),
//   path.join(process.cwd(), 'storage', 'temp', 'public')
// ];

// if (!fs.existsSync(privateTempDir)) fs.mkdirSync(privateTempDir, { recursive: true });
// if (!fs.existsSync(publicTempDir)) fs.mkdirSync(publicTempDir, { recursive: true });

// export const POST = async ({ request, url, params }) => {
//   const contentType = request.headers.get('content-type');
//   if (!contentType?.startsWith('multipart/form-data')) {
//     return json({ error: 'Invalid content type' }, { status: 400 });
//   }

//   const destinationDir = params.destination === 'private' ? privateTempDir : publicTempDir;

//   return new Promise((resolve, reject) => {
//     const busboy = Busboy({ headers: Object.fromEntries(request.headers) });

//     let uploadUrl: URL | null = null;

//     busboy.on('file', async (fieldname, file, filename) => {
//       const fullFilename = `${Date.now()}-${filename}`;
//       const filePath = path.join(destinationDir, fullFilename);
//       const writeStream = fs.createWriteStream(filePath);

//       try {
//         await pipeline(file, writeStream);

//         const baseUrl = url.origin;
//         uploadUrl = new URL(`${baseUrl}/storage/temp/${params.destination}/${fullFilename}`);
//       } catch (err) {
//         return reject(json({ message: 'Failed to write file' }, { status: 500 }));
//       }
//     });

//     busboy.on('finish', () => {
//       if (uploadUrl) {
//         resolve(json(uploadUrl, { status: 200 }));
//       } else {
//         resolve(json({ error: 'No file uploaded' }, { status: 400 }));
//       }
//     });

//     request.body?.pipe(busboy);
//   });
// };

import { json } from '@sveltejs/kit';
import Busboy from 'busboy';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicTempDir = path.join(process.cwd(), 'static', 'storage', 'temp', 'public');
const privateTempDir = path.join(process.cwd(), 'static', 'storage', 'temp', 'private');

// Ensure directories exist
[publicTempDir, privateTempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export async function POST({ request, url, params }) {
  const contentType = request.headers.get('content-type');
  
  if (!contentType?.startsWith('multipart/form-data')) {
    return json({ error: 'Invalid content type' }, { status: 400 });
  }

  const destinationDir = params.destination === 'private' ? privateTempDir : publicTempDir;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fullFilename = `${Date.now()}-${file.name}`;
    const filePath = path.join(destinationDir, fullFilename);
    const arrayBuffer = await file.arrayBuffer();
    
    await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));

    const baseUrl = url.origin;
    const uploadUrl = new URL(`${baseUrl}/storage/temp/${params.destination}/${fullFilename}`);
    
    return json(uploadUrl, { status: 200 });
  } catch (err) {
    console.error('Upload error:', err);
    return json({ error: 'Failed to process upload' }, { status: 500 });
  }
}