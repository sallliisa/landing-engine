import prisma from '$lib/utils/prisma';

/**
 * Ensures that a draft exists for a given ArticleTranslation.
 * If the translation is already a draft, it does nothing.
 * If the translation is published, it checks for an existing draft.
 * If no draft exists, it creates one by copying the published content.
 *
 * @param articleTranslationId The ID of the article translation to check.
 * @returns An object containing the final state of the translation (which will be a draft), and a boolean indicating if a new draft was created.
 */
export async function ensureArticleDraftState(articleTranslationId: string) {
	console.log('[ensureArticleDraftState] Fetching articleTranslation:', articleTranslationId);
	const articleTranslation = await prisma.articleTranslation.findUnique({
		where: { id: articleTranslationId },
		include: { draft: true }
	});

	console.log('[ensureArticleDraftState] Fetched:', articleTranslation);

	if (!articleTranslation) {
		console.log('[ensureArticleDraftState] Not found:', articleTranslationId);
		throw new Error('Article translation not found.');
	}

	// If it's already a draft, or if it's a published translation that already has a draft, we're good.
	if (articleTranslation.status_code === 'DRAFT') {
		console.log('[ensureArticleDraftState] Already a draft:', articleTranslation.id);
		return { translation: articleTranslation, created: false };
	}
	if (articleTranslation.draft) {
		console.log('[ensureArticleDraftState] Already has a draft:', articleTranslation.draft.id);
		return { translation: articleTranslation.draft, created: false };
	}

	console.log('[ensureArticleDraftState] Creating new draft for:', articleTranslation.id);
	const draftTranslation = await prisma.articleTranslation.create({
		data: {
			article_id: articleTranslation.article_id,
			language: articleTranslation.language,
			title: articleTranslation.title,
			slug: articleTranslation.slug,
			excerpt: articleTranslation.excerpt,
			thumbnail: articleTranslation.thumbnail,
			content: articleTranslation.content,
			status_code: 'DRAFT',
			live_for_id: articleTranslation.id
		}
	});

	console.log('[ensureArticleDraftState] Created draft:', draftTranslation.id);
	return { translation: draftTranslation, created: true };
} 