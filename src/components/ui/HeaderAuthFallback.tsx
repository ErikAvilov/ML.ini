"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";
import { useLocale } from "@/i18n/locale-context";

/** Instant header chrome while server auth identity streams in. */
export function HeaderAuthFallback() {
  const pathname = usePathname();
  const { progress } = useProgress();
  const { messages, t } = useLocale();
  const xp = xpProgressInLevel(progress.xp);
  const pct = Math.round((xp.current / Math.max(xp.needed, 1)) * 100);

  return (
    <>
      <div
        className="hidden items-center gap-2.5 border border-ml-border bg-ml-surface-1 px-2.5 py-1.5 sm:flex"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        <span className="font-mono text-[length:var(--ml-text-xs)] font-semibold text-ml-secondary">
          {t(messages.levelShort, { level: xp.level })}
        </span>
        <span className="text-ml-border-strong">·</span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-14 overflow-hidden rounded-full bg-ml-border">
            <div
              className="h-full rounded-full bg-ml-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ml-text-muted">
            {t(messages.xpShort, { xp: progress.xp })}
          </span>
        </div>
      </div>
      <Link
        href={`/auth?next=${encodeURIComponent(pathname || "/")}`}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-ml-border bg-ml-surface-2"
        aria-label={messages.authSignIn}
      />
    </>
  );
}
