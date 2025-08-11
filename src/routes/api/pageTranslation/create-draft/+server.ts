import { json } from '@sveltejs/kit';
import { ensureDraftState } from '$lib/utils/page';

/**
 * POST /api/pageTranslation/draft
 * Body: { page_translation_id: string }
 * Returns: { draft: { id, status_code } }
 */
export async function POST({ request }) {
	try {
		const { page_translation_id } = await request.json();
		if (!page_translation_id) {
			return json({ error: 'Missing page_translation_id' }, { status: 400 });
		}
		const { page: draft } = await ensureDraftState(page_translation_id);
		return json({ draft: { id: draft.id, status_code: draft.status_code } });
	} catch (error) {
		console.error('[pageTranslation/draft] Error:', error);
		const message = error instanceof Error ? error.message : 'Internal server error';
		return json({ error: message }, { status: 500 });
	}
} 