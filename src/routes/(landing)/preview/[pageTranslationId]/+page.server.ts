import { error } from '@sveltejs/kit';
import { loadSectionsForPageTranslation } from '$lib/server/landing-page.js';

export async function load({ params }) {
	const resolvedPage = await loadSectionsForPageTranslation(params.pageTranslationId);

	if (!resolvedPage) {
		throw error(404, 'Page translation not found');
	}

	return {
		sections: resolvedPage.sections,
		preview: {
			pageTranslationId: resolvedPage.pageTranslation.id,
			language: resolvedPage.pageTranslation.language,
			statusCode: resolvedPage.pageTranslation.status_code,
		},
	};
}
