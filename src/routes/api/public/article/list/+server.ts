import { parseSearchParams } from '$lib/utils/common.js'
import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'

export async function GET({params, url}) {
  try {
    const data = await prisma.article.findMany({
      orderBy: {created_at: 'desc'},
      where: {
        articleLanguageMap: url.searchParams.get('article_category_id') ? {
          article_category_language_map_id: Number(url.searchParams.get('article_category_id'))
        } : undefined,
        title: {
          contains: url.searchParams.get('search') || undefined,
          mode: 'insensitive'
        },
        language: url.searchParams.get('language') as 'id' || 'en'
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        created_at: true,
        articleLanguageMap: {
          select: {
            id: true,
            code: true,
            articleCategoryLanguageMap: {
              select: {
                name: true,
                articleCategory: {
                  where: {
                    language: url.searchParams.get('language') as 'id' || 'en'
                  },
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return success({data})
  } catch (err) {
    return exception(err)
  }
}