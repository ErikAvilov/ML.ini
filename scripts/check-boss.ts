/**
 * Self-check: Mission 10 Launch Night boss data + deterministic launch fixtures.
 * Run: npx tsx scripts/check-boss.ts
 */
import assert from "node:assert/strict";
import { getMissionById } from "../src/data/missions";
import {
  defaultChainConnections,
  evaluatePipelineConnections,
  evaluateSafetyConfig,
  simulatePipeline,
} from "../src/lib/missions/pipeline";
import { resolveWorkspaceKind } from "../src/lib/missions/resolve-workspace-kind";
import type { SafetyReasonCode } from "../src/lib/types";

const mission = getMissionById("mission-10", "en");
assert.ok(mission, "mission-10 exists");
assert.equal(mission.kind, "boss");
assert.equal(mission.playable, true);
assert.equal(mission.slug, "coeur-du-systeme");
assert.equal(mission.xpReward, 500);
assert.equal(resolveWorkspaceKind(mission).kind, "boss");

const boss = mission.boss;
assert.ok(boss, "boss task");
assert.equal(boss.steps.length, 3);
assert.deepEqual(
  boss.steps.map((s) => s.kind),
  ["prompt", "pipeline", "safety"]
);
assert.ok(boss.promptTests.length >= 8, "prompt drills");
assert.equal(
  boss.promptTests.filter((t) => !t.id.includes("hidden")).length,
  4
);
assert.equal(boss.promptSchema.format, "json");
assert.ok(boss.fieldManual.length >= 6, "field manual reminders");

assert.ok(mission.pipeline, "pipeline reused");
assert.ok(mission.safety, "safety reused");
assert.ok((mission.tests?.length ?? 0) >= 10, "launch suite size");

const connections = defaultChainConnections();
assert.equal(
  evaluatePipelineConnections(connections, mission.pipeline!.expectedConnections)
    .ok,
  true
);
assert.equal(
  evaluateSafetyConfig(
    {
      onParseFail: { target: "MANUAL_REVIEW", reason: "INVALID_AI_OUTPUT" },
      onInvalidPriority: { target: "MANUAL_REVIEW", reason: "INVALID_PRIORITY" },
      onActionFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
    },
    mission.safety!.expected
  ).ok,
  true
);

const SAFETY = new Set(["INVALID_AI_OUTPUT", "INVALID_PRIORITY", "ACTION_FAILED"]);
for (const test of mission.tests!) {
  const fixture = test.serviceFixture;
  assert.ok(fixture?.aiResponse !== undefined, `${test.id} has aiResponse`);
  const expectedIsFallback = SAFETY.has(test.expected);
  const sim = simulatePipeline({
    connections,
    message: test.message,
    aiResponse: fixture!.aiResponse ?? "",
    urgentPriority: mission.pipeline!.urgentPriority,
    humanRoute: mission.pipeline!.humanRoute,
    queueRoute: mission.pipeline!.queueRoute,
    safety: {
      onParseFail: { target: "MANUAL_REVIEW", reason: "INVALID_AI_OUTPUT" },
      onInvalidPriority: {
        target: "MANUAL_REVIEW",
        reason: "INVALID_PRIORITY",
      },
      onActionFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
    },
    forceActionFailure: fixture!.forceActionFailure,
    expectedAction: expectedIsFallback ? undefined : test.expected,
    expectedFallback: expectedIsFallback
      ? (test.expected as SafetyReasonCode)
      : null,
  });
  assert.equal(sim.matchesExpected, true, `${test.id} launch fixture`);
}

// Completion-once smoke: grant path is final step only (boss.steps.length - 1)
assert.equal(boss.steps.length - 1, 2);
assert.equal(mission.completion?.capabilityUnlocked.id, "mildred-live");
assert.equal(mission.completion?.skillUnlocked.skillId, "guardrails-1");

const fr = getMissionById("mission-10", "fr");
assert.ok(fr?.boss);
assert.equal(fr!.title, "Nuit de Lancement");
assert.equal(fr!.boss!.steps.length, 3);

console.log("boss: ok");
