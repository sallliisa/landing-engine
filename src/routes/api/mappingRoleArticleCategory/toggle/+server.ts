import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { article_category_id, role_id, active } = await request.json();

		if (!role_id || !article_category_id) {
			return json({ error: 'article_category_id and role_id are required' }, { status: 400 });
		}

		await prisma.articleCategory.update({
			where: { id: article_category_id },
			data: {
				allowedRoles: active ? { connect: { id: role_id } } : { disconnect: { id: role_id } }
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to update form type role access control:', error);
		return json({ error: 'Failed to update form type role access control' }, { status: 500 });
	}
}