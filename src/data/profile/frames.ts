import type { Locale } from "@/i18n/config";
import type { PlayerProgress } from "@/lib/types";

export interface ProfileFrame {
  id: string;
  label: Record<Locale, string>;
  tone: "basic" | "accent" | "reward";
  isUnlocked: (progress: PlayerProgress) => boolean;
}

export const PROFILE_FRAMES: ProfileFrame[] = [
  {
    id: "basalt",
    label: { fr: "Basalte", en: "Basalt" },
    tone: "basic",
    isUnlocked: () => true,
  },
  {
    id: "electron",
    label: { fr: "Électron", en: "Electron" },
    tone: "accent",
    isUnlocked: (progress) => progress.completedMissions.includes("mission-01"),
  },
  {
    id: "boss-gold",
    label: { fr: "Or du Boss", en: "Boss Gold" },
    tone: "reward",
    isUnlocked: (progress) => progress.completedMissions.includes("mission-10"),
  },
];

export function resolveUnlockedFrameIds(progress: PlayerProgress): string[] {
  return PROFILE_FRAMES.filter((frame) => frame.isUnlocked(progress)).map(
    (frame) => frame.id
  );
}
