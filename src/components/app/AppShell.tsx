"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/app/AppHeader";

interface AppShellProps {
  children: ReactNode;
  authSlot: ReactNode;
}

const MISSION_FOCUS_RE = /^\/app\/kingdom\/[^/]+\/mission(\/|$)/;

/**
 * Soft-auth application shell under `/app`.
 * Mission focus mode hides World|Skill Tree chrome and locks overflow like legacy /missions.
 */
export function AppShell({ children, authSlot }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const missionFocus = MISSION_FOCUS_RE.test(pathname);

  return (
    <div
      data-theme="editorial-cartographic"
      className="ml-app flex min-h-full flex-1 flex-col bg-ml-canvas"
    >
      {!missionFocus && <AppHeader authSlot={authSlot} />}
      <div
        className={
          missionFocus
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "min-h-0 flex-1 overflow-y-auto"
        }
      >
        {children}
      </div>
    </div>
  );
}
