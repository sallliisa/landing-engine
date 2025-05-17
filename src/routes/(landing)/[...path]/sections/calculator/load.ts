import { getLocale } from "$lib/paraglide/runtime"
import prisma from "$lib/utils/prisma"

export async function load(section: Record<string, any>) {
  const data = await prisma.calculatorType.findUnique({
    where: {
      id: section.meta.calculator_type_id
    },
    include: {
      fields: {
        orderBy: {
          order: 'asc'
        }
      },
      details: {
        orderBy: {
          order: 'asc'
        }
      },
    }
  })
  return {
    calculatorType: data
  }
}