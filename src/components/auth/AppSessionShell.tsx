import type { ReactNode } from "react";
import { getAppSessionState } from "@/lib/auth/app-session";
import { AuthProgressProvider } from "@/lib/auth-progress-context";
import { ProgressProvider } from "@/lib/progress-context";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { HeaderAuthFromSession } from "@/components/ui/HeaderAuth";
import type { AuthProgressState } from "@/lib/auth-progress-context";

function toAuthProgressState(
  session: Awaited<ReturnType<typeof getAppSessionState>>
): AuthProgressState {
  if (session.status === "authenticated") {
    return {
      status: "authenticated",
      identity: session.identity,
      cloudProgress: session.cloudProgress,
    };
  }
  return { status: "anonymous", identity: null, cloudProgress: null };
}

/**
 * Server shell: resolves Better Auth + cloud progression once, then hydrates
 * the client provider with that snapshot (no post-mount anonymous flash).
 */
export async function AppSessionShell({ children }: { children: ReactNode }) {
  const session = await getAppSessionState();
  const initialState = toAuthProgressState(session);
  const providerKey =
    session.status === "authenticated"
      ? `auth:${session.identity.userId}:${session.cloudProgress.xp}`
      : "anonymous";

  return (
    <AuthProgressProvider key={providerKey} initialState={initialState}>
      <ProgressProvider>
        <SiteHeader
          authSlot={<HeaderAuthFromSession session={session} />}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
        <SiteFooter />
      </ProgressProvider>
    </AuthProgressProvider>
  );
}
