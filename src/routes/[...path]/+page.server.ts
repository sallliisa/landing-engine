import prisma from '$lib/utils/prisma.js'
import { error } from '@sveltejs/kit'
import {sectionLoaders} from './sections/index.js'

function getCurrentPageSectionGroup(menu: any[], pathname: string[]) {
  for (const menuItem of menu) {
    if (menuItem.slug === pathname[0]) {
      if (pathname.length === 1) return menuItem.page[0]?.translations[0].sectionGroups[0].id || null
      return getCurrentPageSectionGroup(menuItem.children, pathname.slice(1))
    }
  }
}

export async function load({ params, parent, url }) {
  const parentData = await parent()
  const currentPageSectionGroup = getCurrentPageSectionGroup(parentData.rawMenu, url.pathname.split('/').slice(1))
  console.log('currentPageSectionGroup', currentPageSectionGroup)
  if (!currentPageSectionGroup) throw error(404, 'Page not found')
  const pageSectionGroup = await prisma.sectionGroup.findUnique({
    where: {
      id: currentPageSectionGroup
    },
    include: {
      sections: true
    }
  })
  if (!pageSectionGroup) throw error(500, 'Section group not found')

  // console.log('sections', pageSectionGroup)

  // For each section, call its loader and attach sectionData
  const sectionsWithData = await Promise.all(
    pageSectionGroup.sections.map(async (section) => {
      if (!section.section_type_code) return section
      const loader = sectionLoaders[section.section_type_code]
      let sectionData = null
      if (loader) {
        sectionData = await loader(section.id)
      }
      return sectionData
    })
  )

  return { sections: sectionsWithData }
}