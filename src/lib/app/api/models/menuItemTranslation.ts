import { parseSlug } from "$lib/utils/common";
import prisma from "$lib/utils/prisma";
import type { Language, MenuItemTranslation } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'menu_item_id', 'language', 'name'],

  create: {
    allow: false,
  },

  update: {
    by: ['id'],
    fields: ['name'],
    validation: {
      name: [
        {
          validator: (value: string) => typeof value === 'string' && value.length > 0,
          message: 'Name is required'
        }
      ]
    },
    lifecycle: {
      post: async (body: any, data: any) => {
        // update parent menu item slug
        return body;
      }
    }
  },

  detail: {
    by: ['menu_item_id', 'language'],
    fields: ['id', 'menu_item_id', 'language', 'name'],
  },
} as ModelConfig<MenuItemTranslation>