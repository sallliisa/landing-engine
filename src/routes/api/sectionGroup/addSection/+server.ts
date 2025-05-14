import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'
import { buildSectionStructure } from '$lib/utils/section.js'
import type { $Enums, SectionType } from '@prisma/client'

export async function POST({request}) {
  let body = await request.json()
  try {
    if (!body.section_group_id) throw 'section_group_id is required'
    if (!body.config) throw 'config is required'

    // Determine if this is a top-level section add (no parent_section_id in group)
    // We'll assume top-level if body.name is not present (per your previous logic)
    const isTopLevel = !body.name

    const maxOrderSection = await prisma.section.findFirst({
      where: { 
        section_group_id: body.section_group_id,
      },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    let sectionName: string
    if (isTopLevel) {
      // Top-level: derive name from config.info.name
      if (!body.config.info?.name) throw 'config.info.name is required for top-level section'
      sectionName = body.config.info.name
    } else {
      // Child section: use provided name
      if (!body.name) throw 'name is required'
      sectionName = body.name
    }

    const newSection = await prisma.section.create({
      data: {
        name: sectionName,
        order: (maxOrderSection?.order ?? 0) + 1,
        section_group_id: body.section_group_id,
        section_type_code: body.config.info?.code
        // Remove section_type_code entirely
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