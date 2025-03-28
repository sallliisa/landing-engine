import prisma from '$lib/utils/prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { token } = await request.json();

  try {
    await prisma.session.delete({
      where: { token },
    });

    return json({ message: 'Logged out' }, { status: 200 });
  } catch (error) {
    return json({ error: 'Logout failed' }, { status: 500 });
  }
}