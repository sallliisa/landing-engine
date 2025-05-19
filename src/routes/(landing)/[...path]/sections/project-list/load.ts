import prisma from "$lib/utils/prisma"

export async function load(section: Record<string, any>) {
  const data = await prisma.section.findUnique({
    where: {
      id: section.id
    },
    include: {
      childSections: {
        include: {
          galleries: {
            include: {
              contents: true
            }
          }
        }
      },
      galleries: {
        include: {
          contents: true
        }
      }
    }
  })
  return {
    filter: {
      category: data?.childSections[0].galleries[0].contents,
      location: data?.childSections[0].galleries[1].contents,
    },
    projects: data?.galleries[0].contents
  }
}