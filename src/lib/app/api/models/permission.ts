import type { Permission } from '@prisma/client'

export default {
  // Base configuration
  allow: true,
  fields: ['id', 'name', 'code', 'description'],

  // Create operation configuration
  create: {
    fields: ['name', 'code', 'description'],
    validation: {
      name: [
        {
          validator: (value) => !!value && value.length > 0,
          message: 'Permission name is required'
        }
      ],
      code: [
        {
          validator: (value) => !!value && value.length > 0,
          message: 'Permission code is required'
        }
      ]
    }
  },

  // Update operation configuration
  update: {
    fields: ['name', 'code', 'description'],
    by: ['id'],
    validation: {
      name: [
        {
          validator: (value) => !!value && value.length > 0,
          message: 'Permission name is required'
        }
      ],
      code: [
        {
          validator: (value) => !!value && value.length > 0,
          message: 'Permission code is required'
        }
      ]
    }
  },

  // List operation configuration
  list: {
    fields: ['id', 'name', 'code', 'description'],
    searchableBy: ['name', 'code', 'description'],
    filterableBy: ['id', 'code'],
    orderBy: { id: 'asc' }
  },

  // Detail operation configuration
  detail: {
    fields: ['id', 'name', 'code', 'description'],
    by: ['id']
  },

  // Delete operation configuration
  delete: {
    by: ['id']
  }
} as ModelConfig<Permission>