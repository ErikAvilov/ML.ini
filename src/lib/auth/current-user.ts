import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";
import { timed } from "@/lib/perf";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
};

/**
 * Trusted authenticated user from Better Auth session.
 * Request-scoped via React cache() — never reuse across users/requests.
 * Never accept user IDs from the client.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const session = await timed("getSession", async () =>
      auth.api.getSession({
        headers: await headers(),
      })
    );
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
});

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
