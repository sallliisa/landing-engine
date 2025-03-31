import type { Prisma } from '@prisma/client';

export default {
  allow: true,

  view: {
    fieldsForeign: {
      formType: {
        fields: ['id', 'name']
      }
    }
  },

  list: {
    allow: true,
    filterableBy: ['form_type_id', 'read'],
    orderBy: { submitted_at: 'desc' },
    fieldsForeign: {
      formType: {
        fields: ['id', 'name']
      }
    },
    lifecycle: {
      async post(data, total) {
          const formSubmissions = data.map(item => ({...item.data, ...item, data: undefined}))
          return formSubmissions
      },
    }
  },

  detail: {
    allow: true,
    by: ['id'],
    fieldsForeign: {
      formType: {
        fields: ['id', 'name', 'fields']
      }
    },
    lifecycle: {
      async post(data, total) {
          const formSubmission = {...data.data, ...data, data: undefined}
          return formSubmission
      },
    }
  },

  update: {
    allow: true,
    by: ['id'],
    fields: ['read']
  },

  delete: {
    allow: true,
    by: ['id']
  }
} satisfies ModelConfig<Prisma.FormSubmissionGetPayload<{include: {formType: true}}>>;