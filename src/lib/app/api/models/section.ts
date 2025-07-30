import type { Prisma } from "@prisma/client";

export default {
  detail: {
    allow: true,
    by: ['id'],
    fieldsForeign: {
      contents: {
        fields: ['id', 'order', 'gallery_id'],
      },
      galleries: {
        fields: ['id', 'order']
      },
      childSections: {
        fields: ['id', 'order']
      },
      childSectionGroups: {
        fields: ['id', 'order'] 
      }
    },
    lifecycle: {
      async post(data) {
        data.contents = data.contents.sort((a: any, b: any) => a.order - b.order)
        data.galleries = data.galleries.sort((a: any, b: any) => a.order - b.order)
        data.childSections = data.childSections.sort((a: any, b: any) => a.order - b.order)
        data.childSectionGroups = data.childSectionGroups.sort((a: any, b: any) => a.order - b.order)
        // sort it descending by order
        const parsedStructure = [
          ...data.contents.map((item: any) => ({...item, type: 'content'})),
          ...data.galleries.map((item: any) => ({...item, type: 'gallery'})),
          ...data.childSections.map((item: any) => ({...item, type: 'section'})),
          ...data.childSectionGroups.map((item: any) => ({...item, type:'sectionGroup'}))
        ]
        return {
          ...data,
          structure: parsedStructure,
          contents: undefined,
          galleries: undefined,
          childSections: undefined,
          childSectionGroups: undefined
        }
      },
    }
  },

  delete: {
    allow: true,
    by: ['id']
  },

  update: {
    allow: true,
    by: ['id'],
    fields: ['name', 'description', 'visible', 'meta']
  },

  reorder: {
    allow: true,
    axis: ['section_group_id']
  }
} as ModelConfig<Prisma.SectionGetPayload<{include: {contents: true, galleries: true, childSections: true, childSectionGroups: true}}>>