import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { role_id, permission_id, active } = await request.json();

		if (!role_id || !permission_id) {
			return json({ error: 'role_id and permission_id are required' }, { status: 400 });
		}

		await prisma.role.update({
			where: { id: role_id },
			data: {
				permissions: active ? { connect: { id: permission_id } } : { disconnect: { id: permission_id } }
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to update permission:', error);
		return json({ error: 'Failed to update permission' }, { status: 500 });
	}
}
