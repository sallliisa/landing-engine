import { validateField } from '$lib/utils/form';
import prisma from '$lib/utils/prisma.js';
import { exception, success } from '$lib/utils/response';
import type { FormField } from '@prisma/client';

const exampleSubmissionData = {
  "form_type_id": "cm8uzvd410000v1vwg54dy21e",
  "data": [
      {
          "id": "cm8v44ydy0003v1c4g3nhoat7",
          "order": 1,
          "colSpan": 12,
          "type": "text",
          "validation_type_code": null,
          "label": "Nama",
          "required": true,
          "helperMessage": null,
          "value": null
      },
      {
          "id": "cm8v456970005v1c4iuxfdhji",
          "order": 2,
          "colSpan": 6,
          "type": "text",
          "validation_type_code": null,
          "label": "Nomor Telepon",
          "required": true,
          "helperMessage": null,
          "value": null
      },
      {
          "id": "cm8v45yen0007v1c4k279p08h",
          "order": 3,
          "colSpan": 6,
          "type": "text",
          "validation_type_code": null,
          "label": "Email",
          "required": true,
          "helperMessage": null,
          "value": null
      },
      {
          "id": "cm8v463te0009v1c421kp23vt",
          "order": 4,
          "colSpan": 12,
          "type": "date",
          "validation_type_code": null,
          "label": "Tanggal Booking",
          "required": true,
          "helperMessage": null,
          "value": null
      },
      {
          "id": "cm8vap44j000dv1c4t4vhgwll",
          "order": 5,
          "colSpan": 12,
          "type": "textarea",
          "validation_type_code": null,
          "label": "Minat",
          "required": false,
          "helperMessage": null,
          "value": null
      }
  ]
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    
    // 1. Fetch form type and its fields
    const formType = await prisma.formType.findUnique({
      where: { id: body.form_type_id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!formType) {
      return exception('Form type not found');
    }

    // 2. Validate form structure
    if (body.data.length !== formType.fields.length) {
      return exception('Invalid form structure: field count mismatch');
    }

    // 3. Validate each field
    const submissionData: Record<string, any> = {};
    
    for (let i = 0; i < formType.fields.length; i++) {
      const expectedField: FormField = formType.fields[i];
      const submittedField = body.data[i];

      // Check if fields match
      if (expectedField.id !== submittedField.id ||
          expectedField.type !== submittedField.type ||
          expectedField.order !== submittedField.order) {
        return exception(`Invalid form structure: field mismatch at position ${i + 1}`);
      }

      // Check required fields
      if (expectedField.required && !submittedField.value) {
        return exception(`Field "${expectedField.label}" is required`);
      }

      // Validate field based on validation type
      if (expectedField.validation_type_code && submittedField.value) {
        const isValid = validateField(submittedField.value, expectedField.validation_type_code);
        if (!isValid) {
          return exception(`Invalid ${expectedField.validation_type_code} format for field "${expectedField.label}"`);
        }
      }

      // Add to submission data
      submissionData[expectedField.id] = submittedField.value;
    }

    // 4. Save submission
    const submission = await prisma.formSubmission.create({
      data: {
        form_type_id: body.form_type_id,
        data: submissionData,
      }
    });

    return success({ data: submission });
  } catch (error) {
    console.error('Form submission error:', error);
    return exception('Failed to process form submission');
  }
}