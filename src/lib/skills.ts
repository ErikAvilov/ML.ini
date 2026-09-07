import { getSkillDefinitions, SKILL_EDGES } from "@/data/skills/tree";
import type { Locale } from "@/i18n/config";
import type {
  PlayerProgress,
  SkillDefinition,
  SkillEdge,
  SkillNodeState,
} from "@/lib/types";

export function isSkillUnlockedByProgress(
  skill: SkillDefinition,
  progress: PlayerProgress
): boolean {
  if (progress.completedMissions.includes(skill.unlockedByMissionId)) {
    return true;
  }
  return progress.unlockedSkills.includes(skill.id);
}

export function resolveSkillState(
  skill: SkillDefinition,
  progress: PlayerProgress,
  all: SkillDefinition[]
): SkillNodeState {
  if (isSkillUnlockedByProgress(skill, progress)) {
    return "unlocked";
  }

  const prereqsMet = skill.prerequisites.every((id) => {
    const node = all.find((s) => s.id === id);
    return node ? isSkillUnlockedByProgress(node, progress) : false;
  });

  if (prereqsMet) return "available";
  return "locked";
}

export interface ResolvedSkillNode extends SkillDefinition {
  state: SkillNodeState;
}

export function resolveSkillTree(
  progress: PlayerProgress,
  locale: Locale
): { nodes: ResolvedSkillNode[]; edges: SkillEdge[] } {
  const defs = getSkillDefinitions(locale);
  const nodes = defs.map((skill) => ({
    ...skill,
    state: resolveSkillState(skill, progress, defs),
  }));
  return { nodes, edges: SKILL_EDGES };
}

/** Skills proven by completed missions — keeps old saves coherent after id renames. */
export function syncSkillsFromCompletedMissions(
  progress: PlayerProgress
): string[] {
  const fromMissions = getSkillDefinitions("en")
    .filter((s) => progress.completedMissions.includes(s.unlockedByMissionId))
    .map((s) => s.id);
  return Array.from(new Set([...progress.unlockedSkills, ...fromMissions]));
}
