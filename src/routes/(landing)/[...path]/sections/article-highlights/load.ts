import { getLocale } from "$lib/paraglide/runtime"
import prisma from "$lib/utils/prisma"

export async function load(section: any) {
  const [content, article] = await Promise.all([
    prisma.content.findFirst({
      where: {section_id: section.id}
    }),
    prisma.article.findMany({
      where: section.meta.article_category_id ? {article_category_id: section.meta.article_category_id} : undefined,
      take: 3,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        translations: {
          where: {language: getLocale()},
          select: {
            title: true,
            content: true,
            thumbnail: true,
          }
        },
        category: {
          select: {
            translations: {
              where: {language: getLocale()},
              select: {
                name: true
              }
            }
          }
        }
      }
    })
  ])
  return {
    content,
    article: article.map(article => ({
      ...article,
      title: article.translations[0].title,
      content: article.translations[0].content,
      thumbnail: article.translations[0].content,
      category_name: article.category?.translations[0].name,
      translations: undefined,
      category: undefined
    }))
  }
}