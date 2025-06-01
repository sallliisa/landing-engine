import { parseSearchParams } from '$lib/utils/common';
import prisma from '$lib/utils/prisma';
import { exception, success } from '$lib/utils/response';
import { withPagination } from '$lib/utils/pagination';

export async function GET({url}) {
  let urlSearchParams = parseSearchParams(url.searchParams);
  if (!urlSearchParams.role_id) return exception('role_id is required');
  
  try {
    const paginatedData = await withPagination(async (skip, take) => {
      const allPermissions = await prisma.permission.findMany({
        skip,
        take,
        select: {
          code: true,
          name: true,
          description: true,
          roles: {
            where: { id: Number(urlSearchParams.role_id) },
            select: { id: true },
          },
        },
      });

      const total = await prisma.permission.count();
      
      const formattedData = allPermissions.map((p) => ({
        code: p.code,
        name: p.name,
        description: p.description,
        active: p.roles.length > 0,
      }));

      return { data: formattedData, total };
    }, urlSearchParams);

    return success(paginatedData);
  } catch (error) {
    console.log(error);
    return exception(error);
  }
}