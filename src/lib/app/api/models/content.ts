import prisma from "$lib/utils/prisma";
import type { Content } from "@prisma/client";

export default {
  detail: {
    allow: true,
    by: ['id']
  },
  list: {
    allow: true,
    filterableBy: ['gallery_id'],
  },
  create: {
    allow: true,
    fields: ['media', 'title', 'subtitle', 'description', 'order', 'gallery_id'],
    lifecycle: {
      pre: async (body) => {
        const maxOrderItem = await prisma.content.findFirst({
          where: { 
            gallery_id: body.gallery_id || null
          },
          orderBy: { order: 'desc' },
          select: { order: true }
        });

        body.order = (maxOrderItem?.order ?? 0) + 1;
        return body
      }
    }
  },
  update: {
    allow: true,
    by: ['id'],
    fields: ['media', 'title', 'subtitle', 'description', 'order'],
  },
  delete: {
    allow: true,
    by: ['id']
  }
} as ModelConfig<Content>