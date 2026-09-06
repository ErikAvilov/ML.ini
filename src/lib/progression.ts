import type { MissionStatus, PlayerProgress } from "@/lib/types";
import { levelFromXp } from "@/lib/validation";

export const STORAGE_KEY = "mlini-progress-v1";

export const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 0,
  level: 1,
  streak: 3,
  completedMissions: [],
  unlockedMissions: ["mission-01"],
  lastPlayedAt: null,
};

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedMissions: parsed.unlockedMissions?.length
        ? parsed.unlockedMissions
        : ["mission-01"],
      completedMissions: parsed.completedMissions ?? [],
    };
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
  // Mission 1 always available as fallback
  if (order === 1) return "available";
  return "locked";
}

export function completeMission(
  progress: PlayerProgress,
  missionId: string,
  nextMissionId: string | null,
  xpReward: number
): PlayerProgress {
  if (progress.completedMissions.includes(missionId)) {
    return progress;
  }

  const completedMissions = [...progress.completedMissions, missionId];
  const unlockedMissions = new Set(progress.unlockedMissions);
  unlockedMissions.add(missionId);
  if (nextMissionId) unlockedMissions.add(nextMissionId);

  const xp = progress.xp + xpReward;

  return {
    ...progress,
    xp,
    level: levelFromXp(xp),
    completedMissions,
    unlockedMissions: Array.from(unlockedMissions),
    lastPlayedAt: new Date().toISOString(),
  };
}
