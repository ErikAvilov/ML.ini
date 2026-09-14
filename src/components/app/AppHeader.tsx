"use client";

import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AppNavItem } from "@/components/app/AppNavItem";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { useLocale } from "@/i18n/locale-context";
import { xpProgressInLevel } from "@/lib/validation";

interface AppHeaderProps {
  authSlot: ReactNode;
}

/**
 * Soft-auth application chrome: World + Skill Tree only.
 * Profile lives in the avatar menu (authSlot).
 */
export function AppHeader({ authSlot }: AppHeaderProps) {
  const { messages } = useLocale();
  const { progress, ready, authStatus } = useEffectiveProgress();

  const showProgress =
    ready && authStatus !== "loading" && typeof progress.xp === "number";
  const xp = showProgress ? xpProgressInLevel(progress.xp) : null;
  const pct = xp
    ? Math.round((xp.current / Math.max(xp.needed, 1)) * 100)
    : 0;

  return (
    <header className="relative z-30 shrink-0 border-b border-ml-border bg-[color-mix(in_srgb,var(--ml-canvas)_92%,transparent)]">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <BrandLogo href="/app" compact />
          <nav
            className="flex items-center gap-1"
            aria-label={messages.appNavLabel}
          >
            <AppNavItem
              href="/app"
              label={messages.navWorld}
              match="/app"
            />
            <AppNavItem
              href="/app/tree"
              label={messages.navSkillTree}
              match="/app/tree"
            />
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {xp && (
            <div
              className="hidden items-center gap-2.5 border border-ml-border bg-ml-surface-1 px-2.5 py-1.5 sm:flex"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
              aria-label={messages.levelShort.replace(
                "{level}",
                String(xp.level)
              )}
            >
              <span className="font-mono text-[length:var(--ml-text-xs)] font-semibold text-ml-text-muted">
                {messages.levelShort.replace("{level}", String(xp.level))}
              </span>
              <span className="text-ml-border-strong" aria-hidden>
                ·
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1 w-14 overflow-hidden rounded-full bg-ml-border">
                  <div
                    className="h-full rounded-full bg-ml-state-active transition-[width] duration-200 ease-out motion-reduce:transition-none"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-ml-text-muted">
                  {messages.xpShort.replace("{xp}", String(progress.xp))}
                </span>
              </div>
            </div>
          )}
          {authSlot}
        </div>
      </div>
    </header>
  );
}
