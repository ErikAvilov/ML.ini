"use client";

import Link from "next/link";
import { Hexagon, Flame, Sparkles, User } from "lucide-react";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";

export function SiteHeader() {
  const { progress } = useProgress();
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
            Royaume
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center gap-1.5 font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-ml-accent" />
            <span>{progress.xp} XP</span>
            <span className="text-ml-text-muted">·</span>
            <span>Niv. {xp.level}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[length:var(--ml-text-xs)] text-ml-reward">
            <Flame className="h-3.5 w-3.5" />
            <span>{progress.streak}</span>
          </div>
          <span
            className="flex h-8 w-8 items-center justify-center border border-ml-border bg-ml-surface-1 text-ml-text-muted"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            title="Profil (bientôt)"
          >
            <User className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </header>
  );
}
