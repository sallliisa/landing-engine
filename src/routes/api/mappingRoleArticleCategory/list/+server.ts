import { parseSearchParams } from '$lib/utils/common';
import prisma from '$lib/utils/prisma';
import { exception, success } from '$lib/utils/response';
import { withPagination } from '$lib/utils/pagination';

export async function GET({url}) {
  let urlSearchParams = parseSearchParams(url.searchParams);
  if (!urlSearchParams.article_category_id) return exception('article_category_id is required');
  
  try {
    const paginatedData = await withPagination(async (skip, take) => {
      const allRoles = await prisma.role.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          accessibleArticleCategory: {
            where: { id: String(urlSearchParams.menu_item_id) },
            select: { id: true },
          },
        },
      });

      const total = await prisma.role.count();
      
      const formattedData = allRoles.map((role) => ({
        id: role.id,
        name: role.name,
        active: role.accessibleArticleCategory.length > 0,
      }));

      return { data: formattedData, total };
    }, urlSearchParams);

    return success(paginatedData);
  } catch (error) {
    console.log(error);
    return exception(error);
  }
}