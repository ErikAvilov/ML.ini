"use client";

import Link from "next/link";
import { Hexagon, Flame, Sparkles, User } from "lucide-react";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";
import { useLocale } from "@/i18n/locale-context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export function SiteHeader() {
  const { progress } = useProgress();
  const { messages, t } = useLocale();
  const xp = xpProgressInLevel(progress.xp);

  return (
    <header className="relative z-30 shrink-0 border-b border-ml-border bg-[color-mix(in_srgb,var(--ml-bg-0)_94%,transparent)] backdrop-blur-md">
      <div className="flex h-12 w-full items-center justify-between gap-4 px-3 sm:px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center border border-ml-border bg-ml-surface-1 text-ml-text-secondary transition group-hover:border-ml-border-strong group-hover:text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              <Hexagon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <span className="font-display text-base text-ml-text">Mlini</span>
          </Link>
          <Link
            href="/royaume"
            className="hidden text-[length:var(--ml-text-sm)] text-ml-text-muted transition hover:text-ml-text sm:inline"
          >
            {messages.kingdomNav}
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <div className="hidden items-center gap-1.5 font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-ml-accent" />
            <span>{t(messages.xpShort, { xp: progress.xp })}</span>
            <span className="text-ml-text-muted">·</span>
            <span>{t(messages.level, { level: xp.level })}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[length:var(--ml-text-xs)] text-ml-reward">
            <Flame className="h-3.5 w-3.5" />
            <span>{progress.streak}</span>
          </div>
          <span
            className="flex h-8 w-8 items-center justify-center border border-ml-border bg-ml-surface-1 text-ml-text-muted"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            title={messages.profileSoon}
          >
            <User className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </header>
  );
}
