import { buildWhereClause } from '$lib/utils/common';
import { requireFormTypeAccess } from '$lib/app/api/authorization';
import prisma from '$lib/utils/prisma';
import type { FormType, Prisma } from '@prisma/client';

export default {
  allow: true,
  
  // View-related configurations
  view: {
    fieldsForeign: {
      fields: {
        fields: ['id', 'label', 'type']
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

  // Detail operation config
  detail: {
    permission: 'detail-formType',
    authorize: requireFormTypeAccess,
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
    authorize: requireFormTypeAccess,
    allow: true,
    by: ['id'],
  },

  // Delete operation config
  delete: {
    authorize: requireFormTypeAccess,
    allow: true,
    by: ['id']
  }
} satisfies ModelConfig<Prisma.FormTypeGetPayload<{include: {allowedRoles: true, fields: true}}>>;
