"use client";

import type { ReactNode } from "react";
import { AuthProgressProvider } from "@/lib/auth-progress-context";
import { ProgressProvider } from "@/lib/progress-context";

/**
 * Suspense fallback while AppSessionShell resolves.
 * No chrome — route layouts own headers once session streams in.
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
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </ProgressProvider>
    </AuthProgressProvider>
  );
}
