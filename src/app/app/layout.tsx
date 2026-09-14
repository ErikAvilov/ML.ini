import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { getAppSessionState } from "@/lib/auth/app-session";
import { HeaderAuthFromSession } from "@/components/ui/HeaderAuth";

/**
 * Real `/app` segment layout (not a route group).
 * Providers come from root AppSessionShell; this only adds app chrome + theme scope.
 */
export default async function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAppSessionState();

  return (
    <AppShell
      authSlot={
        <HeaderAuthFromSession session={session} showProgress={false} />
      }
    >
      {children}
    </AppShell>
  );
}
