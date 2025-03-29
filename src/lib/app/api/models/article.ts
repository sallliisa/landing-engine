import { languages, parseSlug } from "$lib/utils/common";
import prisma from "$lib/utils/prisma";
import type { Prisma } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'created_at', 'updated_at', 'article_category_id'],
  view: {
    fieldsForeign: {
      translations: {
        fields: ['language', 'title', 'slug', 'excerpt', 'thumbnail']
      },
      category: {
        fieldsForeign: {
          translations: {
            fields: ['name', 'language']
          }
        },
      }
    },
    customFields: [
      {
        name: 'category_name',
        generator(data) {
          return data.category?.translations?.find((translation: any) => translation.language === 'id')?.name;
        },
      }
    ],
  },

  create: {
    allow: true,
    fields: ['article_category_id'],
    lifecycle: {
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          title: body.title,
          slug: parseSlug(body.title),
          language,
          article_id: data.id
        }));
        await prisma.articleTranslation.createMany({
          data: translations
        });
        return {...data, ...body};
      }
    }
  },

  update: {
    allow: true,
    fields: ['article_category_id', 'translations'],
    by: ['id'],
    validation: {
      translations: [
        {
          validator: (translations) => 
            Array.isArray(translations) && translations.length > 0,
          message: 'At least one translation is required'
        }
      ]
    }
  },

  list: {
    allow: true,
    filterableBy: ['article_category_id'],
    orderBy: { created_at: 'desc' },
  },

  detail: {
    allow: true,
    by: ['id'],
  },

  delete: {
    allow: true,
    by: ['id']
  },
} as ModelConfig<Prisma.ArticleGetPayload<{include: {translations: true, category: true}}>>;