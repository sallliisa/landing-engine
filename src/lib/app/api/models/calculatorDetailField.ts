import { parseCode, parseSlug } from '$lib/utils/common';
import prisma from '$lib/utils/prisma';
import { api } from '$lib/utils/services';
import type { Prisma } from '@prisma/client';
import {PUT as reorder} from '../../../../routes/api/[model]/reorder/+server'

export default {
  allow: true,

  // View-related configurations
  view: {
    fieldsForeign: {
      calculatorType: {
        fields: ['id', 'name']
      }
    }
  },

  // List operation config
  list: {
    allow: true,
    searchableBy: ['label', 'formula', 'unit'],
    orderBy: { order: 'asc' },
    filterableBy: ['calculator_type_id', 'type', 'primary'],
    fieldsForeign: {
      calculatorType: {
        fields: ['id', 'name']
      }
    }
  },

  // Detail operation config
  detail: {
    allow: true,
    by: ['id'],
    fieldsForeign: {
      calculatorType: {
        fields: ['id', 'name']
      }
    }
  },

  // Create operation config
  create: {
    allow: true,
    fields: ['calculator_type_id', 'order', 'type', 'label', 'formula', 'unit', 'primary'],
    validation: {
      calculator_type_id: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Calculator type is required'
        }
      ],
      label: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Label is required'
        }
      ],
      formula: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Formula is required'
        }
      ],
      type: [
        {
          validator: (value: string) => ['number', 'currency'].includes(value),
          message: 'Invalid field type'
        }
      ],
    },
    lifecycle: {
      pre: async (body) => {
        if (body.primary) {
          // Unset 'primary' for other items of the same calculator_type_id
          await prisma.calculatorDetailField.updateMany({
            where: {
              calculator_type_id: body.calculator_type_id,
              primary: true,
            },
            data: { primary: false },
          });

          // Increment order of all existing items for this calculator_type_id
          // to make space for the new primary item at order 1.
          await prisma.calculatorDetailField.updateMany({
            where: {
              calculator_type_id: body.calculator_type_id,
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });

          // Set the new primary item's order to 1
          body.order = 1;

        } else {
          // If not primary, assign order as the next available number at the end of the list
          const maxOrderItem = await prisma.calculatorDetailField.findFirst({
            where: {
              calculator_type_id: body.calculator_type_id,
            },
            orderBy: { order: 'desc' },
            select: { order: true },
          });
          body.order = (maxOrderItem?.order ?? 0) + 1;
        }

        // Note: CalculatorDetailField does not have a 'code' field in the schema,
        // so we don't generate one here, unlike CalculatorField.
        return body;
      }
    },
  },

  // Update operation config
  update: {
    allow: true,
    by: ['id'],
    fields: ['order', 'type', 'label', 'formula', 'unit', 'primary'],
    validation: {
      label: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Label is required'
        }
      ],
      formula: [
        {
          validator: (value: string) => value.length > 0,
          message: 'Formula is required'
        }
      ],
      type: [
        {
          validator: (value: string) => ['number', 'currency'].includes(value),
          message: 'Invalid field type'
        }
      ],
      order: [
        {
          validator: (value: number) => value >= 0,
          message: 'Order must be a non-negative number'
        }
      ]
    },
    lifecycle: {
      pre: async (body) => {
        // Fetch the existing item to get its calculator_type_id and current primary status
        const existingItem = await prisma.calculatorDetailField.findUnique({
          where: { id: body.id },
          select: { calculator_type_id: true, primary: true }
        });

        // Only apply primary logic if the item exists and the update body sets primary to true,
        // and the existing item was not already primary.
        if (existingItem && body.primary && !existingItem.primary) {
          // Unset 'primary' for other items of the same calculator_type_id
          await prisma.calculatorDetailField.updateMany({
            where: {
              calculator_type_id: existingItem.calculator_type_id,
              primary: true,
              NOT: { id: body.id } // Exclude the current item
            },
            data: { primary: false }
          });

          // Increment order of all existing items for this calculator_type_id
          // (excluding the current item) to make space for the new primary item at order 1.
          await prisma.calculatorDetailField.updateMany({
            where: {
              calculator_type_id: existingItem.calculator_type_id,
              NOT: { id: body.id } // Exclude the current item
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });

          // Set the current item's order to 1
          body.order = 1;
        }

        // Handle visible field if not provided
        if (body.visible == null) body.visible = false;

        return body;
      },
    },
  },

  // Delete operation config
  delete: {
    allow: true,
    by: ['id']
  },

  // Reorder operation config
  reorder: {
    allow: true,
    axis: ['calculator_type_id']
  }
} satisfies ModelConfig<Prisma.CalculatorDetailFieldGetPayload<{include: {calculatorType: true}}>>;