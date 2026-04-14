import prisma from '$lib/utils/prisma.js';

const PREVIEW_ROUTE_PATTERN = /^\/preview\/([^/]+)\/?$/;

export function getPreviewPageTranslationId(pathname: string) {
	const match = pathname.match(PREVIEW_ROUTE_PATTERN);
	return match?.[1] ?? null;
}

export async function getPreviewLocale(pathname: string) {
	const pageTranslationId = getPreviewPageTranslationId(pathname);
	if (!pageTranslationId) return null;

	const pageTranslation = await prisma.pageTranslation.findUnique({
		where: { id: pageTranslationId },
		select: { language: true },
	});

	return pageTranslation?.language ?? null;
}
