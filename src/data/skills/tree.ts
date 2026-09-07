import type { Locale } from "@/i18n/config";
import type { SkillDefinition, SkillEdge } from "@/lib/types";

const KINGDOM_I = "construire-avec-ia";

type SkillLocaleCopy = {
  displayName: string;
  description: string;
  category: string;
};

type SkillSeed = {
  id: string;
  name: string;
  level: number;
  type: SkillDefinition["type"];
  prerequisites: string[];
  unlockedByMissionId: string;
  kingdomId: string;
  position: { x: number; y: number };
  copy: Record<Locale, SkillLocaleCopy>;
};

/**
 * Global skill tree registry — source of truth for /skills.
 * Unlock is mission-proven only (no spendable points in V1).
 */
const SKILL_SEEDS: SkillSeed[] = [
  {
    id: "llm-fundamentals-1",
    name: "LLM Fundamentals I",
    level: 1,
    type: "normal",
    prerequisites: [],
    unlockedByMissionId: "mission-01",
    kingdomId: KINGDOM_I,
    position: { x: 0, y: 220 },
    copy: {
      en: {
        displayName: "Understanding AI Inputs & Outputs",
        description:
          "You understand the basic flow between input, instructions, a language model and its output.",
        category: "LLM Fundamentals",
      },
      fr: {
        displayName: "Comprendre entrées & sorties d’une IA",
        description:
          "Tu comprends le flux de base entre entrée, instructions, modèle de langage et sortie.",
        category: "Fondamentaux LLM",
      },
    },
  },
  {
    id: "prompting-1",
    name: "Prompting I",
    level: 1,
    type: "normal",
    prerequisites: ["llm-fundamentals-1"],
    unlockedByMissionId: "mission-02",
    kingdomId: KINGDOM_I,
    position: { x: 0, y: 110 },
    copy: {
      en: {
        displayName: "Giving Rules to an AI",
        description:
          "You can communicate explicit business rules and decision criteria to a language model.",
        category: "Prompting",
      },
      fr: {
        displayName: "Donner des règles à une IA",
        description:
          "Tu peux transmettre des règles métier et des critères de décision explicites à un modèle de langage.",
        category: "Prompting",
      },
    },
  },
  {
    id: "structured-output-1",
    name: "Structured Output I",
    level: 1,
    type: "major",
    prerequisites: ["prompting-1"],
    unlockedByMissionId: "mission-03",
    kingdomId: KINGDOM_I,
    position: { x: 0, y: 0 },
    copy: {
      en: {
        displayName: "Structuring AI Responses",
        description:
          "You can make a language model return predictable information another program can use.",
        category: "Structured Output",
      },
      fr: {
        displayName: "Structurer les réponses d’une IA",
        description:
          "Tu peux faire renvoyer à un modèle de langage des informations prévisibles qu’un autre programme peut utiliser.",
        category: "Structured Output",
      },
    },
  },
];

export const SKILL_EDGES: SkillEdge[] = [
  { from: "llm-fundamentals-1", to: "prompting-1" },
  { from: "prompting-1", to: "structured-output-1" },
];

export function getSkillDefinitions(locale: Locale): SkillDefinition[] {
  return SKILL_SEEDS.map((seed) => {
    const copy = seed.copy[locale] ?? seed.copy.en;
    return {
      id: seed.id,
      name: seed.name,
      displayName: copy.displayName,
      description: copy.description,
      category: copy.category,
      level: seed.level,
      type: seed.type,
      prerequisites: seed.prerequisites,
      unlockedByMissionId: seed.unlockedByMissionId,
      kingdomId: seed.kingdomId,
      position: seed.position,
    };
  });
}

export function getSkillById(
  id: string,
  locale: Locale
): SkillDefinition | undefined {
  return getSkillDefinitions(locale).find((s) => s.id === id);
}

export function getSkillIdForMission(missionId: string): string | undefined {
  return SKILL_SEEDS.find((s) => s.unlockedByMissionId === missionId)?.id;
}
