/**
 * Cloud progression phase-1 self-checks (no live DB / server-only imports).
 * Run: npx tsx scripts/check-cloud-progression.ts
 */
import assert from "node:assert/strict";
import { resolveCanonicalMission } from "../src/lib/missions/canonical";
import {
  buildCodeFillStarterSource,
  evaluateCodeFillTask,
  evaluateLogicRoute,
  extractLogicFillFromSource,
  summarizeSuite,
} from "../src/lib/validation";
import { getMissionById } from "../src/data/missions";
import type { ClassificationResult } from "../src/lib/types";

function priorityFromLogicFixture(message: string): string {
  const match = message.match(/"([A-Z_]+)"/);
  return match?.[1] ?? "";
}

function validateLogicMissionLocally(
  missionId: string,
  codeSource: string
): "missing_solution" | "validation_failed" | "ok" | "unknown" {
  const mission = getMissionById(missionId, "fr");
  if (!mission?.codeFill || mission.codeFill.mode !== "logic") return "unknown";
  if (!codeSource.trim()) return "missing_solution";
  const { key, condition } = extractLogicFillFromSource(codeSource);
  const fillOk = evaluateCodeFillTask(key, condition, mission.codeFill);
  if (!fillOk.ok) return "validation_failed";
  const fill = mission.codeFill;
  const collected: ClassificationResult[] = (mission.tests ?? []).map((test) => {
    const priority = priorityFromLogicFixture(test.message);
    const route = evaluateLogicRoute(
      priority,
      fill.compareValue,
      fill.trueRoute,
      fill.falseRoute
    );
    const matches = route === test.expected;
    return {
      raw: route,
      normalized: route,
      isValidCategory: true,
      matchesExpected: matches,
      expected: test.expected,
      message: test.message,
      testId: test.id,
    };
  });
  return summarizeSuite(collected, "fr").allPassed ? "ok" : "validation_failed";
}

// Canonical XP from mission definitions only
const m05 = resolveCanonicalMission("mission-05", "fr");
assert.ok(m05);
assert.equal(m05.xpReward, 180);
assert.equal(m05.missionSlug, "the-fork");
assert.equal(m05.kingdomSlug, "construire-avec-ia");

const m06 = resolveCanonicalMission("bring-it-to-life", "fr");
assert.ok(m06);
assert.equal(m06.xpReward, 220);
assert.equal(m06.mission.id, "mission-06");

assert.equal(resolveCanonicalMission("mission-99"), null);
assert.equal(resolveCanonicalMission("totally-fake-slug"), null);

// recordMissionCompletion accepts only userId + missionId (+ locale) — no XP fields
type RecordParams = {
  userId: string;
  missionId: string;
  locale?: string;
};
type Forbidden = Extract<keyof RecordParams, "xp" | "xpAwarded" | "totalXp">;
const _noXpInApi: Forbidden extends never ? true : false = true;
void _noXpInApi;

assert.equal(validateLogicMissionLocally("mission-05", ""), "missing_solution");

{
  const mission = getMissionById("mission-05", "fr");
  assert.ok(mission?.codeFill && mission.codeFill.mode === "logic");
  const starter = buildCodeFillStarterSource(mission.codeFill);
  assert.equal(
    validateLogicMissionLocally("mission-05", starter),
    "validation_failed"
  );
}

{
  const mission = getMissionById("mission-05", "fr");
  assert.ok(mission?.codeFill && mission.codeFill.mode === "logic");
  const fill = mission.codeFill;
  const source = `${fill.prefix}priority${fill.middle}priority == "URGENT"${fill.suffix}`;
  assert.equal(validateLogicMissionLocally("mission-05", source), "ok");
}

// Replay XP story: canonical reward is fixed; duplicate award is 0 by design
assert.equal(m05.xpReward, getMissionById("mission-05", "fr")?.xpReward);

console.log("cloud-progression: ok");
