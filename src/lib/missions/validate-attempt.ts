import "server-only";

import { classifyBatchItems } from "@/lib/ai-batch-classify";
import { classifyAiIntegrationSuite } from "@/lib/missions/classify-ai-integration";
import { resolveCanonicalMission } from "@/lib/missions/canonical";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import {
  evaluateAiIntegrationFill,
  evaluateCodeFillTask,
  evaluateLogicRoute,
  evaluateMissionTest,
  evaluatePayloadRepair,
  evaluateServiceActionFill,
  evaluateServiceActionRun,
  extractAiIntegrationFillFromSource,
  extractLogicFillFromSource,
  extractServiceActionFillFromSource,
  summarizeSuite,
} from "@/lib/validation";
import {
  evaluatePipelineConnections,
  evaluateSafetyConfig,
  pipelineResultToClassification,
  simulatePipeline,
} from "@/lib/missions/pipeline";
import type {
  ClassificationResult,
  PipelineConnections,
  SafetyReasonCode,
  SafetyRuleConfig,
} from "@/lib/types";

export type MissionAttemptInput = {
  missionId: string;
  locale?: string;
  instruction?: string;
  codeSource?: string;
  payloadRepairText?: string;
  pipelineConnectionsJson?: string;
  safetyConfigJson?: string;
};

export type MissionAttemptFailure =
  | "unknown_mission"
  | "not_playable"
  | "missing_solution"
  | "validation_failed"
  /** Provider/model format failure — not a learner wiring fail. */
  | "system_error";

export type MissionAttemptResult =
  | { ok: true; missionId: string }
  | { ok: false; code: MissionAttemptFailure };

function priorityFromLogicFixture(message: string): string {
  const match = message.match(/"([A-Z_]+)"/);
  return match?.[1] ?? "";
}

/**
 * Trusted server-side validation of a player solution.
 * Loads tests/rewards from mission definitions — never from the client.
 */
export async function validateMissionAttempt(
  input: MissionAttemptInput
): Promise<MissionAttemptResult> {
  const locale: Locale = isLocale(input.locale) ? input.locale : DEFAULT_LOCALE;
  const canonical = resolveCanonicalMission(input.missionId, locale);
  if (!canonical) return { ok: false, code: "unknown_mission" };

  const { mission } = canonical;
  if (!mission.playable) return { ok: false, code: "not_playable" };

  // Intro: completing the briefing is the validation (no tests).
  if (mission.kind === "intro") {
    return { ok: true, missionId: mission.id };
  }

  const tests = mission.tests ?? [];
  if (tests.length === 0) {
    return { ok: false, code: "not_playable" };
  }

  if (mission.payloadRepair) {
    const text = input.payloadRepairText?.trim() ?? "";
    if (!text || !mission.outputSchema) {
      return { ok: false, code: "missing_solution" };
    }
    const repair = evaluatePayloadRepair(
      text,
      mission.payloadRepair.expectedFields,
      mission.outputSchema
    );
    if (!repair.ok) return { ok: false, code: "validation_failed" };
    // Payload-repair missions still require the instruction suite below.
  }

  const fill = mission.codeFill;

  if (fill?.mode === "logic") {
    const source = input.codeSource ?? "";
    if (!source.trim()) return { ok: false, code: "missing_solution" };
    const { key, condition } = extractLogicFillFromSource(source);
    const fillOk = evaluateCodeFillTask(key, condition, fill);
    if (!fillOk.ok) return { ok: false, code: "validation_failed" };

    const collected: ClassificationResult[] = tests.map((test) => {
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
    const summary = summarizeSuite(collected, locale);
    return summary.allPassed
      ? { ok: true, missionId: mission.id }
      : { ok: false, code: "validation_failed" };
  }

  if (fill?.mode === "ai-integration") {
    const source = input.codeSource ?? "";
    if (!source.trim()) return { ok: false, code: "missing_solution" };
    const { values } = extractAiIntegrationFillFromSource(source);
    const fillOk = evaluateAiIntegrationFill(values, fill.blanks);
    // Wrong wiring → learner FAIL, zero model calls.
    if (!fillOk.ok) return { ok: false, code: "validation_failed" };

    const collected = await classifyAiIntegrationSuite({
      instruction: fill.providedInstruction,
      tests,
      locale,
      compareValue: fill.compareValue,
      trueRoute: fill.trueRoute,
      falseRoute: fill.falseRoute,
    });
    const summary = summarizeSuite(collected, locale);
    if (summary.hasSystemError) {
      return { ok: false, code: "system_error" };
    }
    return summary.allPassed
      ? { ok: true, missionId: mission.id }
      : { ok: false, code: "validation_failed" };
  }

  if (fill?.mode === "service-action") {
    const source = input.codeSource ?? "";
    if (!source.trim()) return { ok: false, code: "missing_solution" };
    const values = extractServiceActionFillFromSource(source);
    const fillOk = evaluateServiceActionFill(values);
    if (!fillOk.ok) return { ok: false, code: "validation_failed" };

    const collected = tests.map((test) =>
      evaluateServiceActionRun(test, { humanRoute: fill.humanRoute })
    );
    const summary = summarizeSuite(collected, locale);
    return summary.allPassed
      ? { ok: true, missionId: mission.id }
      : { ok: false, code: "validation_failed" };
  }

  if (mission.boss) {
    const instruction = input.instruction?.trim() ?? "";
    if (!instruction) return { ok: false, code: "missing_solution" };
    const promptTests = mission.boss.promptTests;
    const { results: promptResults } = await classifyBatchItems({
      instruction,
      tests: promptTests.map((t) => ({ testId: t.id, message: t.message })),
    });
    const promptById = new Map(
      promptResults.map((r) => [r.testId, r.rawOutput] as const)
    );
    const promptCollected = promptTests.map((test) =>
      evaluateMissionTest(
        promptById.get(test.id) ?? "",
        test,
        mission.boss!.allowedOutputs ?? mission.allowedOutputs ?? [],
        mission.boss!.promptSchema
      )
    );
    if (!summarizeSuite(promptCollected, locale).allPassed) {
      return { ok: false, code: "validation_failed" };
    }
    // fall through to pipeline+launch validation below
  }

  if (mission.pipeline) {
    const connectionsRaw = input.pipelineConnectionsJson?.trim() ?? "";
    if (!connectionsRaw) return { ok: false, code: "missing_solution" };
    let connections: PipelineConnections;
    try {
      connections = JSON.parse(connectionsRaw) as PipelineConnections;
    } catch {
      return { ok: false, code: "validation_failed" };
    }
    const connOk = evaluatePipelineConnections(
      connections,
      mission.pipeline.expectedConnections
    );
    if (!connOk.ok) return { ok: false, code: "validation_failed" };

    let safety: SafetyRuleConfig | null = null;
    if (mission.safety) {
      const safetyRaw = input.safetyConfigJson?.trim() ?? "";
      if (!safetyRaw) return { ok: false, code: "missing_solution" };
      try {
        safety = JSON.parse(safetyRaw) as SafetyRuleConfig;
      } catch {
        return { ok: false, code: "validation_failed" };
      }
      const safetyOk = evaluateSafetyConfig(safety, mission.safety.expected);
      if (!safetyOk.ok) return { ok: false, code: "validation_failed" };
    }

    const SAFETY_REASONS = new Set([
      "INVALID_AI_OUTPUT",
      "INVALID_PRIORITY",
      "ACTION_FAILED",
    ]);
    const collected = tests.map((test) => {
      const fixture = test.serviceFixture;
      const expectedIsFallback = SAFETY_REASONS.has(test.expected);
      const sim = simulatePipeline({
        connections,
        message: test.message,
        aiResponse: fixture?.aiResponse ?? "",
        urgentPriority: mission.pipeline!.urgentPriority,
        humanRoute: mission.pipeline!.humanRoute,
        queueRoute: mission.pipeline!.queueRoute,
        safety,
        forceActionFailure: fixture?.forceActionFailure,
        expectedAction: expectedIsFallback ? undefined : test.expected,
        expectedFallback: expectedIsFallback
          ? (test.expected as SafetyReasonCode)
          : null,
      });
      return pipelineResultToClassification(test, sim);
    });
    const summary = summarizeSuite(collected, locale);
    return summary.allPassed
      ? { ok: true, missionId: mission.id }
      : { ok: false, code: "validation_failed" };
  }

  const instruction = input.instruction?.trim() ?? "";
  if (!instruction) return { ok: false, code: "missing_solution" };

  // One retry: AI classification is non-deterministic; Mission 04 was unlocking
  // client-side while cloud persist failed on a flaky re-grade.
  let collected: ClassificationResult[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const { results } = await classifyBatchItems({
      instruction,
      tests: tests.map((t) => ({ testId: t.id, message: t.message })),
    });
    const byId = new Map(results.map((r) => [r.testId, r.rawOutput] as const));
    collected = tests.map((test) =>
      evaluateMissionTest(
        byId.get(test.id) ?? "",
        test,
        mission.allowedOutputs ?? [],
        mission.outputSchema
      )
    );
    if (summarizeSuite(collected, locale).allPassed) {
      return { ok: true, missionId: mission.id };
    }
  }
  return { ok: false, code: "validation_failed" };
}
