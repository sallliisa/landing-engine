import type { User } from "@prisma/client"
import prisma from "./prisma"
import { exception } from "./response"

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

// Handle CORS preflight requests
export function handleCorsPreflightRequest(): Response {
  return new Response(null, { headers: corsHeaders })
}

// Add CORS headers to response
export function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Check if route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  const publicPaths = ['/api/public', '/api/login']
  return !publicPaths.some(path => pathname.startsWith(path))
}

export async function findUser(token?: string): Promise<App.Locals['user'] | null> {
  if (!token) return null
  
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: true
            }
          },
        }
      },
    }
  });
  if (!session) return null
  return session.user;
}

export async function handleProtectedRoute(request: Request): Promise<App.Locals['user']> {
  const token = request.headers.get('Authorization')?.split(' ')[1]
  const user = await findUser(token) 
  if (!user) {
    throw exception('Unauthorized', 401)
  }
  return user
}