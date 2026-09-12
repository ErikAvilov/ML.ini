import { getMissionById, getMissionBySlug } from "@/data/missions";
import { getKingdoms } from "@/data/kingdoms/construire-avec-ia";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { MissionDefinition } from "@/lib/types";

export type CanonicalMissionRef = {
  mission: MissionDefinition;
  kingdomSlug: string;
  missionSlug: string;
  xpReward: number;
};

export function resolveCanonicalMission(
  missionIdOrSlug: string,
  locale: Locale = DEFAULT_LOCALE
): CanonicalMissionRef | null {
  const mission =
    getMissionById(missionIdOrSlug, locale) ??
    getMissionBySlug(missionIdOrSlug, locale);
  if (!mission) return null;

  const kingdom = getKingdoms(locale).find((k) =>
    k.missionIds.includes(mission.id)
  );
  if (!kingdom) return null;

  return {
    mission,
    kingdomSlug: kingdom.slug,
    missionSlug: mission.slug,
    xpReward: mission.xpReward,
  };
}
