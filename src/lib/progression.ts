import type { MissionStatus, PlayerProgress } from "@/lib/types";
import { syncSkillsFromCompletedMissions } from "@/lib/skills";
import { levelFromXp } from "@/lib/validation";
import { resolveUnlockedAchievementIds } from "@/data/profile/achievements";
import { resolveUnlockedFrameIds } from "@/data/profile/frames";
import { resolveUnlockedTitleIds } from "@/data/profile/titles";

export const STORAGE_KEY = "mlini-progress-v1";

export const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  completedMissions: [],
  unlockedMissions: ["mission-00"],
  unlockedSkills: [],
  unlockedCapabilities: [],
  lastPlayedAt: null,
  lastPlayedMissionId: null,
  equippedTitleId: null,
  unlockedTitleIds: [],
  equippedFrameId: "basalt",
  unlockedFrameIds: ["basalt"],
  unlockedAchievementIds: [],
  activityDates: [],
};

export interface MissionRewardMeta {
  skillId?: string;
  capabilityId?: string;
}

function ensureIntroMigration(progress: PlayerProgress): PlayerProgress {
  const completed = new Set(progress.completedMissions);
  const unlocked = new Set(progress.unlockedMissions);

  const coreStarted =
    progress.xp > 0 ||
    [...completed].some((id) => id !== "mission-00") ||
    unlocked.has("mission-01") ||
    (progress.lastPlayedMissionId != null &&
      progress.lastPlayedMissionId !== "mission-00");

  if (coreStarted) {
    // Existing players skip Mission 0 without XP distortion.
    completed.add("mission-00");
    unlocked.add("mission-00");
    unlocked.add("mission-01");
  } else {
    unlocked.add("mission-00");
  }

  return {
    ...progress,
    completedMissions: Array.from(completed),
    unlockedMissions: Array.from(unlocked),
  };
}

function normalizeProgress(parsed: Partial<PlayerProgress>): PlayerProgress {
  const streak = Math.max(Number(parsed.streak) || 0, 0);
  const base: PlayerProgress = {
    ...DEFAULT_PROGRESS,
    ...parsed,
    streak,
    bestStreak: Math.max(Number(parsed.bestStreak) || streak, streak),
    unlockedMissions: parsed.unlockedMissions?.length
      ? parsed.unlockedMissions
      : ["mission-00"],
    completedMissions: parsed.completedMissions ?? [],
    unlockedSkills: parsed.unlockedSkills ?? [],
    unlockedCapabilities: parsed.unlockedCapabilities ?? [],
    lastPlayedAt: parsed.lastPlayedAt ?? null,
    lastPlayedMissionId: parsed.lastPlayedMissionId ?? null,
    equippedTitleId: parsed.equippedTitleId ?? null,
    unlockedTitleIds: parsed.unlockedTitleIds ?? [],
    equippedFrameId: parsed.equippedFrameId ?? "basalt",
    unlockedFrameIds: parsed.unlockedFrameIds ?? ["basalt"],
    unlockedAchievementIds: parsed.unlockedAchievementIds ?? [],
    activityDates: (parsed.activityDates ?? []).filter((date) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ),
  };

  const withIntro = ensureIntroMigration(base);

  const unlockedTitleIds = Array.from(
    new Set([...withIntro.unlockedTitleIds, ...resolveUnlockedTitleIds(withIntro)])
  );
  const unlockedFrameIds = Array.from(
    new Set([...withIntro.unlockedFrameIds, ...resolveUnlockedFrameIds(withIntro)])
  );

  return {
    ...withIntro,
    unlockedSkills: syncSkillsFromCompletedMissions(withIntro),
    unlockedTitleIds,
    equippedTitleId:
      withIntro.equippedTitleId &&
      unlockedTitleIds.includes(withIntro.equippedTitleId)
        ? withIntro.equippedTitleId
        : null,
    unlockedFrameIds,
    equippedFrameId: unlockedFrameIds.includes(withIntro.equippedFrameId)
      ? withIntro.equippedFrameId
      : "basalt",
    unlockedAchievementIds: Array.from(
      new Set([
        ...withIntro.unlockedAchievementIds,
        ...resolveUnlockedAchievementIds(withIntro),
      ])
    ),
  };
}

function recordActivity(progress: PlayerProgress, now: Date): string[] {
  const date = now.toISOString().slice(0, 10);
  return progress.activityDates.includes(date)
    ? progress.activityDates
    : [...progress.activityDates, date];
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return normalizeProgress(parsed);
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getMissionStatus(
  missionId: string,
  progress: PlayerProgress,
  order: number
): MissionStatus {
  if (progress.completedMissions.includes(missionId)) return "completed";
  if (progress.unlockedMissions.includes(missionId)) return "available";
  if (order === 0) return "available";
  return "locked";
}

export function completeMission(
  progress: PlayerProgress,
  missionId: string,
  nextMissionId: string | null,
  xpReward: number,
  rewards?: MissionRewardMeta
): PlayerProgress {
  const now = new Date();
  if (progress.completedMissions.includes(missionId)) {
    return normalizeProgress({
      ...progress,
      lastPlayedMissionId: missionId,
      lastPlayedAt: now.toISOString(),
      activityDates: recordActivity(progress, now),
    });
  }

  const completedMissions = [...progress.completedMissions, missionId];
  const unlockedMissions = new Set(progress.unlockedMissions);
  unlockedMissions.add(missionId);
  if (nextMissionId) unlockedMissions.add(nextMissionId);

  const unlockedSkills = new Set(progress.unlockedSkills);
  if (rewards?.skillId) unlockedSkills.add(rewards.skillId);

  const unlockedCapabilities = new Set(progress.unlockedCapabilities);
  if (rewards?.capabilityId) unlockedCapabilities.add(rewards.capabilityId);

  const xp = progress.xp + xpReward;

  const next: PlayerProgress = {
    ...progress,
    xp,
    level: levelFromXp(xp),
    completedMissions,
    unlockedMissions: Array.from(unlockedMissions),
    unlockedSkills: Array.from(unlockedSkills),
    unlockedCapabilities: Array.from(unlockedCapabilities),
    lastPlayedAt: now.toISOString(),
    lastPlayedMissionId: missionId,
    activityDates: recordActivity(progress, now),
  };

  return normalizeProgress(next);
}

/** Record that the player opened / played a mission (QoL Continue). */
export function touchLastPlayedMission(
  progress: PlayerProgress,
  missionId: string
): PlayerProgress {
  const now = new Date();
  const activityDates = recordActivity(progress, now);
  if (
    progress.lastPlayedMissionId === missionId &&
    progress.lastPlayedAt &&
    activityDates === progress.activityDates
  ) {
    return progress;
  }
  return {
    ...progress,
    lastPlayedMissionId: missionId,
    lastPlayedAt: now.toISOString(),
    activityDates,
  };
}

/** Highest-order unlocked (available or completed) mission id. */
export function getLastUnlockedMissionId(
  progress: PlayerProgress,
  missions: Array<{ id: string; order: number }>
): string | null {
  const sorted = [...missions].sort((a, b) => a.order - b.order);
  let last: string | null = null;
  for (const m of sorted) {
    const status = getMissionStatus(m.id, progress, m.order);
    if (status === "locked") break;
    last = m.id;
  }
  return last;
}

/**
 * Prefer lastPlayed if still reachable; else last unlocked.
 * Ready for a future Dashboard "Continue learning" CTA.
 */
export function getContinueMissionId(
  progress: PlayerProgress,
  missions: Array<{ id: string; order: number }>
): string | null {
  const lastPlayed = progress.lastPlayedMissionId;
  if (lastPlayed) {
    const m = missions.find((x) => x.id === lastPlayed);
    if (m) {
      const status = getMissionStatus(m.id, progress, m.order);
      if (status !== "locked") return lastPlayed;
    }
  }
  return getLastUnlockedMissionId(progress, missions);
}
