import prisma from "$lib/utils/prisma"

export async function load(section: Record<string, any>) {
  const data = await prisma.section.findUnique({
    where: {
      id: section.id
    },
    include: {
      childSections: {
        orderBy: {
          order: 'asc'
        },
        include: {
          galleries: {
            orderBy: {
              order: 'asc'
            },
            include: {
              contents: {
                orderBy: {
                  order: 'asc'
                }
              }
            }
          }
        }
      },
      galleries: {
        include: {
          contents: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      }
    }
  })
  return {
    filter: {
      category: data?.childSections[0].galleries[2].contents,
      location: data?.childSections[0].galleries[0].contents,
    },
    projects: data?.galleries[0].contents
  }
}