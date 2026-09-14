import { getSkillById, getSkillIdForMission } from "@/data/skills/tree";
import type { Locale } from "@/i18n/config";
import {
  getContinueMissionId,
  getMissionStatus,
} from "@/lib/progression";
import { isSkillUnlockedByProgress } from "@/lib/skills";
import type {
  KingdomDefinition,
  MissionDefinition,
  PlayerProgress,
  SkillDefinition,
} from "@/lib/types";

export type KingdomPathStatus = "completed" | "active" | "locked";

export type WorldKingdomSnapshot = {
  kingdom: KingdomDefinition;
  status: KingdomPathStatus;
  /** Non-intro missions in this kingdom (includes coming-soon placeholders). */
  coreMissions: MissionDefinition[];
  completedCoreCount: number;
  totalCoreCount: number;
  continueMission: MissionDefinition | null;
  /** Temporary production href until /app/kingdom/.../mission ships. */
  continueHref: string | null;
  /** Next 1–2 missions after the action mission (compact preview only). */
  upcomingMissions: MissionDefinition[];
};

export type WorldSnapshot = {
  kingdoms: WorldKingdomSnapshot[];
  activeKingdom: WorldKingdomSnapshot | null;
  /** Next canonical kingdom after the active one, if any. */
  nextKingdom: WorldKingdomSnapshot | null;
  upcomingSkills: SkillDefinition[];
  curriculumCompleted: number;
  curriculumTotal: number;
  /** True when the learner has no completed non-intro missions. */
  isNewLearner: boolean;
};

function coreMissionsForKingdom(
  kingdom: KingdomDefinition,
  missionsById: Map<string, MissionDefinition>
): MissionDefinition[] {
  return kingdom.missionIds
    .map((id) => missionsById.get(id))
    .filter((m): m is MissionDefinition => m != null && m.kind !== "intro");
}

function isKingdomCompleted(
  core: MissionDefinition[],
  progress: PlayerProgress
): boolean {
  if (core.length === 0) return false;
  // Kingdom complete when every *playable* core mission is done.
  // Coming-soon placeholders must not block completion forever.
  const playable = core.filter((m) => m.playable);
  const required = playable.length > 0 ? playable : core;
  return required.every((m) => progress.completedMissions.includes(m.id));
}

/**
 * Prefer the first available (incomplete) mission; else fall back to
 * getContinueMissionId (lastPlayed / last unlocked) for review continuity.
 */
export function resolveNextActionMissionId(
  progress: PlayerProgress,
  missions: Array<{ id: string; order: number }>
): string | null {
  const sorted = [...missions].sort((a, b) => a.order - b.order);
  for (const m of sorted) {
    if (getMissionStatus(m.id, progress, m.order) === "available") {
      return m.id;
    }
  }
  return getContinueMissionId(progress, missions);
}

/**
 * Resolve World path state from canonical kingdoms + effective progress.
 * Supports N kingdoms; locked only appears for kingdoms after the active one.
 */
export function resolveWorldSnapshot(input: {
  kingdoms: KingdomDefinition[];
  missions: MissionDefinition[];
  progress: PlayerProgress;
  locale: Locale;
}): WorldSnapshot {
  const { kingdoms, missions, progress, locale } = input;
  const missionsById = new Map(missions.map((m) => [m.id, m]));

  let activeIndex = -1;
  const snapshots: WorldKingdomSnapshot[] = kingdoms.map((kingdom, index) => {
    const core = coreMissionsForKingdom(kingdom, missionsById);
    const completedCoreCount = core.filter((m) =>
      progress.completedMissions.includes(m.id)
    ).length;
    const completed = isKingdomCompleted(core, progress);

    let status: KingdomPathStatus;
    if (completed) {
      status = "completed";
    } else if (activeIndex === -1) {
      status = "active";
      activeIndex = index;
    } else {
      status = "locked";
    }

    const kingdomMissions = kingdom.missionIds
      .map((id) => missionsById.get(id))
      .filter((m): m is MissionDefinition => m != null);

    const actionId =
      status === "locked"
        ? null
        : resolveNextActionMissionId(progress, kingdomMissions);
    const continueMission = actionId
      ? (missionsById.get(actionId) ?? null)
      : null;

    return {
      kingdom,
      status,
      coreMissions: core,
      completedCoreCount,
      totalCoreCount: core.length,
      continueMission,
      continueHref: continueMission
        ? `/app/kingdom/${kingdom.id}/mission/${continueMission.slug}`
        : null,
      upcomingMissions: resolveUpcomingMissionsPreview({
        core,
        continueMissionId: continueMission?.id ?? null,
        limit: 2,
      }),
    };
  });

  // If every kingdom is completed, keep the last one as the focus surface.
  if (activeIndex === -1 && snapshots.length > 0) {
    activeIndex = snapshots.length - 1;
  }

  const activeKingdom =
    activeIndex >= 0 ? (snapshots[activeIndex] ?? null) : null;
  const nextKingdom =
    activeIndex >= 0 && activeIndex + 1 < snapshots.length
      ? (snapshots[activeIndex + 1] ?? null)
      : null;

  const curriculumCompleted = snapshots.reduce(
    (n, k) => n + k.completedCoreCount,
    0
  );
  const curriculumTotal = snapshots.reduce((n, k) => n + k.totalCoreCount, 0);

  const isNewLearner = !progress.completedMissions.some((id) => {
    const m = missionsById.get(id);
    return Boolean(m && m.kind !== "intro");
  });

  return {
    kingdoms: snapshots,
    activeKingdom,
    nextKingdom,
    upcomingSkills: resolveUpcomingSkillUnlocks({
      progress,
      missions,
      locale,
      continueMissionId: activeKingdom?.continueMission?.id ?? null,
      limit: 3,
    }),
    curriculumCompleted,
    curriculumTotal,
    isNewLearner,
  };
}

/**
 * Compact preview: the next 1–2 missions after the current action mission.
 * If the action mission is intro (not in core), preview starts at the first core missions.
 */
export function resolveUpcomingMissionsPreview(input: {
  core: MissionDefinition[];
  continueMissionId: string | null;
  limit?: number;
}): MissionDefinition[] {
  const limit = input.limit ?? 2;
  const sorted = [...input.core].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return [];

  const continueInCore = input.continueMissionId
    ? sorted.findIndex((m) => m.id === input.continueMissionId)
    : -1;

  const after =
    continueInCore >= 0 ? sorted.slice(continueInCore + 1) : sorted;

  const playableFirst = [
    ...after.filter((m) => m.playable),
    ...after.filter((m) => !m.playable),
  ];
  return playableFirst.slice(0, limit);
}

/**
 * Skills that the next few reachable missions prove — omit unlocked ones.
 */
export function resolveUpcomingSkillUnlocks(input: {
  progress: PlayerProgress;
  missions: MissionDefinition[];
  locale: Locale;
  continueMissionId: string | null;
  limit?: number;
}): SkillDefinition[] {
  const { progress, missions, locale, continueMissionId } = input;
  const limit = input.limit ?? 3;
  const sorted = [...missions].sort((a, b) => a.order - b.order);
  const start = continueMissionId
    ? Math.max(
        0,
        sorted.findIndex((m) => m.id === continueMissionId)
      )
    : 0;
  const window = sorted.slice(start, start + 8);
  const out: SkillDefinition[] = [];

  for (const mission of window) {
    if (getMissionStatus(mission.id, progress, mission.order) === "locked") {
      break;
    }
    const skillId = getSkillIdForMission(mission.id);
    if (!skillId) continue;
    const skill = getSkillById(skillId, locale);
    if (!skill) continue;
    if (isSkillUnlockedByProgress(skill, progress)) continue;
    out.push(skill);
    if (out.length >= limit) break;
  }

  return out;
}
