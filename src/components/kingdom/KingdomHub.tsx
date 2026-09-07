"use client";

import { PlayerStatsBar } from "@/components/kingdom/PlayerStatsBar";
import { MissionPath } from "@/components/kingdom/MissionPath";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";
import { useLocale } from "@/i18n/locale-context";

export function KingdomHub() {
  const { progress, ready } = useProgress();
  const { locale, messages, t } = useLocale();
  const kingdom = createKingdomConstruireAvecIA(locale);
  const allMissions = getMissions(locale);
  const kingdomMissions = kingdom.missionIds
    .map((id) => allMissions.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const completed = ready
    ? kingdomMissions.filter((m) =>
        progress.completedMissions.includes(m.id)
      ).length
    : 0;
  const total = kingdomMissions.length;
  const active = kingdomMissions.find((m) => {
    if (!ready) return m.order === 1;
    return getMissionStatus(m.id, progress, m.order) === "available";
  });
  const boss = kingdomMissions.find((m) => m.kind === "boss");

  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">
            {messages.kingdomFreeAccess}
          </p>
          <h1 className="font-display text-4xl leading-[1.05] text-fog sm:text-5xl">
            {kingdom.name}
          </h1>
          <p className="mt-3 text-lg text-mist">{kingdom.subtitle}</p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist/90">
            {kingdom.description}
          </p>
        </div>

        <div className="mb-10 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <PlayerStatsBar />
          <div className="rounded-xl border border-line bg-panel/70 p-4 backdrop-blur-md">
            <p className="font-mono text-[10px] tracking-[0.18em] text-mist uppercase">
              {messages.kingdomProgress}
            </p>
            <p className="mt-2 font-display text-2xl text-fog">
              {completed}{" "}
              <span className="text-mist">/ {total}</span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-soft">
              <div
                className="h-full rounded-full bg-signal transition-all duration-700"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-mist">
              {messages.activeMission}{" "}
              <span className="text-signal">
                {active?.title ?? "—"}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-fog">
              {messages.expeditionMap}
            </h2>
            <p className="mt-1 text-sm text-mist">
              {t(messages.expeditionHint, {
                boss: boss?.title ?? "",
              })}
            </p>
          </div>
        </div>

        <MissionPath missions={kingdomMissions} />
      </div>
    </div>
  );
}
