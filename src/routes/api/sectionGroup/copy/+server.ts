import prisma from '$lib/utils/prisma.js';
import { success } from '$lib/utils/response.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { source_id, destination_id } = await request.json();

  if (!source_id || !destination_id) {
    return json({ error: 'source_id and destination_id are required' }, { status: 400 });
  }

  // Delete all data in the destination section group
  // 1. Find all sections in the destination group
  const destSections = await prisma.section.findMany({
    where: { section_group_id: destination_id }
  });

  for (const section of destSections) {
    // Delete all contents linked to this section
    await prisma.content.deleteMany({ where: { section_id: section.id } });

    // Delete all galleries and their contents
    const galleries = await prisma.gallery.findMany({ where: { section_id: section.id } });
    for (const gallery of galleries) {
      await prisma.content.deleteMany({ where: { gallery_id: gallery.id } });
      await prisma.gallery.delete({ where: { id: gallery.id } });
    }
  }

  // Delete all sections in the destination group (children first)
  await prisma.section.deleteMany({ where: { section_group_id: destination_id } });

  // Helper to recursively copy a section and its children
  async function copySection(section: any, newSectionGroupId: string, parentSectionId: string | null = null) {
    // Copy the section itself
    const { id, ...sectionData } = section;
    const newSection = await prisma.section.create({
      data: {
        ...sectionData,
        section_group_id: newSectionGroupId,
        parent_section_id: parentSectionId,
      }
    });

    // Copy contents
    const contents = await prisma.content.findMany({ where: { section_id: section.id } });
    for (const content of contents) {
      const { id: contentId, ...contentData } = content;
      await prisma.content.create({
        data: {
          ...contentData,
          section_id: newSection.id,
        }
      });
    }

    // Copy galleries
    const galleries = await prisma.gallery.findMany({ where: { section_id: section.id } });
    for (const gallery of galleries) {
      const { id: galleryId, ...galleryData } = gallery;
      const newGallery = await prisma.gallery.create({
        data: {
          ...galleryData,
          section_id: newSection.id,
        }
      });

      // Copy gallery contents
      const galleryContents = await prisma.content.findMany({ where: { gallery_id: gallery.id } });
      for (const gContent of galleryContents) {
        const { id: gContentId, ...gContentData } = gContent;
        await prisma.content.create({
          data: {
            ...gContentData,
            gallery_id: newGallery.id,
            section_id: newSection.id,
          }
        });
      }
    }

    // Copy child sections recursively
    const childSections = await prisma.section.findMany({ where: { parent_section_id: section.id } });
    for (const child of childSections) {
      await copySection(child, newSectionGroupId, newSection.id);
    }
  }

  // Get all top-level sections in the source group
  const sourceSections = await prisma.section.findMany({
    where: {
      section_group_id: source_id,
      parent_section_id: null,
    }
  });

  // Copy each section (and its children) to the destination group
  for (const section of sourceSections) {
    await copySection(section, destination_id, null);
  }

  return success({ success: true });
}