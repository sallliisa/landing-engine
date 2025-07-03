import { success } from '$lib/utils/response.js';
import { json } from '@sveltejs/kit';
import { copySectionGroupContent } from '$lib/utils/section.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
	const { source_id, destination_id } = await request.json();

	if (!source_id || !destination_id) {
		return json({ error: 'source_id and destination_id are required' }, { status: 400 });
	}

	await copySectionGroupContent(source_id, destination_id);

	return success({ success: true });
};