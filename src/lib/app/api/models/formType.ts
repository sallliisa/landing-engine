import { buildWhereClause } from '$lib/utils/common';
import prisma from '$lib/utils/prisma';
import type { FormType, Prisma } from '@prisma/client';

export default {
  allow: true,
  
  // View-related configurations
  view: {
    fieldsForeign: {
      fields: {
        fields: ['id', 'label']
      }
    }
  },

  // List operation config
  list: {
    allow: true,
    searchableBy: ['name', 'description'],
    orderBy: { name: 'asc' },
    filterableBy: ['id'],
    where: ({locals}) => {
      if (locals.user?.role.role_group_id === 1) return undefined
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

  // Detail operation config
  detail: {
    allow: true,
    by: ['id'],
  },

  // Create operation config
  create: {
    allow: true,
    fields: ['name', 'description'],
    validation: {
      name: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Name is required'
        }
      ]
    }
  },

  // Update operation config
  update: {
    allow: true,
    by: ['id'],
  },

  // Delete operation config
  delete: {
    allow: true,
    by: ['id']
  }
} satisfies ModelConfig<Prisma.FormTypeGetPayload<{include: {allowedRoles: true, fields: true}}>>;