import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'
import { buildSectionStructure } from '$lib/utils/section.js'
import type { $Enums, SectionType } from '@prisma/client'

export async function POST({request}) {
  let body = await request.json()
  try {
    if (!body.section_group_id) throw 'section_group_id is required'
    if (!body.config) throw 'config is required'
    // check if section_type_code is exist in prisma
    let sectionType: SectionType | null = null

    if (body.section_type_code) {
      sectionType = await prisma.sectionType.findFirst({
        where: {
          code: body.section_type_code
        }
      })
      if (!sectionType) throw 'section_type_code is not a valid code'
    } else if (!body.name) {
      throw 'name is required'
    }

    const maxOrderSection = await prisma.section.findFirst({
      where: { 
        section_group_id: body.section_group_id,
      },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const newSection = await prisma.section.create({
      data: {
        name: sectionType ? sectionType.name : body.name,
        order: (maxOrderSection?.order ?? 0) + 1,
        section_group_id: body.section_group_id,
        section_type_code: body.section_type_code,
      }
    })

    await buildSectionStructure(newSection, body.config)

    return success({message: 'Section created'})
    // const data = await prisma.sectionGroup.update({
    //   where: {
    //     id: body.section_group_id
    //   },
    //   data: {
    //     sectionGroupStructure: [...(prevData?.sectionGroupStructure as JsonArray), {...newSection, config: sectionTypeConfig}]
    //   } 
    // })
    // return success(data)
  } catch (err) {
    return exception(err)
  }
}