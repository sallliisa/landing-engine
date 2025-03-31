import prisma from '$lib/utils/prisma';
import type { FormField, Prisma } from '@prisma/client';

export default {
  allow: true,

  // View-related configurations
  view: {
    fieldsForeign: {
      formType: {
        fields: ['id', 'name']
      }
    }
  },

  // List operation config
  list: {
    allow: true,
    searchableBy: ['label'],
    orderBy: { order: 'asc' },
    filterableBy: ['form_type_id', 'type'],
    fieldsForeign: {
      formType: {
        fields: ['id', 'name']
      }
    }
  },

  // Detail operation config
  detail: {
    allow: true,
    by: ['id'],
    fieldsForeign: {
      formType: {
        fields: ['id', 'name']
      }
    }
  },

  // Create operation config
  create: {
    allow: true,
    fields: ['form_type_id', 'order', 'type', 'validation_type_code', 'label', 'required', 'helperMessage', 'colSpan'],
    validation: {
      form_type_id: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Form type is required'
        }
      ],
      label: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Label is required'
        }
      ],
      type: [
        {
          validator: (value: string) => ['text', 'textarea', 'image', 'file', 'date'].includes(value),
          message: 'Invalid field type'
        }
      ],
    },
    lifecycle: {
      pre: async (body) => {
        // get the max order of the form type and increment it
        const maxOrderItem = await prisma.formField.findFirst({
          where: { 
            form_type_id: body.form_type_id,
          },
          orderBy: { order: 'desc' },
          select: { order: true }
        });

        body.order = (maxOrderItem?.order ?? 0) + 1;
        return body;
      }
    },
  },

  // Update operation config
  update: {
    allow: true,
    by: ['id'],
    fields: ['order', 'type', 'validation_type_code', 'label', 'required', 'helperMessage', 'colSpan'],
    validation: {
      label: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Label is required'
        }
      ],
      type: [
        {
          validator: (value: string) => ['text', 'textarea', 'image', 'file', 'date'].includes(value),
          message: 'Invalid field type'
        }
      ],
      order: [
        {
          validator: (value: number) => value >= 0,
          message: 'Order must be a non-negative number'
        }
      ]
    }
  },

  // Delete operation config
  delete: {
    allow: true,
    by: ['id']
  },

  // Reorder operation config
  reorder: {
    allow: true,
    fields: ['order']
  }
} satisfies ModelConfig<Prisma.FormFieldGetPayload<{include: {formType: true}}>>;