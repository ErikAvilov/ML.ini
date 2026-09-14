import { getSkillById, getSkillIdForMission } from "@/data/skills/tree";
import type { Locale } from "@/i18n/config";
import { getMissionStatus } from "@/lib/progression";
import {
  resolveNextActionMissionId,
  resolveUpcomingSkillUnlocks,
} from "@/lib/world/resolve-world";
import { appMissionPath } from "@/lib/missions/mission-routes";
import type {
  KingdomDefinition,
  MissionDefinition,
  MissionStatus,
  PlayerProgress,
  SkillDefinition,
} from "@/lib/types";

export type KingdomMissionSnapshot = {
  mission: MissionDefinition;
  status: MissionStatus;
  /** Sole pathway focus — owns the page Continue CTA. */
  isCurrent: boolean;
  /** 1-based index in the kingdom mission list (order readability). */
  pathIndex: number;
  skillUnlock: SkillDefinition | null;
  href: string | null;
};

export type KingdomSnapshot = {
  kingdom: KingdomDefinition;
  missions: KingdomMissionSnapshot[];
  current: KingdomMissionSnapshot | null;
  continueHref: string | null;
  completedCoreCount: number;
  totalCoreCount: number;
  /** Canonical boss mission when present (`kind: "boss"`). */
  boss: KingdomMissionSnapshot | null;
  upcomingSkills: SkillDefinition[];
  isNewLearner: boolean;
  isComplete: boolean;
};

function coreMissions(
  missions: MissionDefinition[]
): MissionDefinition[] {
  return missions.filter((m) => m.kind !== "intro");
}

function isKingdomComplete(
  core: MissionDefinition[],
  progress: PlayerProgress
): boolean {
  if (core.length === 0) return false;
  const playable = core.filter((m) => m.playable);
  const required = playable.length > 0 ? playable : core;
  return required.every((m) => progress.completedMissions.includes(m.id));
}

/**
 * Resolve one Kingdom pathway from canonical data + effective progress.
 * Does not invent curriculum — unknown mission ids in the kingdom list are skipped.
 */
export function resolveKingdomSnapshot(input: {
  kingdom: KingdomDefinition;
  missions: MissionDefinition[];
  progress: PlayerProgress;
  locale: Locale;
}): KingdomSnapshot {
  const { kingdom, missions, progress, locale } = input;
  const byId = new Map(missions.map((m) => [m.id, m]));

  const ordered = kingdom.missionIds
    .map((id) => byId.get(id))
    .filter((m): m is MissionDefinition => m != null);

  const actionId = resolveNextActionMissionId(progress, ordered);
  const core = coreMissions(ordered);
  const completedCoreCount = core.filter((m) =>
    progress.completedMissions.includes(m.id)
  ).length;
  const complete = isKingdomComplete(core, progress);

  const items: KingdomMissionSnapshot[] = ordered.map((mission, index) => {
    const status = getMissionStatus(mission.id, progress, mission.order);
    const skillId = getSkillIdForMission(mission.id);
    const skillUnlock = skillId
      ? (getSkillById(skillId, locale) ?? null)
      : null;

    return {
      mission,
      status,
      isCurrent: actionId != null && mission.id === actionId,
      pathIndex: index + 1,
      skillUnlock,
      href:
        status === "locked" || !mission.playable
          ? null
          : appMissionPath(kingdom.id, mission.slug),
    };
  });

  const current = items.find((m) => m.isCurrent) ?? null;
  const boss = items.find((m) => m.mission.kind === "boss") ?? null;

  const isNewLearner = !progress.completedMissions.some((id) => {
    const m = byId.get(id);
    return Boolean(m && m.kind !== "intro");
  });

  return {
    kingdom,
    missions: items,
    current,
    continueHref: current?.href ?? null,
    completedCoreCount,
    totalCoreCount: core.length,
    boss,
    upcomingSkills: resolveUpcomingSkillUnlocks({
      progress,
      missions: ordered,
      locale,
      continueMissionId: current?.mission.id ?? null,
      limit: 3,
    }),
    isNewLearner,
    isComplete: complete,
  };
}
