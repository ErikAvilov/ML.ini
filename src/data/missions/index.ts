import type { Locale } from "@/i18n/config";
import { DEFAULT_LOCALE } from "@/i18n/config";
import type { MissionDefinition } from "@/lib/types";
import { createMission00 } from "./mission-00";
import { createMission01 } from "./mission-01";
import { createMission02 } from "./mission-02";
import { createMission03 } from "./mission-03";
import { createMission04 } from "./mission-04";
import { createMission05 } from "./mission-05";
import { createMission06 } from "./mission-06";
import {
  createMission07,
  createMission08,
  createMission09,
  createMission10,
} from "./mission-placeholders";

const factories = [
  createMission00,
  createMission01,
  createMission02,
  createMission03,
  createMission04,
  createMission05,
  createMission06,
  createMission07,
  createMission08,
  createMission09,
  createMission10,
];

export function getMissions(locale: Locale = DEFAULT_LOCALE): MissionDefinition[] {
  return factories.map((create) => create(locale));
}

/** Core Kingdom challenges (excludes intro). */
export function getCoreMissions(
  locale: Locale = DEFAULT_LOCALE
): MissionDefinition[] {
  return getMissions(locale).filter((m) => m.kind !== "intro");
}

/** @deprecated Prefer getMissions(locale) — kept for static params (slugs are locale-invariant). */
export const missions = getMissions(DEFAULT_LOCALE);

export function getMissionBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): MissionDefinition | undefined {
  return getMissions(locale).find((m) => m.slug === slug);
}

export function getMissionById(
  id: string,
  locale: Locale = DEFAULT_LOCALE
): MissionDefinition | undefined {
  return getMissions(locale).find((m) => m.id === id);
}

export function getMissionSlugs(): string[] {
  return getMissions(DEFAULT_LOCALE).map((m) => m.slug);
}
