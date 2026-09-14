"use client";

import Link from "next/link";
import { getMissionStatus } from "@/lib/progression";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import type { WorldKingdomSnapshot } from "@/lib/world/resolve-world";
import { useLocale } from "@/i18n/locale-context";

interface WorldActiveKingdomProps {
  active: WorldKingdomSnapshot;
  isNewLearner: boolean;
  /** Sole kingdom: taller surface so the path doesn't float in empty canvas. */
  dominant?: boolean;
}

export function WorldActiveKingdom({
  active,
  isNewLearner,
  dominant = false,
}: WorldActiveKingdomProps) {
  const { messages, t } = useLocale();
  const { progress, ready } = useEffectiveProgress();
  const mission = active.continueMission;
  const href = active.continueHref;
  const ctaLabel = isNewLearner
    ? messages.worldStartMission
    : messages.worldContinueMission;

  return (
    <section
      className={`ml-world-active-surface relative border border-ml-state-active p-5 sm:p-7 ${
        dominant
          ? "flex min-h-[min(32rem,calc(100dvh-11.5rem))] flex-col"
          : ""
      }`}
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      aria-labelledby="world-active-kingdom-title"
      aria-current="step"
    >
      <div
        className={`relative z-[1] ${dominant ? "flex min-h-0 flex-1 flex-col" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] tracking-[0.06em] text-ml-state-active uppercase">
            {active.status === "completed"
              ? messages.worldKingdomCompleted
              : messages.worldKingdomActive}
          </span>
          {active.totalCoreCount > 0 && (
            <span className="font-mono text-[11px] text-ml-text-muted">
              {t(messages.worldMissionsProgress, {
                done: active.completedCoreCount,
                total: active.totalCoreCount,
              })}
            </span>
          )}
        </div>

        <h2
          id="world-active-kingdom-title"
          className="font-display mt-2 text-2xl font-semibold text-ml-text-primary sm:text-3xl"
        >
          <Link
            href={`/app/kingdom/${active.kingdom.id}`}
            className="transition-colors hover:text-ml-state-active focus-visible:outline-none"
          >
            {active.kingdom.name}
          </Link>
        </h2>
        {active.kingdom.subtitle && (
          <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {active.kingdom.subtitle}
          </p>
        )}
        <p className="mt-3 max-w-2xl text-[length:var(--ml-text-sm)] text-ml-text-body sm:text-[length:var(--ml-text-base)]">
          {active.kingdom.description}
        </p>
        <Link
          href={`/app/kingdom/${active.kingdom.id}`}
          className="mt-3 inline-flex font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase transition-colors hover:text-ml-text-primary"
        >
          {messages.worldOpenKingdom}
        </Link>

        {mission && href && (
          <div className="mt-6 border-t border-[color-mix(in_srgb,var(--ml-border)_80%,transparent)] pt-5">
            <p className="font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase">
              {messages.worldCurrentMission}
            </p>
            <p className="mt-1.5 text-[length:var(--ml-text-lg)] font-medium text-ml-text-primary">
              {mission.title}
            </p>
            <Link
              href={href}
              className="mt-4 inline-flex items-center border border-ml-state-active bg-ml-state-active px-4 py-2.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse transition-colors duration-150 ease-out hover:bg-ml-state-active-hover focus-visible:outline-none active:opacity-90"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {ctaLabel}
            </Link>
          </div>
        )}

        {active.upcomingMissions.length > 0 && (
          <div
            className={`border-t border-[color-mix(in_srgb,var(--ml-border)_70%,transparent)] pt-4 ${
              dominant ? "mt-auto pt-6" : "mt-6"
            }`}
          >
            <p className="font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase">
              {messages.worldUpNextMissions}
            </p>
            <ul className="mt-2.5 space-y-2">
              {active.upcomingMissions.map((m) => {
                const status = ready
                  ? getMissionStatus(m.id, progress, m.order)
                  : "locked";
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-2.5 text-[length:var(--ml-text-sm)] text-ml-text-muted"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        status === "completed"
                          ? "bg-ml-state-completed"
                          : status === "available"
                            ? "bg-ml-border-strong"
                            : "bg-ml-border"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 truncate">{m.title}</span>
                    {!m.playable && (
                      <span className="shrink-0 font-mono text-[10px] uppercase opacity-70">
                        {messages.worldMissionSoon}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
