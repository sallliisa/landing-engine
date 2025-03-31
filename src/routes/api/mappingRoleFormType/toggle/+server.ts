import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { form_type_id, role_id, active } = await request.json();

		if (!role_id || !form_type_id) {
			return json({ error: 'form_type_id and role_id are required' }, { status: 400 });
		}

		await prisma.formType.update({
			where: { id: form_type_id },
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