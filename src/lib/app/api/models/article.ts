import { languages, parseSlug } from "$lib/utils/common";
import prisma from "$lib/utils/prisma";
import type { Prisma } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'created_at', 'updated_at'], // Removed 'article_category_id'
  types: {
    categories: {
      type: 'multi',
      params: {
        by: 'id'
      }
    }
  },

  view: {
    fieldsForeign: {
      translations: {
        fields: ['language', 'title', 'slug', 'excerpt', 'thumbnail', 'status_code']
      },
      categories: { // Changed from 'category' to 'categories'
        fields: ['id'], // Optionally specify fields from ArticleCategory itself
        fieldsForeign: {
          translations: { // Translations for each category
            fields: ['name', 'language']
          }
        },
      }
    },
    customFields: [
      {
        name: 'category_name',
        generator(data: any) {
          // Assuming you want the name of the first category, and 'id' as default language
          return data.categories?.[0]?.translations?.find((translation: any) => translation.language === 'id')?.name;
        },
      }
    ],
  },

  create: {
    allow: true,
    fields: ['categories', 'created_at'], // Changed 'article_category_id' to 'categories', added 'title' as it's used in post lifecycle
    lifecycle: {
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          title: body.title, // Ensure title is passed in body for create
          slug: parseSlug(body.title),
          language,
          status_code: 'DRAFT',
          article_id: data.id
        }));
        await prisma.articleTranslation.createMany({
          data: translations
        });
        // prisma.article.create({
        //   data: {
        //     categories: {
        //       connect: body.categories.map((catId: string) => ({ id: catId }))
        //     }
        //   }
        // })
        // Handling for connecting categories would typically be here if 'categories' in body.fields is an array of IDs
        // For example, if body.categories is an array of category IDs:
        if (body.categories && Array.isArray(body.categories)) {
          await prisma.article.update({
            where: { id: data.id },
            data: {
              categories: {
                connect: body.categories.map((catId: string) => ({ id: catId }))
              }
            }
          });
        }
        return {...data, ...body};
      }
    }
  },

  update: {
    allow: true,
    fields: ['categories', 'created_at'], // Changed 'article_category_id' to 'categories'
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
    filterableBy: ['categories'], // Changed 'article_category_id' to 'categories'
    orderBy: { created_at: 'desc' },
    // fieldsForeign for list might also need categories if you display category info in the list
    fieldsForeign: {
      translations: {
        fields: ['language', 'title', 'slug', 'excerpt', 'thumbnail']
      },
      categories: {
        fields: ['id'],
        fieldsForeign: {
          translations: {
            fields: ['name', 'language']
          }
        }
      }
    },
    where: async (event) => {
      if (event.locals.user?.role.role_group_id === 1) return undefined;
      
      // Get all category IDs that the user's role has access to
      const roleWithCategories = await prisma.role.findUnique({
        where: { id: event.locals.user?.role_id },
        select: {
          accessibleArticleCategory: {
            select: { id: true }
          }
        }
      });

      const accessibleCategoryIds = roleWithCategories?.accessibleArticleCategory.map((cat: { id: string }) => cat.id) || [];
      
      // If role has no accessible categories, return no results
      if (accessibleCategoryIds.length === 0) {
        return { 
          AND: [
            { field: 'id', operator: 'equals', value: 'non-existent-id' }
          ]
        };
      }

      // Check that the article has ALL the categories that the role has access to
      return {
        AND: [
          {
            field: 'categories',
            operator: 'some' as const,
            value: { id: { in: accessibleCategoryIds } }
          }
        ]
      };
    }
  },

  detail: {
    allow: true,
    by: ['id'],
    // Ensure fieldsForeign for detail also reflects 'categories'
    fieldsForeign: {
      translations: {
        fields: ['language', 'title', 'slug', 'excerpt', 'thumbnail', 'content'] // Added content for detail view
      },
      categories: {
        fields: ['id'],
        fieldsForeign: {
          translations: {
            fields: ['name', 'language', 'description'] // Added description for category detail
          }
        }
      }
    }
  },

  delete: {
    allow: true,
    by: ['id']
  },
} as ModelConfig<Prisma.ArticleGetPayload<{include: {translations: true, categories: { include: { translations: true }}}}>>; // Updated Prisma GetPayload