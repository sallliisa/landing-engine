import type { Prisma } from "@prisma/client";

export default {
  // Common configurations
  allow: true,
  by: ['id'],
  fields: ['id', 'name', 'role_group_id'],
  
  // Type definitions moved to top level
  types: {
    id: "number",
    role_group_id: "number",
  },

  create: {
    fields: ["name", "role_group_id"],
  },

  update: {
    fields: ["name", "role_group_id"],
  },

  list: {
    fields: ['id', 'name', 'role_group_id'],
    searchableBy: ["name"],
    filterableBy: ["role_group_id"],
    fieldsForeign: {
      roleGroup: {
        fields: ["name"],
      },
    },
  },

  detail: {
    fieldsForeign: {
      roleGroup: {
        fields: ["name"],
      },
      permissions: {
        fields: ["id", "name", "code", "description"],
      },
    },
  },

  delete: {}
} as ModelConfig<Prisma.RoleGetPayload<{ include: { roleGroup: true; permissions: true } }>>