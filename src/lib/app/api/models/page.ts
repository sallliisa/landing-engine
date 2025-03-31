import { languages } from '$lib/utils/common';
import prisma from '$lib/utils/prisma';
import type { Page, Prisma } from '@prisma/client';

export default {
  create: {
    allow: true,
    fields: ['menu_item_id'],
    lifecycle: {
      post: async (body: any, data: any) => {
        const translations = languages.map(language => ({
          language,
          page_id: data.id
        }));
        const pageTranslations = await prisma.pageTranslation.createManyAndReturn({
          data: translations
        });
        // create SectionGroups for each pageTranslations
        const sectionGroups = await prisma.sectionGroup.createManyAndReturn({
          data: pageTranslations.map(pt => ({
            page_translation_id: pt.id,
          }))
        });
        return sectionGroups;
      }
    }
  },
} satisfies ModelConfig<Page>;