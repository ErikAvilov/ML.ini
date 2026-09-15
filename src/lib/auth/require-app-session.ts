import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAppSessionState,
  type AppSessionState,
} from "@/lib/auth/app-session";
import { safeInternalPath } from "@/lib/auth/safe-next";

/**
 * Server gate for the `/app` layout boundary.
 * Prefer proxy cookie redirect first; this catches invalid/stale sessions.
 */
export async function requireAppSession(): Promise<
  Extract<AppSessionState, { status: "authenticated" }>
> {
  const session = await getAppSessionState();
  if (session.status === "authenticated") return session;

  const h = await headers();
  const raw = h.get("x-mlini-pathname") ?? "/app";
  const next = safeInternalPath(raw, "/app");
  redirect(`/auth?next=${encodeURIComponent(next)}`);
}
