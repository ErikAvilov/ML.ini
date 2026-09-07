import type { MissionStatus, PlayerProgress } from "@/lib/types";
import { levelFromXp } from "@/lib/validation";

export const STORAGE_KEY = "mlini-progress-v1";

export const DEFAULT_PROGRESS: PlayerProgress = {
  xp: 0,
  level: 1,
  streak: 3,
  completedMissions: [],
  unlockedMissions: ["mission-01"],
  unlockedSkills: [],
  unlockedCapabilities: [],
  lastPlayedAt: null,
};

export interface MissionRewardMeta {
  skillId?: string;
  capabilityId?: string;
}

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
      unlockedSkills: parsed.unlockedSkills ?? [],
      unlockedCapabilities: parsed.unlockedCapabilities ?? [],
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
  if (order === 1) return "available";
  return "locked";
}

export function completeMission(
  progress: PlayerProgress,
  missionId: string,
  nextMissionId: string | null,
  xpReward: number,
  rewards?: MissionRewardMeta
): PlayerProgress {
  if (progress.completedMissions.includes(missionId)) {
    return progress;
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

  return {
    ...progress,
    xp,
    level: levelFromXp(xp),
    completedMissions,
    unlockedMissions: Array.from(unlockedMissions),
    unlockedSkills: Array.from(unlockedSkills),
    unlockedCapabilities: Array.from(unlockedCapabilities),
    lastPlayedAt: new Date().toISOString(),
  };
}
