import { auth } from '$lib/auth';
import { isTrustedOrigin } from '$lib/server/trusted-origins';
import prisma from './prisma';
import { exception } from './response';

export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


export function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  return isTrustedOrigin(origin) ? origin : null;
}

export function handleCorsPreflightRequest(request: Request): Response {
  const response = new Response(null, { status: 204 });
  return addCorsHeaders(response, request);
}

export function addCorsHeaders(response: Response, request: Request): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Max-Age', '86400');

  const requestedHeaders = request.headers.get('access-control-request-headers');
  if (requestedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', requestedHeaders);
  }

  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export function isProtectedRoute(pathname: string): boolean {
  const publicPaths = ['/api/public', '/api/auth'];
  return !publicPaths.some((path) => pathname.startsWith(path));
}

export async function findUserById(userId?: number | string | null): Promise<App.Locals['user']> {
  if (!userId) return null;

  const normalizedUserId = typeof userId === 'string' ? Number(userId) : userId;
  if (!normalizedUserId || Number.isNaN(normalizedUserId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: normalizedUserId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  return user || null;
}

export function isPrivilegedUser(user: App.Locals['user']): boolean {
  if (!user) return false;

  return user.role.role_group_id === 1;
}

export async function hydrateRequestAuth(event: { request: Request; locals: App.Locals }) {
  const authSession = await auth.api.getSession({
    headers: event.request.headers,
  });

  event.locals.auth = authSession;
  event.locals.user = await findUserById(authSession?.user?.id);
  event.locals.isPrivilegedRole = isPrivilegedUser(event.locals.user);
}

export function requireAuthenticatedUser(locals: App.Locals): NonNullable<App.Locals['user']> {
  if (!locals.user) {
    throw exception('Unauthorized', 401);
  }

  return locals.user;
}

export function hasPermission(locals: App.Locals, permission?: string): boolean {
  if (!permission) return true;
  if (locals.isPrivilegedRole) return true;
  return Boolean(locals.user?.role.permissions.some((item) => item.code === permission));
}

export function requirePermission(locals: App.Locals, permission?: string) {
  requireAuthenticatedUser(locals);

  if (!hasPermission(locals, permission)) {
    throw exception('Forbidden', 403);
  }
}
