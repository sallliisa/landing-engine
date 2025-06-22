import { parseCode } from "$lib/utils/common";
import type { Prisma } from "@prisma/client";

export default {
  view: {
    fields: ["name", "code", "data"],
  },
  create: {
    allow: true,
    fields: ["name", "code", "data"],
    validation: {
      name: [
        {
          validator: (value: string) => value.length > 0,
          message: "Name is required",
        },
      ],
    },
    lifecycle: {
      pre: async (body) => {
        body.code = parseCode(body.name);
        return body;
      },
    },
  },
  update: {
    allow: true,
    by: ["code"],
    fields: ["name", "code", "data"],
  },
  list: {
    allow: true,
    searchableBy: ["name", "code"],
    filterableBy: ["name", "code"],
    orderBy: { name: "asc" },
  },
  detail: {
    by: ['code'],
    allow: true,
    lifecycle: {
      post: async (data, total) => {
        return data.data
      },
    }
  },
  delete: {
    allow: true,
  },
} as ModelConfig<Prisma.CollectionGetPayload<{}>>;
