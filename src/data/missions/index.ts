import { mission01 } from "./mission-01";
import { mission02 } from "./mission-02";
import {
  mission03,
  mission04,
  mission05,
  mission06,
  mission07,
  mission08,
  mission09,
  mission10,
} from "./mission-placeholders";
import type { MissionDefinition } from "@/lib/types";

export const missions: MissionDefinition[] = [
  mission01,
  mission02,
  mission03,
  mission04,
  mission05,
  mission06,
  mission07,
  mission08,
  mission09,
  mission10,
];

export function getMissionBySlug(slug: string): MissionDefinition | undefined {
  return missions.find((m) => m.slug === slug);
}

export function getMissionById(id: string): MissionDefinition | undefined {
  return missions.find((m) => m.id === id);
}
