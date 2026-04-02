# Image Optimization & Progressive Loading Plan

## 0) Goals and Non‑Goals
- **Goal:** Improve perceived and actual image loading performance.
- **Goal:** Fully managed progressive image loading without manual LOD management.
- **Goal:** Maintain excellent DX: developers should pass a single source URL or file reference and get optimized outputs automatically.
- **Non‑Goal:** Rewrite unrelated media handling or storage infrastructure.
- **Non‑Goal:** Introduce a cloud dependency unless explicitly chosen.

---

## 1) Current State Review (Discovery Phase)
1. **Inventory current image upload endpoints**
   - Identify all upload entry points:
     - `/api/public/upload/private`
     - `/api/upload/{private|public}`
   - Confirm temp directory usage and URL patterns.
2. **Inspect the temp → permanent flow**
   - Verify `processFileUrls` flow and how URLs are updated.
   - Identify where the file moves are triggered.
3. **Locate image rendering usages**
   - Survey key Svelte components:
     - `src/routes/(landing)/...`
     - `ImagePreview.svelte`
     - `ArticleItem.svelte`
   - Confirm how images are used (img tag vs CSS background).
4. **Map file serving**
   - Understand `serveFile` and caching logic.
   - Confirm any range/streaming behavior.

Deliverable: A clear diagram of the current upload → persist → render path.

---

## 2) Decide Image Optimization Strategy (System Design)
1. **Compression on upload**
   - Define which formats to output (e.g., original + WebP + AVIF).
   - Define default quality and max dimensions.
   - Decide whether original is retained as-is, or re-encoded.
2. **Progressive/Responsive loading**
   - Define levels of detail (e.g., 32px, 64px, 256px, 1024px).
   - Decide on placeholder method:
     - Blurhash
     - Base64 tiny image
     - Dominant color
3. **Define “fully managed DX”**
   - End developers should:
     - Provide a single URL or a single file.
     - Use a single component like `<SmartImage src="...">`.
     - Avoid manual LOD or format handling.
4. **Decide how to store variants**
   - Option A: Derivatives stored alongside original with naming conventions.
   - Option B: Derivatives stored in a parallel directory structure.
   - Option C: Derivatives generated on-demand and cached.

Deliverable: A written spec for formats, sizes, and developer interface.

---

## 3) Implement Server‑Side Derivative Generation
1. **Extend upload pipeline**
   - When file is uploaded to temp:
     - Validate MIME types.
     - Generate optimized variants in temp.
     - Store original + variants.
2. **Extend persist step (temp → permanent)**
   - Move entire bundle of variants.
   - Update URL references to point to canonical entry (not individual variants).
3. **Define metadata storage**
   - Create a manifest (JSON) with:
     - Original size
     - Variant sizes
     - Format availability
     - Placeholder data
   - Store manifest with the image.
4. **Naming convention and path rules**
   - Decide naming scheme:
     - e.g. `filename__w256.webp`
     - e.g. `filename__original.jpg`
   - Ensure `serveFile` protects against path traversal.

Deliverable: server-side pipeline generating and persisting all derivatives + manifest.

---

## 4) Add Image Serving Strategy
1. **Introduce a “smart” image endpoint**
   - One URL for a given image.
   - Server resolves best format based on:
     - `Accept` header (AVIF > WebP > JPEG).
     - `w` query param if provided.
2. **Serve fallback**
   - If client doesn’t support modern formats, serve original or JPEG.
3. **Cache headers**
   - Set long cache (immutable) for derivative assets.
   - Consider shorter cache for manifest if it can change.
4. **Support `srcset`**
   - Provide variant URL pattern so frontend can generate `srcset`.

Deliverable: consistent endpoint behavior + cache strategy.

---

## 5) Build DX‑First Client Components
1. **Create `<SmartImage>` component**
   - Accepts:
     - `src` (base URL only)
     - `alt`
     - `sizes` or layout hints
   - Reads manifest and builds `srcset`.
   - Uses `<picture>` when formats available.
   - Auto enables `loading="lazy"` and `decoding="async"`.
2. **Progressive loading behavior**
   - Render placeholder (blur or tiny base64).
   - Swap to optimized image on load.
3. **Background image support**
   - Create helper to set CSS `image-set()` or preload + swap.
4. **Ensure fallback for legacy rendering**
   - If manifest missing, default to `img src`.

Deliverable: drop‑in component that hides all LOD logic.

---

## 6) Update Rendering Sites
1. **Swap manual `<img>` usages**
   - Replace with `<SmartImage>`.
2. **Swap CSS background image patterns**
   - Use the new background helper or component.
3. **Validate in landing sections**
   - Ensure no regressions in layout.

Deliverable: integrated optimized components across usage points.

---

## 7) Edge Cases & Migration
1. **Handle existing images**
   - Decide whether to:
     - Backfill derivatives on access.
     - Run a batch job to generate all derivatives.
2. **Handle user uploads of non-image files**
   - Keep existing file handling intact.
3. **Handle very large images**
   - Define max dimension and size safety checks.
4. **Error handling**
   - If derivative generation fails:
     - Log and fallback to original.

Deliverable: migration strategy with safe fallbacks.

---

## 8) Quality and Performance Validation
1. **Functional checks**
   - Upload a large image.
   - Confirm derivatives exist.
   - Verify manifest output.
   - Confirm `<SmartImage>` renders correct `srcset`.
2. **Performance checks**
   - Lighthouse or WebPageTest before vs after.
   - Validate LCP improvements.
3. **Compatibility checks**
   - Safari, Chrome, Firefox, Mobile.
4. **Cache correctness**
   - Ensure cached derivatives remain valid.

Deliverable: documented test results with before/after comparison.

---

## 9) Optional Enhancements
- Add on-demand derivative generation for rarely used sizes.
- Add a dashboard to view image statistics.
- Integrate with CDN for edge resizing if desired.

---

## 10) Documentation
- Update internal docs to describe:
  - Upload pipeline
  - Variant naming
  - `<SmartImage>` usage
  - Migration strategy
