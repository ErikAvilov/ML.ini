import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { requireAppSession } from "@/lib/auth/require-app-session";
import { HeaderAuthFromSession } from "@/components/ui/HeaderAuth";

/**
 * Real `/app` segment layout (not a route group).
 * Auth-only: middleware + requireAppSession — no anonymous product UI.
 */
export default async function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAppSession();

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
