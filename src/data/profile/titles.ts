import type { Locale } from "@/i18n/config";
import type { PlayerProgress } from "@/lib/types";
import { kingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";

export interface ProfileTitle {
  id: string;
  label: Record<Locale, string>;
  isUnlocked: (progress: PlayerProgress) => boolean;
}

export const PROFILE_TITLES: ProfileTitle[] = [
  {
    id: "pioneer",
    label: { fr: "Pionnier", en: "Pioneer" },
    isUnlocked: (progress) => progress.completedMissions.includes("mission-01"),
  },
  {
    id: "systems-builder",
    label: { fr: "Constructeur de systèmes", en: "Systems Builder" },
    isUnlocked: (progress) => progress.completedMissions.includes("mission-03"),
  },
  {
    id: "kingdom-conqueror",
    label: { fr: "Conquérant de Royaume", en: "Kingdom Conqueror" },
    isUnlocked: (progress) =>
      kingdomConstruireAvecIA.missionIds.every((id) =>
        progress.completedMissions.includes(id)
      ),
  },
];

export function resolveUnlockedTitleIds(progress: PlayerProgress): string[] {
  return PROFILE_TITLES.filter((title) => title.isUnlocked(progress)).map(
    (title) => title.id
  );
}
