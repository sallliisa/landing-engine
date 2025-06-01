import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { role_id, permission_code, active } = await request.json();

		if (!role_id || !permission_code) {
			return json({ error: 'role_id and permission_code are required' }, { status: 400 });
		}

		await prisma.role.update({
			where: { id: role_id },
			data: {
				permissions: active ? { connect: { code: permission_code } } : { disconnect: { code: permission_code } }
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to update permission:', error);
		return json({ error: 'Failed to update permission' }, { status: 500 });
	}
}
