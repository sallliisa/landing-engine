import prisma from '$lib/utils/prisma.js';
import { success } from '$lib/utils/response';

export async function GET({}) {
  const data = await prisma.role.findFirst({
    where: {
      id: 3
    },
    include: {
      permissions: true
    }
  })

  return success(data)
}