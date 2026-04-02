import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getManifest } from '$lib/utils/image-processing';

/**
 * GET /api/image/manifest/[...path]
 * 
 * Returns the manifest for an image at the given path.
 * Path should be the storage path, e.g., /storage/public/1234-image.jpg
 */
export const GET: RequestHandler = async ({ params }) => {
    const imagePath = `/${params.path}`;

    try {
        const manifest = await getManifest(imagePath);

        if (!manifest) {
            return json({ error: 'Manifest not found' }, { status: 404 });
        }

        return json({
            width: manifest.width,
            height: manifest.height,
            aspectRatio: manifest.aspect_ratio,
            format: manifest.format,
            placeholder: manifest.placeholder,
            variants: manifest.variants,
        }, {
            headers: {
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (err) {
        console.error('[Manifest] Error fetching manifest:', err);
        return json({ error: 'Failed to fetch manifest' }, { status: 500 });
    }
};
