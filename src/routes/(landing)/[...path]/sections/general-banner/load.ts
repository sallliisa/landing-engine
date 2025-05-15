import prisma from "$lib/utils/prisma"

export async function load(sectionId: string) {
  const data = await prisma.section.findUnique({
    where: {
      id: sectionId
    },
    include: {
      contents: {
        orderBy: {
          order: 'asc'
        }
      },
    }
  })
  return {
    contents: data?.contents
  }
}