import prisma from '$lib/utils/prisma.js';
import { success } from '$lib/utils/response';
import { json } from '@sveltejs/kit';

export async function POST({request}) {
  const { source_id, destination_id } = await request.json();

  if (!source_id || !destination_id) {
    return json({ error: 'source_id and destination_id are required' }, { status: 400 });
  }

  const sourceData = await prisma.articleTranslation.findUnique({
    where: { id: source_id },
    select: {
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      thumbnail: true
    }
  });

  if (!sourceData) {
    return json({ error: 'source data not found' }, { status: 404 });
  }

  await prisma.articleTranslation.update({
    where: { id: destination_id },
    data: sourceData
  })

  return success({ success: true });
}