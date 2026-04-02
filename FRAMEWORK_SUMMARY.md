# HKR Landing V2 framework overview

## High-level
- SvelteKit app with dynamic landing routes under `src/routes/(landing)` and API endpoints under `src/routes/api`.
- Media is stored on disk under `storage/` (temp, private, public). Static assets live under `static/`.
- Image and file URLs are stored as absolute URLs (same-origin), then rendered directly in Svelte components.

## Image/file upload lifecycle
1) **Upload (temp)**
   - Client components like `src/lib/app/components/input/ImageInput.svelte` post `multipart/form-data` to `/api/public/upload/private` (or `/api/upload/{private|public}`).
   - Server endpoints write the file to `storage/temp/(private|public)` and return a temp URL like:
     - `https://<host>/storage/temp/private/<timestamp>-<filename>`
     - `https://<host>/storage/temp/public/<timestamp>-<filename>`
   - Key endpoints:
     - `src/routes/api/public/upload/private/+server.ts`
     - `src/routes/api/upload/[destination=uploadDestination]/+server.ts`

2) **Persist (move from temp to permanent)**
   - When data is created/updated via the generic model endpoints, the server scans the payload for file URLs and moves temp files into permanent storage.
   - `processFileUrls` in `src/lib/utils/common.ts` detects same-origin `/storage/...` URLs, and if they match `/storage/temp/(public|private)/...`, it calls `saveFileFromTemp`.
   - `saveFileFromTemp` in `src/lib/utils/filestorage.ts` moves the file into `storage/public` or `storage/private` and returns a new URL:
     - `https://<host>/storage/public/<filename>`
     - `https://<host>/storage/private/<filename>`
   - Key endpoints:
     - `src/routes/api/[model]/create/+server.ts`
     - `src/routes/api/[model]/update/+server.ts`

3) **Delete (cleanup)**
   - On delete/update, file URLs can be removed via `deleteFile` in `src/lib/utils/filestorage.ts`.
   - `src/routes/api/[model]/delete/+server.ts` uses `processFileUrls` with `onFile` to clean up stored files.

## Serving files and images
- Any URL under `/storage/...` is served by a SvelteKit route:
  - `src/routes/storage/[...storagePath]/[filename]/+server.ts`
  - This calls `serveFile` which reads from `storage/<path...>` and returns the file with a long-lived cache header.
- Direct file download uses `readPublicStorageFile`:
  - `src/routes/api/public/downloadFile/+server.ts`
  - `readPublicStorageFile` resolves against `static/` and streams the file.

## URL validation and safety
- `src/lib/utils/common.ts` ensures file URLs are same-origin (using `PUBLIC_APP_URL` if set) and match `/storage/...`.
- `isValidTempFileURL` only accepts `/storage/temp/(public|private)/...`.
- `serveFile` enforces that resolved file paths stay within the `storage/` directory.

## Where images are rendered
- Many landing sections bind `media`, `thumbnail`, or `background_image` directly into `<img src=...>` or `background-image: url(...)`.
- Example sections:
  - `src/routes/(landing)/[...path]/sections/*/SectionComponent.svelte`
  - `src/lib/app/components/ui/ImagePreview.svelte`
  - `src/lib/app/components/app/ArticleItem.svelte`
- Static assets (logos, flags, pannellum) come from `static/assets/...` and are referenced with `/assets/...` URLs.
