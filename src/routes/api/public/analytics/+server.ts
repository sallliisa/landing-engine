import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/utils/prisma';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const eventData = await request.json();

    // Basic validation
    if (!eventData.type) {
      return json({ success: false, error: 'Event type is required' }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type: eventData.type,
        ...eventData
      }
    });

    return json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to process analytics event:', error);
    // Don't return detailed error to the client for security
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

// Disable prerendering for this endpoint
export const prerender = false;
