import prisma from "$lib/utils/prisma"
import { Prisma } from "@prisma/client"

export async function load(section: Record<string, any>) {
  const [filter, data] = await Promise.all([
    prisma.collection.findMany({
      where: {
        OR: [
          {
            code: {
              in: ['project-category', 'project-location']
            }
          }
        ]
      }
    }),
    prisma.section.findUnique({
      where: {
        id: section.id
      },
      include: {
        // childSections: {
        //   orderBy: {
        //     order: 'asc'
        //   },
        //   include: {
        //     galleries: {
        //       orderBy: {
        //         order: 'asc'
        //       },
        //       include: {
        //         contents: {
        //           orderBy: {
        //             order: 'asc'
        //           }
        //         }
        //       }
        //     }
        //   }
        // },
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
  ])
  return {
    filter: {
      category: filter.find(item => item.code === 'project-category')?.data,
      location: filter.find(item => item.code === 'project-location')?.data
    },
    projects: data?.galleries[0].contents
  }
}