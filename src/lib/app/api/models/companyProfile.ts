import type { CompanyProfile } from "@prisma/client";

export default {
  allow: true,
  by: ['id'],
  fields: [
    'id', 'name', 'slogan', 'address', 'email', 'phone',
    'facebook', 'instagram', 'twitter', 'youtube', 'whatsapp', 'brochure'
  ],

  update: {
    fields: [
      'name', 'slogan', 'address', 'email', 'phone',
      'facebook', 'instagram', 'twitter', 'youtube', 'whatsapp', 'brochure'
    ],
    validation: {
      email: [
        {
          validator: (value?: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Invalid email format'
        }
      ],
      phone: [
        {
          validator: (value?: string) => !value || /^[0-9+\-() ]*$/.test(value),
          message: 'Invalid phone number format'
        }
      ]
    }
  },
} as ModelConfig<CompanyProfile>;