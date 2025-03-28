import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sequence } from '@sveltejs/kit/hooks';
import { addCorsHeaders, handleCorsPreflightRequest, handleProtectedRoute, isProtectedRoute, validateToken } from '$lib/utils/routing';

const handleParaglide: Handle = ({ event, resolve }) => paraglideMiddleware(event.request, ({ request, locale }) => {
	event.request = request;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
	});
});

export const customHandle: Handle = async ({ resolve, event }) => {
  const { url, request } = event
  
  // Handle API routes
  if (url.pathname.startsWith('/api')) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') return handleCorsPreflightRequest()
    // Check authentication for protected routes
    if (isProtectedRoute(url.pathname)) {
      const response = await handleProtectedRoute(request)
      if (response) return response
    }
  }

  // Process the request and add CORS headers
  const response = await resolve(event)
  return addCorsHeaders(response)
}

export const handle = sequence(customHandle, handleParaglide)
