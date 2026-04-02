import { languages } from "$lib/utils/common";
import { requireArticleCategoryAccess } from "$lib/app/api/authorization";
import prisma from "$lib/utils/prisma";
import type { ArticleCategory, Language } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'created_at', 'updated_at'],
  view: {
    fieldsForeign: {
      translations: {
        fields: ['language', 'name', 'description']
      }
    },
    customFields: [
      {
        name: 'name',
        generator: (data: any) => {
          return data?.translations?.find((translation: any) => translation.language === 'id')?.name;
        }
      } 
    ]
  },

  create: {
    allow: true,
    lifecycle: {
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          name: body.name,
          language,
          article_category_id: data.id
        }));
        await prisma.articleCategoryTranslation.createMany({
          data: translations
        });
        return {...data, ...body};
      }
    }
  },

  list: {
    allow: true,
    orderBy: { created_at: 'desc' },
    fieldsForeign: {
      translations: {
        fields: ['language', 'name', 'description']
      }
    },
    where: ({locals}) => {
      const isAdmin = Boolean(locals?.isPrivilegedRole);
      if (isAdmin) return undefined
      return {
        AND: [
          {
            field: 'allowedRoles',
            operator: 'some',
            value: {id: locals.user?.role_id}
          }
        ]
      }
    }
  },

  detail: {
    permission: 'detail-articleCategory',
    authorize: requireArticleCategoryAccess,
    allow: true,
    by: ['id'],
    fieldsForeign: {
      translations: {
        fields: ['language', 'name', 'description']
      }
    }
  },

  update: {
    authorize: requireArticleCategoryAccess,
  },

  delete: {
    authorize: requireArticleCategoryAccess,
    allow: true,
    by: ['id']
  }
} as ModelConfig<ArticleCategory>;
