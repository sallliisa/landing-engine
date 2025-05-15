import { parseSlug } from "$lib/utils/common";
import type { ArticleTranslation } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'article_id', 'language', 'title'],

  create: {
    allow: false,
  },

  update: {
    by: ['id'],
    fields: ['title', 'slug', 'excerpt', 'thumbnail', 'content'],
    validation: {
      title: [
        {
          validator: (value: string) => typeof value === 'string' && value.length > 0,
          message: 'Title is required'
        }
      ]
    },
    lifecycle: {
      pre: async (body) => {
        body.slug = parseSlug(body.title)
        return body
      }
    },
  },

  detail: {
    by: ['article_id', 'language'],
  },
} as ModelConfig<ArticleTranslation>;