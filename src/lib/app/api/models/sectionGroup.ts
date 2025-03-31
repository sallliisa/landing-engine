import type { Prisma, SectionGroup } from "@prisma/client";

export default {
  detail: {
    allow: true,
    by: ['id'],
    fields: ['id'],
    fieldsForeign: {
      sections: {
        fields: ['id', 'name', 'section_type_code']
      }
    }
  }
} as ModelConfig<Prisma.SectionGroupGetPayload<{include: {sections: true}}>>