import type { ReactNode } from "react";
import { getAppSessionState } from "@/lib/auth/app-session";
import { AuthProgressProvider } from "@/lib/auth-progress-context";
import { ProgressProvider } from "@/lib/progress-context";
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
 * Server shell: Better Auth + cloud progression once.
 * Key is user-stable — never remount on XP/completion or success toasts vanish.
 */
export async function AppSessionShell({ children }: { children: ReactNode }) {
  const session = await getAppSessionState();
  const initialState = toAuthProgressState(session);
  const providerKey =
    session.status === "authenticated"
      ? `auth:${session.identity.userId}`
      : "anonymous";

  return (
    <AuthProgressProvider key={providerKey} initialState={initialState}>
      <ProgressProvider>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </ProgressProvider>
    </AuthProgressProvider>
  );
}
