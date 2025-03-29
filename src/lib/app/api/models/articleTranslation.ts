import type { ArticleTranslation } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'article_id', 'language', 'title'],

  create: {
    allow: false,
  },

  update: {
    by: ['id'],
    fields: ['title'],
    validation: {
      title: [
        {
          validator: (value: string) => typeof value === 'string' && value.length > 0,
          message: 'Title is required'
        }
      ]
    }
  },

  detail: {
    by: ['article_id', 'language'],
  },
} as ModelConfig<ArticleTranslation>;