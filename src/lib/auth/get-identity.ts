import "server-only";

import { cache } from "react";
import { getAppSessionState } from "@/lib/auth/app-session";
import type { AuthIdentity } from "@/lib/auth/types";

/**
 * Full MLINI identity for SSR shell (navbar, profile, gates).
 * Delegates to getAppSessionState (request-memoized).
 * Session errors never masquerade as anonymous — only a missing session does.
 */
export const getAuthIdentity = cache(async (): Promise<AuthIdentity | null> => {
  const session = await getAppSessionState();
  return session.status === "authenticated" ? session.identity : null;
});
