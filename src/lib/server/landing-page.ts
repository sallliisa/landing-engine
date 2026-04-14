import prisma from '$lib/utils/prisma.js';
import { sectionLoaders } from '../../routes/(landing)/[...path]/sections/index.js';

export async function loadSectionsForPageTranslation(pageTranslationId: string) {
	const pageTranslation = await prisma.pageTranslation.findUnique({
		where: { id: pageTranslationId },
		include: {
			sectionGroups: true,
		},
	});

	if (!pageTranslation) {
		return null;
	}

	const currentPageSectionGroup = pageTranslation.sectionGroups[0]?.id ?? null;
	if (!currentPageSectionGroup) {
		throw new Error('Section group not found for this page translation');
	}

	const pageSectionGroup = await prisma.sectionGroup.findUnique({
		where: { id: currentPageSectionGroup },
		include: {
			sections: {
				orderBy: {
					order: 'asc',
				},
			},
		},
	});

	if (!pageSectionGroup) {
		throw new Error('Section group not found');
	}

	const sectionsWithData = await Promise.all(
		pageSectionGroup.sections.map(async (section) => {
			if (!section.section_type_code) return section;

			const loader = sectionLoaders[section.section_type_code];
			let data = null;

			if (loader) {
				try {
					data = await loader(section);
				} catch (loaderError) {
					console.error(
						`Error loading data for section ${section.id} (${section.section_type_code}):`,
						loaderError,
					);
				}
			}

			return {
				...section,
				data,
			};
		}),
	);

	return {
		pageTranslation,
		sectionGroup: pageSectionGroup,
		sections: sectionsWithData,
	};
}
