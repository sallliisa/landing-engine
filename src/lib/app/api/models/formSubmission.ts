import type { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { requireFormSubmissionAccess } from '$lib/app/api/authorization';
import prisma from '$lib/utils/prisma';

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
    where: async (event) => {
      const start_date = event.url.searchParams.get('start_date');
      const end_date = event.url.searchParams.get('end_date');
      const conditions: Condition<any>[] = [];

      if (!event.locals.isPrivilegedRole) {
        const role = await prisma.role.findUnique({
          where: { id: event.locals.user?.role_id },
          select: {
            accessibleFormTypes: {
              select: {
                id: true
              }
            }
          }
        });

        const accessibleFormTypeIds = role?.accessibleFormTypes.map((formType) => formType.id) ?? [];

        conditions.push({
          field: 'form_type_id',
          operator: 'in',
          value: accessibleFormTypeIds.length ? accessibleFormTypeIds : ['__forbidden__']
        });
      }

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

      return {
        AND: conditions
      };
    },
  },

  detail: {
    permission: 'detail-formSubmission',
    authorize: requireFormSubmissionAccess,
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
    permission: 'view-formSubmission',
    authorize: requireFormSubmissionAccess,
    allow: true,
    by: ['id'],
    fields: ['read']
  },

  delete: {
    authorize: requireFormSubmissionAccess,
    allow: true,
    by: ['id']
  }
} satisfies ModelConfig<Prisma.FormSubmissionGetPayload<{include: {formType: true}}>>;
