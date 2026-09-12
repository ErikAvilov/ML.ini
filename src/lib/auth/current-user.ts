import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

/**
 * Trusted authenticated user from Better Auth session.
 * Never accept user IDs from the client.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) return null;
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
