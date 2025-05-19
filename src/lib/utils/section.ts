import prisma from '$lib/utils/prisma';
import type { Section } from '@prisma/client';

type StructureItem = {
  type: 'content' | 'gallery' | 'section' | 'sectionGroup';
  order: number;
  config: {
    fields?: string[];
    info?: {
      name?: string;
      description?: string;
    }
    meta?: Record<string, any>;
    structure?: StructureItem[];
    sectionGroupStructure?: StructureItem[];
  }
}

type SectionConfig = {
  meta?: Record<string, any>;
  structure: StructureItem[];
}

export async function buildSectionStructure(parentSection: Section, config: SectionConfig) {
  // Then process the structure
  for (const item of config.structure) {
    switch (item.type) {
      case 'content':
        await prisma.content.create({
          data: {
            order: item.order,
            section_id: parentSection.id
          }
        });
        break;

      case 'gallery':
        await prisma.gallery.create({
          data: {
            order: item.order,
            section_id: parentSection.id
          }
        });
        break;

      case 'section':
        if (item.config.structure) {
          const childSection = await prisma.section.create({
            data: {
              name: item.config.info?.name || `Child of ${parentSection.name}`,
              order: item.order,
              parent_section_id: parentSection.id,
            }
          });
          // Recursively build children with new config structure
          await buildSectionStructure(childSection, {
            structure: item.config.structure 
          });
        }
        break;

      case 'sectionGroup':
        if (item.config.structure) {
          await prisma.sectionGroup.create({
            data: {
              order: item.order,
              parent_section_id: parentSection.id,
            }
          });
        }
        break;
    }
  }
}