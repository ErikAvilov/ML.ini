import type { Locale } from "@/i18n/config";
import type { PlayerProgress } from "@/lib/types";

export type AchievementRarity = "standard" | "rare" | "legendary";

export interface ProfileAchievement {
  id: string;
  rarity: AchievementRarity;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  isUnlocked: (progress: PlayerProgress) => boolean;
}

export const PROFILE_ACHIEVEMENTS: ProfileAchievement[] = [
  {
    id: "FIRST_CONTACT",
    rarity: "standard",
    name: { fr: "Premier contact", en: "First Contact" },
    description: {
      fr: "Terminer la première mission.",
      en: "Complete the first mission.",
    },
    isUnlocked: (progress) => progress.completedMissions.includes("mission-01"),
  },
  {
    id: "SEVEN_DAYS",
    rarity: "rare",
    name: { fr: "Sept jours d’affilée", en: "Seven Days Straight" },
    description: {
      fr: "Maintenir une série de sept jours.",
      en: "Maintain a seven-day streak.",
    },
    isUnlocked: (progress) => progress.bestStreak >= 7,
  },
  {
    id: "BOSS_DEFEATED",
    rarity: "legendary",
    name: { fr: "Épreuve finale", en: "Final Trial" },
    description: {
      fr: "Terminer une mission de Boss.",
      en: "Complete a Boss mission.",
    },
    isUnlocked: (progress) => progress.completedMissions.includes("mission-10"),
  },
];

export function resolveUnlockedAchievementIds(
  progress: PlayerProgress
): string[] {
  return PROFILE_ACHIEVEMENTS.filter((achievement) =>
    achievement.isUnlocked(progress)
  ).map((achievement) => achievement.id);
}
