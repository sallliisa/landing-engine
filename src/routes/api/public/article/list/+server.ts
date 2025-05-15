import { parseSearchParams } from '$lib/utils/common.js'
import prisma from '$lib/utils/prisma'
import { exception, success } from '$lib/utils/response'
import { getLocale } from '$lib/paraglide/runtime.js';
import { withPagination } from '$lib/utils/pagination'; // Assuming this utility exists and handles page/limit
import type { Prisma } from '@prisma/client';

export async function GET({ url }) {
  try {
    const locale = getLocale();
    const queryParams = parseSearchParams(url.searchParams);

    const articleCategoryId = queryParams.article_category_id as string | undefined;
    const searchQuery = queryParams.search as string | undefined;
    // 'page' and 'limit' from queryParams will be used by withPagination

    const paginatedData = await withPagination(async (skip, take) => {
      const whereClause: Prisma.ArticleWhereInput = {
        // Filter by category if provided
        ...(articleCategoryId && { article_category_id: articleCategoryId }),

        // Articles must have a translation for the current locale.
        // If searchQuery is present, the title of that translation must match.
        translations: {
          some: {
            language: locale,
            ...(searchQuery && {
              title: {
                contains: searchQuery,
                mode: 'insensitive', // Case-insensitive search
              },
            }),
          },
        },
      };

      const articles = await prisma.article.findMany({
        skip,
        take,
        where: whereClause,
        include: {
          // Include only the translation for the current locale
          translations: {
            where: {
              language: locale,
              // If searching, ensure the included translation is the one that matched
              ...(searchQuery && {
                title: {
                  contains: searchQuery,
                  mode: 'insensitive',
                },
              }),
            }
          },
          category: {
            include: {
              // Include only the category translation for the current locale
              translations: {
                where: { language: locale }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc', // Default order, can be made configurable
        },
      });

      const total = await prisma.article.count({
        where: whereClause,
      });

      // Format articles to simplify frontend usage
      const formattedArticles = articles.map(article => {
        const currentTranslation = article.translations[0]; // Should be the single translation for the locale
        const category = article.category;
        const currentCategoryTranslation = category?.translations[0]; // Single category translation for the locale

        return {
          id: article.id,
          created_at: article.created_at,
          updated_at: article.updated_at,
          article_category_id: article.article_category_id,
          // Fields from the specific locale's article translation
          title: currentTranslation?.title,
          slug: currentTranslation?.slug,
          excerpt: currentTranslation?.excerpt,
          thumbnail: currentTranslation?.thumbnail,
          // Optionally include content if needed for previews, otherwise omit for list views
          // content: currentTranslation?.content, 
          // Category details with its specific locale's translation
          category: category ? {
            id: category.id,
            name: currentCategoryTranslation?.name,
            description: currentCategoryTranslation?.description,
          } : null,
        };
      });

      return { data: formattedArticles, total };
    }, queryParams); // queryParams should contain page, limit, etc.

    return success(paginatedData);
  } catch (err) {
    console.error("Error fetching articles:", err); // Log error for server-side debugging
    return exception(err);
  }
}