import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

/**
 * Delete the currently authenticated Better Auth user.
 * Neon public rows cascade via FK ON DELETE CASCADE.
 * Never accepts a client-supplied target user ID.
 */
export async function deleteAccountForUser(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  await auth.api.deleteUser({
    headers: await headers(),
    body: {},
  });
}
