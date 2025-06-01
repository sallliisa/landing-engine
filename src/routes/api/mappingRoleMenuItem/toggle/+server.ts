import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { menu_item_id, role_id, active } = await request.json();

		if (!role_id || !menu_item_id) {
			return json({ error: 'menu_item_id and role_id are required' }, { status: 400 });
		}

		await prisma.menuItem.update({
			where: { id: menu_item_id },
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