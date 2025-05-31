import prisma from "$lib/utils/prisma";
import type { User, Role } from "@prisma/client";

export type CurrentUser = (User & { role: Role }) | null;

export async function getCurrentUser(cookies: Record<string, string>): Promise<CurrentUser> {
  const sessionToken = cookies['session_token'];
  
  if (!sessionToken) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { 
        user: {
          include: {
            role: true
          }
        } 
      }
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}
