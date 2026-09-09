"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Circle,
  Cog,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { MissionPath } from "@/components/kingdom/MissionPath";
import { PlayerStatsBar } from "@/components/kingdom/PlayerStatsBar";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import { getMissions } from "@/data/missions";
import { MILDRED_CAPABILITY_CATALOG } from "@/data/narrative/mildred-capabilities";
import {
  getSkillById,
  getSkillIdForMission,
} from "@/data/skills/tree";
import { useLocale } from "@/i18n/locale-context";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

export function KingdomHub() {
  const { progress, ready } = useProgress();
  const { locale, messages } = useLocale();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  );
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
  const selectedMission =
    kingdomMissions.find((mission) => mission.id === selectedMissionId) ??
    active ??
    kingdomMissions[0];
  const selectedStatus = selectedMission
    ? ready
      ? getMissionStatus(
          selectedMission.id,
          progress,
          selectedMission.order
        )
      : selectedMission.order === 1
        ? "available"
        : "locked"
    : "locked";

  return (
    <main className="relative min-h-full px-4 py-5 sm:px-6 sm:py-6">
      <header className="mb-6 rounded-ml-lg border border-ml-border bg-ml-surface-1 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-ml border border-ml-border bg-ml-surface-2">
              <span className="h-6 w-6 rotate-45 border-2 border-ml-accent bg-ml-accent-soft" />
            </div>
            <div className="min-w-0">
              <p className="ml-hud text-ml-reward">
                {messages.homeKingdomLabel}
              </p>
              <h1 className="font-display text-3xl leading-tight text-ml-text sm:text-4xl">
                {kingdom.name}
              </h1>
              <p className="mt-1 text-sm text-ml-text-muted">
                {kingdom.subtitle}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[auto_minmax(280px,420px)] sm:items-center">
            <div className="flex items-center gap-2 rounded-ml border border-ml-border bg-ml-surface-2 px-3 py-2 text-sm text-ml-text">
              <Check size={17} className="text-ml-accent" />
              <span>
                {completed} / {total} {messages.navMissions.toLowerCase()}
              </span>
            </div>
            <PlayerStatsBar />
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
        <MissionPath
          missions={kingdomMissions}
          selectedMissionId={selectedMission?.id ?? ""}
          activeMissionId={active?.id}
          onSelectMission={setSelectedMissionId}
        />

        <aside className="grid min-w-0 gap-5">
          {selectedMission && (
            <MissionDetailsPanel
              mission={selectedMission}
              status={selectedStatus}
            />
          )}
          <MildredPanel />
        </aside>
      </div>
    </main>
  );
}

function MissionDetailsPanel({
  mission,
  status,
}: {
  mission: MissionDefinition;
  status: MissionStatus;
}) {
  const { locale, messages, t } = useLocale();
  const isBoss = mission.kind === "boss";
  const skillId = getSkillIdForMission(mission.id);
  const skill = skillId ? getSkillById(skillId, locale) : undefined;
  const statusLabel =
    status === "completed"
      ? messages.missionClearedBadge
      : status === "available"
        ? messages.missionActiveBadge
        : messages.profileLocked;

  return (
    <section
      className={`rounded-ml-lg border bg-ml-surface-1 p-5 ${
        isBoss ? "border-[var(--ml-frame-boss)]" : "border-ml-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-ml-border pb-3">
        <span
          className={`font-mono text-xs ${
            isBoss ? "text-ml-reward" : "text-ml-accent"
          }`}
        >
          {isBoss
            ? `${messages.homeKingdomBoss} · ${mission.order}`
            : `M-${String(mission.order).padStart(2, "0")}`}
        </span>
        <span className="rounded-ml border border-ml-border bg-ml-surface-2 px-2 py-1 text-xs text-ml-text-muted">
          {statusLabel}
        </span>
      </div>

      <h2
        className={`mt-4 font-display text-2xl leading-tight ${
          isBoss ? "text-ml-reward" : "text-ml-text"
        }`}
      >
        {mission.title}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-ml-text-body">
        {mission.brief}
      </p>

      <div className="mt-5 rounded-ml border border-ml-border bg-ml-surface-2 p-4">
        <p className="ml-section-label text-ml-text">
          {messages.missionObjectives}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ml-text-body">
          {mission.objective}
        </p>
      </div>

      <div className={`mt-3 grid gap-3 ${skill ? "sm:grid-cols-2" : ""}`}>
        <div className="rounded-ml border border-ml-border bg-ml-surface-2 p-3">
          <p className="text-xs text-ml-text-muted">
            {messages.missionReward}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-ml-reward">
            +{mission.xpReward} XP
          </p>
        </div>
        {skill && (
          <div className="rounded-ml border border-ml-border bg-ml-surface-2 p-3">
            <p className="text-xs text-ml-text-muted">{skill.category}</p>
            <p className="mt-1 text-sm font-semibold text-ml-accent">
              {skill.displayName}
            </p>
            <p className="mt-1 text-xs text-ml-text-muted">
              {messages.skillFromMission} · {mission.title}
            </p>
          </div>
        )}
      </div>

      {status !== "locked" ? (
        <Link
          href={`/missions/${mission.slug}`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-ml bg-ml-accent px-4 py-3 text-sm font-bold text-[var(--ml-text-on-primary)] transition hover:bg-[var(--ml-accent-bright)]"
        >
          {messages.launchMission}
          <ArrowRight size={17} />
        </Link>
      ) : (
        <p className="mt-5 flex gap-2 text-sm leading-relaxed text-ml-text-muted">
          <LockKeyhole className="mt-0.5 shrink-0" size={16} />
          {t(messages.missionLockedCompletePrev, {
            order: Math.max(1, mission.order - 1),
          })}
        </p>
      )}
    </section>
  );
}

function MildredPanel() {
  const { progress, ready } = useProgress();
  const { locale, messages, t } = useLocale();
  const onlineIds = new Set(ready ? progress.unlockedCapabilities : []);
  const catalogCapabilities = Object.entries(MILDRED_CAPABILITY_CATALOG).map(
    ([id, capability]) => ({
      id,
      label: capability.label[locale],
      online: onlineIds.has(id),
    })
  );
  const futureCapabilities = [
    messages.homeMildredCapParsing,
    messages.homeMildredCapDecision,
    messages.homeMildredCapIntegration,
  ].map((label, index) => ({
    id: `future-${index}`,
    label,
    online: false,
  }));
  const capabilities = [...catalogCapabilities, ...futureCapabilities];
  const onlineCount = catalogCapabilities.filter(
    (capability) => capability.online
  ).length;

  return (
    <section className="rounded-ml-lg border border-ml-border bg-ml-surface-1 p-5">
      <div className="flex items-center justify-between gap-3 border-b border-ml-border pb-3">
        <div className="flex items-center gap-2">
          <Cog size={18} className="text-ml-reward" />
          <h2 className="font-display text-lg text-ml-text">
            {messages.homeMildredTitle}
          </h2>
        </div>
        <span className="font-mono text-xs text-ml-accent">
          {t(messages.mildredModules, {
            online: onlineCount,
            total: capabilities.length,
          })}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ml-text-muted">
        {messages.homeMildredLead}
      </p>
      <ul className="mt-4 grid gap-2">
        {capabilities.map((capability) => (
          <li
            key={capability.id}
            className={`flex items-center justify-between gap-3 rounded-ml border px-3 py-2.5 text-sm ${
              capability.online
                ? "border-[var(--ml-border-accent)] bg-ml-accent-soft text-ml-text"
                : "border-ml-border bg-ml-surface-2 text-ml-text-muted"
            }`}
          >
            <span className="flex items-center gap-2">
              {capability.online ? (
                <Sparkles size={15} className="text-ml-accent" />
              ) : (
                <Circle size={13} />
              )}
              {capability.label}
            </span>
            <span
              className={`font-mono text-xs ${
                capability.online
                  ? "text-ml-accent"
                  : "text-ml-text-muted"
              }`}
            >
              {capability.online
                ? messages.homeMildredOnline
                : messages.homeMildredOffline}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
