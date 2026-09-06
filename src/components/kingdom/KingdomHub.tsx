"use client";

import { PlayerStatsBar } from "@/components/kingdom/PlayerStatsBar";
import { MissionPath } from "@/components/kingdom/MissionPath";
import { kingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { missions } from "@/data/missions";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";

export function KingdomHub() {
  const { progress, ready } = useProgress();
  const kingdom = kingdomConstruireAvecIA;
  const kingdomMissions = kingdom.missionIds
    .map((id) => missions.find((m) => m.id === id))
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

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,214,180,0.09),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(245,178,74,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="map-grid pointer-events-none absolute inset-0 opacity-[0.35]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">
            Royaume · Accès libre
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
              Progression du Royaume
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
              Mission active :{" "}
              <span className="text-signal">
                {active?.title ?? "—"}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-fog">Carte d&apos;expédition</h2>
            <p className="mt-1 text-sm text-mist">
              Suis le chemin jusqu&apos;au Boss — Cœur du Système.
            </p>
          </div>
        </div>

        <MissionPath missions={kingdomMissions} />
      </div>
    </div>
  );
}
