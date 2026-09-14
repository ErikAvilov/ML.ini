/**
 * Pure effective-progress resolution (no React / no Neon).
 * Authenticated → cloud only (0 is valid). Anonymous → local.
 * Loading → pending (must not look like anonymous).
 */

import type { PlayerProgress } from "@/lib/types";
import { DEFAULT_PROGRESS } from "@/lib/progression";
import { levelFromXp } from "@/lib/validation";
import { getMissions } from "@/data/missions";
import { DEFAULT_LOCALE } from "@/i18n/config";

export type AuthProgressStatus = "loading" | "anonymous" | "authenticated";
export type ProgressSource = "pending" | "local" | "cloud";

export type EffectiveProgressSnapshot = {
  authStatus: AuthProgressStatus;
  source: ProgressSource;
  /** Ready for unlock/XP UI (false while auth still loading). */
  ready: boolean;
  progress: PlayerProgress;
  localXp: number;
  cloudXp: number | null;
  effectiveXp: number;
};

/**
 * Build PlayerProgress from Neon facts.
 * totalXp=0 and empty completions are valid (new accounts).
 */
export function buildCloudPlayerProgress(input: {
  totalXp: number;
  completedMissionIds: string[];
  lastPlayedMissionId?: string | null;
}): PlayerProgress {
  const totalXp = Math.max(0, Math.floor(input.totalXp));
  const completed = Array.from(new Set(input.completedMissionIds));
  const missions = getMissions(DEFAULT_LOCALE).sort((a, b) => a.order - b.order);
  const unlocked = new Set<string>(["mission-00", "mission-01"]);

  for (const m of missions) {
    if (!completed.includes(m.id)) continue;
    unlocked.add(m.id);
    const next = missions.find((x) => x.order === m.order + 1);
    if (next) unlocked.add(next.id);
  }

  return {
    ...DEFAULT_PROGRESS,
    xp: totalXp,
    level: levelFromXp(totalXp),
    completedMissions: completed,
    unlockedMissions: Array.from(unlocked),
    lastPlayedMissionId: input.lastPlayedMissionId ?? null,
    lastPlayedAt: null,
  };
}

export function emptyCloudProgress(): PlayerProgress {
  return buildCloudPlayerProgress({
    totalXp: 0,
    completedMissionIds: [],
  });
}

/**
 * Single selector — components must not reinvent cloud ?? local.
 */
export function resolveEffectiveProgress(input: {
  authStatus: AuthProgressStatus;
  localProgress: PlayerProgress;
  /** When authenticated, must be a concrete snapshot (never fall back to local). */
  cloudProgress: PlayerProgress | null;
}): EffectiveProgressSnapshot {
  const localXp = input.localProgress.xp;

  if (input.authStatus === "loading") {
    return {
      authStatus: "loading",
      source: "pending",
      ready: false,
      progress: DEFAULT_PROGRESS,
      localXp,
      cloudXp: null,
      effectiveXp: 0,
    };
  }

  if (input.authStatus === "authenticated") {
    const progress = input.cloudProgress ?? emptyCloudProgress();
    return {
      authStatus: "authenticated",
      source: "cloud",
      ready: true,
      progress,
      localXp,
      cloudXp: progress.xp,
      effectiveXp: progress.xp,
    };
  }

  return {
    authStatus: "anonymous",
    source: "local",
    ready: true,
    progress: input.localProgress,
    localXp,
    cloudXp: null,
    effectiveXp: localXp,
  };
}
