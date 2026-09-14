"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { useLocale } from "@/i18n/locale-context";
import { getMissionById } from "@/data/missions";

interface SiteHeaderProps {
  /** Server auth chrome (Suspense + HeaderAuth). Non-blocking for page RSC. */
  authSlot: ReactNode;
}

export function SiteHeader({ authSlot }: SiteHeaderProps) {
  const pathname = usePathname();
  const { progress, authStatus } = useEffectiveProgress();
  const { locale, messages } = useLocale();

  if (pathname.startsWith("/missions/")) {
    return null;
  }

  // While auth loads, don't point Missions at local lastPlayed (could be stale anon).
  const lastMission =
    authStatus !== "loading" && progress.lastPlayedMissionId
      ? getMissionById(progress.lastPlayedMissionId, locale)
      : null;
  const missionsLink = lastMission
    ? `/missions/${lastMission.slug}`
    : "/royaume";

  const nav = [
    { href: "/royaume", label: messages.navKingdoms, match: "/royaume" },
    { href: "/skills", label: messages.navTree, match: "/skills" },
    { href: missionsLink, label: messages.navMissions, match: "/missions" },
    { href: "/profil", label: messages.navProfile, match: "/profil" },
  ];

  return (
    <header className="relative z-30 shrink-0 border-b border-ml-border bg-[color-mix(in_srgb,var(--ml-bg-0)_92%,transparent)] backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <BrandLogo compact />
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Principal"
          >
            {nav.map((item) => {
              const active = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-sm px-2.5 py-1.5 text-[length:var(--ml-text-sm)] font-medium transition ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--ml-accent)_18%,transparent)] text-ml-text"
                      : "text-ml-text-muted hover:text-ml-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {authSlot}
        </div>
      </div>
    </header>
  );
}
