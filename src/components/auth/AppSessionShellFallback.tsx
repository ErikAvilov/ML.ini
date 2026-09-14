"use client";

import type { ReactNode } from "react";
import { AuthProgressProvider } from "@/lib/auth-progress-context";
import { ProgressProvider } from "@/lib/progress-context";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { HeaderAuthFallback } from "@/components/ui/HeaderAuthFallback";

/**
 * Suspense fallback while AppSessionShell resolves.
 * Auth chrome = skeleton only (never SIGN IN / never local XP as truth).
 */
export function AppSessionShellFallback({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProgressProvider
      initialState={{
        status: "loading",
        identity: null,
        cloudProgress: null,
      }}
    >
      <ProgressProvider>
        <SiteHeader authSlot={<HeaderAuthFallback />} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <SiteFooter />
      </ProgressProvider>
    </AuthProgressProvider>
  );
}
