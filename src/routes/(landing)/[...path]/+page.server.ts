import prisma from '$lib/utils/prisma.js'
import { error } from '@sveltejs/kit'
import {sectionLoaders} from './sections/index.js'
import { getLocale } from '$lib/paraglide/runtime.js';
import { parseSearchParams } from '$lib/utils/common.js';

export async function load({ params, parent, url, cookies }) {
  console.debug('[DEBUG]', {
    cookies: cookies.getAll(),
    getLocale: getLocale()
  })
  const slugs = url.pathname.split('/').slice(1).filter(Boolean);
  const locale = getLocale();

  if (slugs.length === 0) throw error(404, 'Page not found')

  let finalWhereClause: any = {
      slug: slugs[slugs.length - 1],
  };

  let currentNestedParent: any = finalWhereClause;

  for (let i = slugs.length - 2; i >= 0; i--) {
      const parentSlug = slugs[i];
      currentNestedParent.parent = {
          slug: parentSlug
      };
      currentNestedParent = currentNestedParent.parent;
  }

  currentNestedParent.parent_id = null;

  const targetMenuItem = await prisma.menuItem.findFirst({
    where: finalWhereClause,
    include: {
       page: {
          include: {
             translations: {
                where: { language: locale, status_code: 'PUBLISHED' },
                include: {
                   sectionGroups: true
                }
             }
          }
       },
       translations: {
         where: { language: locale }
       }
    }
  });

  if (!targetMenuItem || !targetMenuItem.page || targetMenuItem.page.length === 0 || !targetMenuItem.page[0].translations || targetMenuItem.page[0].translations.length === 0) {
    throw error(404, 'Page or translation not found for this path and locale');
  }

  const pageTranslation = targetMenuItem.page[0].translations[0];
  const currentPageSectionGroup = pageTranslation?.sectionGroups[0]?.id || null;

  if (!currentPageSectionGroup) throw error(500, 'Section group not found for this page translation')

  const pageSectionGroup = await prisma.sectionGroup.findUnique({
    where: {id: currentPageSectionGroup},
    include: {
      sections: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  const currentPageSearchParams = parseSearchParams(url.searchParams);

  if (!pageSectionGroup) throw error(500, 'Section group not found');

  const sectionsWithData = await Promise.all(
    pageSectionGroup.sections.map(async (section) => {
      if (!section.section_type_code) return section
      const loader = sectionLoaders[section.section_type_code]
      let data = null
      if (loader) {
        try {
          data = await loader(section);
        } catch (loaderError) {
           console.error(`Error loading data for section ${section.id} (${section.section_type_code}):`, loaderError);
           data = null;
        }
      }
      // return data !== null ? data : section;
      return {
        ...section,
        data,
      }
    })
  );

  return { sections: sectionsWithData, };
}