import { languages, parseSlug } from "$lib/utils/common";
import prisma from "$lib/utils/prisma";
import type { Language, MenuItem, Prisma } from "@prisma/client";

export default {
  allow: true,
  fields: ['id', 'parent_id', 'role', 'visible', 'level', 'order', 'menu_item_type', 'show_submenu_below_navbar', 'url', 'slug'],
  types: {
    order: {
      type: 'number'
    }
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
        body.slug = parseSlug(body.name); // Add this line to set the slug based on the name
        return body;
      },
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          name: body.name,
          language,
          menu_item_id: data.id,
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
    fields: ['visible', 'role', 'show_submenu_below_navbar'],
    validation: {
      order: [
        {
          validator: (value) => typeof value === 'number' && value >= 0,
          message: 'Order must be a non-negative number'
        }
      ]
    },
    lifecycle: {
      pre: async (body) => {
        if (body.role) {
          await prisma.menuItem.updateMany({
            where: { role: body.role },
            data: { role: null }
          });
        }
        if (body.visible == null) body.visible = false
        return body
      },
      post: async (body, data) => {
        if (body.visible && body.role === 'primary') {
          await prisma.menuItem.update({
            where: {id: body.id},
            data: {visible: false}
          })
        }
        return data
      }
    }
  },

  list: {
    searchableBy: ['id'],
    filterableBy: ['parent_id', "level"],
    orderBy: { order: 'asc' },
    fieldsForeign: {
      translations: {
        fields: ['name', 'language']
      },
      allowedRoles: {
        fields: ['id']
      }
    },
    lifecycle: {
      post: async (data, total, locals) => {
        const userRoleId = locals?.user?.role_id;
        const isAdmin = locals?.user?.role.role_group_id <= 2;

        // To add the 'can_edit' property, we must map over the data array
        // and return new objects, as the original `data` is read-only.
        return data.map(item => {
          // We need to assert the type to get access to the 'allowedRoles' relation.
          const menuItem = item as Prisma.MenuItemGetPayload<{ include: { allowedRoles: true } }>;
          
          let can_edit = false;
          if (isAdmin) {
            // Admins can edit everything.
            can_edit = true;
          } else if (userRoleId && menuItem.allowedRoles) {
            // For other users, check if their role is in the item's allowedRoles list.
            can_edit = menuItem.allowedRoles.some(role => role.id === userRoleId);
          }

          // Return a new object with all original properties plus 'can_edit'.
          return { ...item, can_edit };
        });
      }
    }
  },

  detail: {
    by: ['id'],
    fieldsForeign: {
      translations: {
        fields: ['name', 'language']
      },
      allowedRoles: {
        fields: ['id']
      },
      page: {
        fields: ['id'],
        fieldsForeign: {
          translations: {
            fields: ['id', 'language'],
            fieldsForeign: {
              sectionGroups: {
                fields: ['id']
              }
            }
          }
        }
      },
      children: {
        fields: ['id', 'order'],
        fieldsForeign: {
          translations: {
            fields: ['name', 'language']
          }
        }
      },
    },
    lifecycle: {
      async post(data: Record<string, any>, _total?: number, locals?: Record<string, any>) {
        const userRoleId = locals?.user?.role_id;
        const isAdmin = locals?.user?.role?.role_group_id <= 2;
        let can_edit = false;

        if (isAdmin) {
          can_edit = true;
        } else if (userRoleId && data.allowedRoles) {
          can_edit = data.allowedRoles.some((role: { id: string }) => role.id === userRoleId);
        }

        console.log(userRoleId, data.allowedRoles)

        return { 
          ...data, 
          has_page: !!(data.page && data.page[0]),
          can_edit
        };
      },
    }
  },

  delete: {
    by: ['id'],
    allow: true
  },

  reorder: {
    allow: true,
    axis: ['parent_id'],
    by: ['id']
  }
} as ModelConfig<Prisma.MenuItemGetPayload<{include: {allowedRoles: true, page: true}}>>;