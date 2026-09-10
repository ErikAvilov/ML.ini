import type { Locale } from "@/i18n/config";
import { PROFILE_ACHIEVEMENTS } from "@/data/profile/achievements";
import { PROFILE_FRAMES } from "@/data/profile/frames";
import { PROFILE_TITLES } from "@/data/profile/titles";
import type { MissionDefinition, PlayerProgress } from "@/lib/types";
import { xpProgressInLevel } from "@/lib/validation";

export const MILESTONE_LEVELS = [10, 25, 50, 100] as const;

export type ProgressionPopupVariant =
  | "level-up"
  | "level-up-reward"
  | "milestone"
  | "kingdom-complete";

export type ProgressionReward =
  | {
      type: "title";
      id: string;
      name: string;
      rarity?: "standard" | "rare" | "legendary";
    }
  | {
      type: "profile-frame";
      id: string;
      name: string;
      rarity?: "standard" | "rare" | "legendary";
    }
  | {
      type: "achievement";
      id: string;
      name: string;
      rarity?: "standard" | "rare" | "legendary";
    };

export interface ProgressionCelebration {
  id: string;
  variant: ProgressionPopupVariant;
  level?: number;
  previousLevel?: number;
  xpGained?: number;
  currentXpInLevel?: number;
  nextLevelXp?: number;
  /** Primary reward (level-up-reward / milestone) */
  reward?: ProgressionReward;
  /** Up to 3 rewards for kingdom-complete */
  rewards?: ProgressionReward[];
  kingdom?: {
    id: string;
    name: string;
    completedMissions: number;
    totalMissions: number;
  };
}

export function isMilestoneLevel(level: number): boolean {
  return (MILESTONE_LEVELS as readonly number[]).includes(level);
}

function diffIds(before: string[], after: string[]): string[] {
  const prev = new Set(before);
  return after.filter((id) => !prev.has(id));
}

function titleReward(id: string, locale: Locale): ProgressionReward | null {
  const title = PROFILE_TITLES.find((t) => t.id === id);
  if (!title) return null;
  return { type: "title", id, name: title.label[locale], rarity: "rare" };
}

function frameReward(id: string, locale: Locale): ProgressionReward | null {
  const frame = PROFILE_FRAMES.find((f) => f.id === id);
  if (!frame) return null;
  const rarity =
    frame.tone === "reward"
      ? "legendary"
      : frame.tone === "accent"
        ? "rare"
        : "standard";
  return { type: "profile-frame", id, name: frame.label[locale], rarity };
}

function achievementReward(
  id: string,
  locale: Locale
): ProgressionReward | null {
  const achievement = PROFILE_ACHIEVEMENTS.find((a) => a.id === id);
  if (!achievement) return null;
  return {
    type: "achievement",
    id,
    name: achievement.name[locale],
    rarity: achievement.rarity,
  };
}

function collectNewRewards(
  before: PlayerProgress,
  after: PlayerProgress,
  locale: Locale
): ProgressionReward[] {
  const out: ProgressionReward[] = [];
  for (const id of diffIds(before.unlockedTitleIds, after.unlockedTitleIds)) {
    const r = titleReward(id, locale);
    if (r) out.push(r);
  }
  for (const id of diffIds(before.unlockedFrameIds, after.unlockedFrameIds)) {
    const r = frameReward(id, locale);
    if (r) out.push(r);
  }
  for (const id of diffIds(
    before.unlockedAchievementIds,
    after.unlockedAchievementIds
  )) {
    const r = achievementReward(id, locale);
    if (r) out.push(r);
  }
  return out;
}

/**
 * Build 0–1 prestige celebration after a first mission clear.
 * Priority: kingdom-complete > milestone > level-up-reward > level-up
 * Mission success itself uses SuccessToast (bottom-right), not this queue.
 */
export function buildCelebrationsAfterMission(options: {
  wasCleared: boolean;
  before: PlayerProgress;
  after: PlayerProgress;
  xpGained: number;
  mission: MissionDefinition;
  locale: Locale;
  kingdom: {
    id: string;
    name: string;
    missionIds: string[];
  };
}): ProgressionCelebration[] {
  const { wasCleared, before, after, xpGained, mission, locale, kingdom } =
    options;
  if (wasCleared || xpGained <= 0) return [];

  const leveledUp = after.level > before.level;
  const newRewards = collectNewRewards(before, after, locale);
  const xpInLevel = xpProgressInLevel(after.xp);
  const coreMissionIds = kingdom.missionIds.filter((id) => id !== "mission-00");
  const kingdomDone = coreMissionIds.every((id) =>
    after.completedMissions.includes(id)
  );
  const kingdomJustFinished =
    kingdomDone &&
    (mission.kind === "boss" ||
      !coreMissionIds.every((id) => before.completedMissions.includes(id)));

  if (kingdomJustFinished) {
    return [
      {
        id: `kingdom-${kingdom.id}-${after.xp}`,
        variant: "kingdom-complete",
        level: after.level,
        previousLevel: before.level,
        xpGained,
        currentXpInLevel: xpInLevel.current,
        nextLevelXp: xpInLevel.needed,
        rewards: newRewards.slice(0, 3),
        kingdom: {
          id: kingdom.id,
          name: kingdom.name,
          completedMissions: coreMissionIds.filter((id) =>
            after.completedMissions.includes(id)
          ).length,
          totalMissions: coreMissionIds.length,
        },
      },
    ];
  }

  if (!leveledUp) return [];

  const primaryReward = newRewards[0];
  const base = {
    level: after.level,
    previousLevel: before.level,
    xpGained,
    currentXpInLevel: xpInLevel.current,
    nextLevelXp: xpInLevel.needed,
  };

  if (isMilestoneLevel(after.level)) {
    return [
      {
        id: `milestone-${after.level}-${after.xp}`,
        variant: "milestone",
        ...base,
        reward: primaryReward,
      },
    ];
  }

  if (primaryReward) {
    return [
      {
        id: `level-reward-${after.level}-${primaryReward.id}`,
        variant: "level-up-reward",
        ...base,
        reward: primaryReward,
      },
    ];
  }

  return [
    {
      id: `level-${after.level}-${after.xp}`,
      variant: "level-up",
      ...base,
    },
  ];
}
