"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MliniEmblem } from "@/components/ui/MliniEmblem";
import { useProgress } from "@/lib/progress-context";
import { xpProgressInLevel } from "@/lib/validation";
import { useLocale } from "@/i18n/locale-context";
import { getMissionById } from "@/data/missions";

export function SiteHeader() {
  const pathname = usePathname();
  const { progress } = useProgress();
  const { locale, messages, t } = useLocale();
  const xp = xpProgressInLevel(progress.xp);

  if (pathname.startsWith("/missions/")) {
    return null;
  }

  const lastMission = progress.lastPlayedMissionId
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

  const pct = Math.round((xp.current / Math.max(xp.needed, 1)) * 100);

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
          <LanguageSwitcher />
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
            href="/profil"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ml-border bg-ml-surface-2 transition hover:border-ml-accent"
            aria-label={messages.navProfile}
          >
            <MliniEmblem size={14} title="" />
          </Link>
        </div>
      </div>
    </header>
  );
}
