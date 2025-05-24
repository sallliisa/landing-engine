import { getLocale } from "$lib/paraglide/runtime"
import prisma from "$lib/utils/prisma"

export async function load(section: Record<string, any>) {
  const data = await prisma.formType.findUnique({
    where: {
      id: section.meta.form_type_id
    },
    include: {
      fields: {
        orderBy: {
          order: 'asc'
        }
      },
    }
  })
  return {
    formType: data,
    formDataTemplate: {
      form_type_id: section.meta.form_type_id,
      data: data?.fields.map(field => ({...field, value: null}))
    },
  }
}