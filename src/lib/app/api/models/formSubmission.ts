import type { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

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
    },
    where: (event) => {
      const start_date = event.url.searchParams.get('start_date');
      const end_date = event.url.searchParams.get('end_date');

      if (!start_date && !end_date) return;

      const conditions: Condition<any>[] = [];

      if (start_date) {
        conditions.push({
          field: 'submitted_at',
          operator: 'gte',
          value: dayjs(start_date).startOf('day').toDate()
        });
      }

      if (end_date) {
        conditions.push({
          field: 'submitted_at',
          operator: 'lte',
          value: dayjs(end_date).endOf('day').toDate()
        });
      }

      if (conditions.length) {
        return {
          AND: conditions
        };
      }
    },
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