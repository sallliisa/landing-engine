import { languages } from "$lib/utils/common";
import prisma from "$lib/utils/prisma";
import type { Language, Prisma } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'parent_id', 'page_id', 'level', 'order', 'menu_item_type', 'url'],
  types: {
    order: 'number'
  },

  create: {
    validation: {
      name: [
        {
          validator: (value: string) => typeof value === 'string' && value.length >= 0,
          message: 'Nama harus diisi'
        }
      ],
    },
    lifecycle: {
      pre: async (body) => {
        let level = 1;
        if (!body.parent_id) {
          body.level = level;
        } else {
          const parent = await prisma.menuItem.findUnique({
            where: { id: body.parent_id },
            select: { level: true }
          });
          if (!parent) throw new Error('Parent not found');
          level = parent.level + 1;
          body.level = level;
        }

        // Find maximum order in the same level
        const maxOrderItem = await prisma.menuItem.findFirst({
          where: { 
            level,
            parent_id: body.parent_id || null
          },
          orderBy: { order: 'desc' },
          select: { order: true }
        });

        body.order = (maxOrderItem?.order ?? 0) + 1;
        return body;
      },
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          title: body.name,
          language,
          menu_item_id: data.id
        }));
        await prisma.menuItemTranslation.createMany({
          data: translations
        });
        return {...data, ...body};
      }
    }
  },

  update: {
    by: ['id'],
    validation: {
      order: [
        {
          validator: (value) => typeof value === 'number' && value >= 0,
          message: 'Order must be a non-negative number'
        }
      ]
    }
  },

  list: {
    searchableBy: ['id'],
    filterableBy: ['parent_id', 'page_id', "level"],
    orderBy: { order: 'asc' },
    // where: {
    //   AND: [
    //     {
    //       field: 'parent_id',
    //       operator: 'isNull',
    //     }
    //   ]
    // },
    fieldsForeign: {
      translations: {
        fields: ['title', 'language']
      },
      page: {
        fields: ['id']
      }
    }
  },

  detail: {
    by: ['id'],
    fieldsForeign: {
      translations: {
        fields: ['title', 'language']
      },
      children: {
        fields: ['id', 'order'],
        fieldsForeign: {
          translations: {
            fields: ['title', 'language']
          }
        }
      },
      page: {
        fields: ['id']
      }
    }
  },

  delete: {
    by: ['id'],
    allow: true
  },

  reorder: {
    fields: ['order'],
    by: ['id']
  }
} as ModelConfig<Prisma.MenuItemGetPayload<{include: {page: true}}>>;