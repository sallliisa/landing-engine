import prisma from "$lib/utils/prisma";
import type { Prisma, User } from "@prisma/client";
import bcrypt from 'bcrypt'

export default {
  // Common configurations
  allow: true,
  by: ['id'],
  fields: ['id', 'email', 'name', 'role_id'],

  view: {
    fieldsForeign: {
      role: {
        fields: ['name'],
      }
    },
  },
  
  list: {
    searchableBy: ['email', 'name', 'role_id'],
    filterableBy: ['role_id'],
  },

  create: {
    fields: ['name', 'email', 'role_id', 'password'],
    validation: {
      email: [
        {
          validator: (value) => !!value,
          message: 'Email is required'
        },
        {
          validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Invalid email format'
        },
      ],
      name: [
        {
          validator: (value) => !!value,
          message: 'Name is required'
        }
      ],
      role_id: [
        {
          validator: (value) => !!value,
          message: 'Role is required'
        }
      ]
    },
    lifecycle: {
      async main(body) {
        const data = await prisma.user.create({
          data: {
            name: body.name,
            email: body.email,
            role_id: body.role_id,
            password: await bcrypt.hash(body.password, 10),
          }
        })
        return data
      }
    }
  },

  update: {
    fields: ['name', 'email', 'role_id', 'password'],
    lifecycle: {
      async main(body) {
        const updateData: any = {
          name: body.name,
          email: body.email,
          role_id: body.role_id,
        }

        if (body.password) {
          updateData.password = await bcrypt.hash(body.password, 10)
        }

        const data = await prisma.user.update({
          where: { id: body.id },
          data: updateData
        })
        return data
      }
    }
  },

  delete: {}
} as ModelConfig<Prisma.UserGetPayload<{include: {role: true}}>>