import { getLocale } from "$lib/paraglide/runtime"
import prisma from "$lib/utils/prisma"

export async function load() {
  const data = await prisma.articleCategory.findMany({
    include: {
      translations: {
        where: {
          language: getLocale()
        }
      },
    }
  })
  return {
    articleCategory: data.map(item => ({...item, name: item.translations[0].name, translations: undefined}))
  }
}