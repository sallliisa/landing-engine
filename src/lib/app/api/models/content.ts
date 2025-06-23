import prisma from "$lib/utils/prisma";
import type { Content } from "@prisma/client";

export default {
  types: {
    media: {
      type: 'file'
    }
  },
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
    fields: ['media', 'title', 'subtitle', 'description', 'label', 'content', 'blurb', 'media_type', 'attachment', 'status', 'order', 'gallery_id', 'url', 'url_text', 'url_type', 'amount', 'collection', 'meta'],
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
    fields: ['media', 'title', 'subtitle', 'description', 'label', 'content', 'blurb', 'media_type', 'attachment', 'status', 'order', 'url', 'url_text', 'url_type', 'amount', 'collection', 'meta'],
  },
  delete: {
    allow: true,
    by: ['id']
  }
} as ModelConfig<Content>