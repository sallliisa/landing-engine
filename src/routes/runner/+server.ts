import prisma from "$lib/utils/prisma"
import { success } from "$lib/utils/response"
import fs from 'fs'

export async function GET() {
  // First get all matching records
  const _data = await prisma.content.findMany({
    where: {
      gallery_id: {
        in: ['cmcf444ar00229j9p54609yra']
      },
      id: {
        startsWith: 'csr-gallery-'
      }
    },
    orderBy: {
      order: 'desc'
    }
  })
  let data = _data.map(item => ({...item, id: undefined, gallery_id: 'cmdazccsi001z9jacbrtxtvtx', title: item.title?.split('\n')[0], subtitle: item.title?.split('\n')[1]}))
  return success(data)
}