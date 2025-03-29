import type { Language } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'menu_item_id', 'language', 'title'],

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
    by: ['menu_item_id', 'language'],
    fields: ['id', 'menu_item_id', 'language', 'title'],
  },
} as const;