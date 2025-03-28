import prisma from '$lib/utils/prisma';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for session token
import { exception, success } from '$lib/utils/response.js';

export async function POST({ request }) {
  const { email, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return exception('Invalid credentials')
    }

    // Create a session token
    const token = uuidv4();

    await prisma.session.create({
      data: {
        token,
        user_id: user.id,
      },
    });

    return success({data: { token, permissions: [] }});
  } catch (error) {
    return exception(`Login failed: ${error}`)
  }
}