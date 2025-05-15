import prisma from '$lib/utils/prisma';
import { error, redirect } from '@sveltejs/kit';
import { getLocale } from '$lib/paraglide/runtime.js';

export async function load({ params, url }) {
  const { slug } = params;
  const locale = getLocale();

  // First, find any article translation that matches the provided slug.
  // This helps us find the article regardless of the current locale.
  const anyArticleTranslation = await prisma.articleTranslation.findFirst({
    where: {
      slug: slug
    },
    include: {
      article: {
        include: {
          translations: true, // Include all translations of the article
          category: { // Include category translation for the current locale
            include: {
              translations: {
                where: { language: locale } // Fetch category translation for the current locale
              }
            }
          }
        }
      }
    }
  });

  // If no translation is found for the given slug at all, the article doesn't exist.
  if (!anyArticleTranslation) {
    throw error(404, 'Article not found');
  }

  // Now that we know the article exists, find the translation for the current locale.
  const currentLocaleTranslation = anyArticleTranslation.article.translations.find(
    (t) => t.language === locale
  );

  // If a translation exists for the current locale, check if the slug matches.
  if (currentLocaleTranslation) {
    if (currentLocaleTranslation.slug !== slug) {
      // Redirect to the correct slug for the current locale.
      // The ParaglideKit `goto` wrapper in the Svelte component will handle the locale prefix.
      throw redirect(308, `/article/${currentLocaleTranslation.slug}`);
    }

    // If the slug matches the current locale's slug, proceed with this translation.
    // const article = {
    //   ...anyArticleTranslation.article,
    //   currentTranslation: currentLocaleTranslation,
    //   category: {
    //     ...anyArticleTranslation.article.category,
    //     translation: anyArticleTranslation.article.category?.translations[0] // Assuming only one translation per category per locale
    //   }
    // };

    return {
      article: {
        ...currentLocaleTranslation,
        created_at: anyArticleTranslation.article.created_at,
        category: anyArticleTranslation.article.category?.translations[0]
      }
    };

  } else {
    // If no translation exists for the current locale, throw a 404.
    // The article exists, but not in the user's preferred language.
    throw error(404, `Article not available in locale: ${locale}`);
  }
}