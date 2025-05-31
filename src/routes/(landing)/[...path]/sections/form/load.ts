import gallery from "$lib/app/api/models/gallery"
import { getLocale } from "$lib/paraglide/runtime"
import prisma from "$lib/utils/prisma"

export async function load(section: Record<string, any>) {
  const [formTypeData, sectionData] = await Promise.all([
    prisma.formType.findUnique({
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
    }),
    prisma.section.findUnique({
      where: {id: section.id},
      select: {
        childSections: {
          select: {
            contents: {
              select: {
                title: true,
                description: true
              }
            },
            galleries: {
              select: {
                contents: {
                  select: {
                    title: true,
                    attachment: true
                  }
                }
              }
            }
          },
        }
      }
    })
  ])
  return {
    formType: formTypeData,
    formDataTemplate: {
      form_type_id: section.meta.form_type_id,
      data: formTypeData?.fields.map(field => ({...field, value: null}))
    },
    content: sectionData?.childSections[0].contents[0],
    gallery: sectionData?.childSections[0].galleries[0].contents
  }
}