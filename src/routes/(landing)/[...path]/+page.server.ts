import prisma from '$lib/utils/prisma.js'
import { error } from '@sveltejs/kit'
import { getLocale } from '$lib/paraglide/runtime.js';
import { parseSearchParams } from '$lib/utils/common.js';
import { loadSectionsForPageTranslation } from '$lib/server/landing-page.js';

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

  const currentPageSearchParams = parseSearchParams(url.searchParams);
  const pageTranslation = targetMenuItem.page[0].translations[0];
  const resolvedPage = await loadSectionsForPageTranslation(pageTranslation.id);

  if (!resolvedPage) throw error(404, 'Page translation not found');

  return { sections: resolvedPage.sections, currentPageSearchParams };
} 
