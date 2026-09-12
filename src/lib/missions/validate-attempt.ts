import "server-only";

import { classifyBatchItems } from "@/lib/ai-batch-classify";
import { resolveCanonicalMission } from "@/lib/missions/canonical";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import {
  evaluateAiIntegrationFill,
  evaluateAiIntegrationRun,
  evaluateCodeFillTask,
  evaluateLogicRoute,
  evaluateMissionTest,
  evaluatePayloadRepair,
  extractAiIntegrationFillFromSource,
  extractLogicFillFromSource,
  summarizeSuite,
} from "@/lib/validation";
import type { ClassificationResult } from "@/lib/types";

export type MissionAttemptInput = {
  missionId: string;
  locale?: string;
  instruction?: string;
  codeSource?: string;
  payloadRepairText?: string;
};

export type MissionAttemptFailure =
  | "unknown_mission"
  | "not_playable"
  | "missing_solution"
  | "validation_failed";

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
  const locale = (input.locale === "en" ? "en" : DEFAULT_LOCALE) as Locale;
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
    if (!fillOk.ok) return { ok: false, code: "validation_failed" };

    const { results } = await classifyBatchItems({
      instruction: fill.providedInstruction,
      tests: tests.map((t) => ({ testId: t.id, message: t.message })),
    });
    const byId = new Map(results.map((r) => [r.testId, r.rawOutput] as const));
    const collected = tests.map((test) =>
      evaluateAiIntegrationRun(byId.get(test.id) ?? "", test, {
        compareValue: fill.compareValue,
        trueRoute: fill.trueRoute,
        falseRoute: fill.falseRoute,
      })
    );
    const summary = summarizeSuite(collected, locale);
    return summary.allPassed
      ? { ok: true, missionId: mission.id }
      : { ok: false, code: "validation_failed" };
  }

  const instruction = input.instruction?.trim() ?? "";
  if (!instruction) return { ok: false, code: "missing_solution" };

  const { results } = await classifyBatchItems({
    instruction,
    tests: tests.map((t) => ({ testId: t.id, message: t.message })),
  });
  const byId = new Map(results.map((r) => [r.testId, r.rawOutput] as const));
  const collected = tests.map((test) =>
    evaluateMissionTest(
      byId.get(test.id) ?? "",
      test,
      mission.allowedOutputs ?? [],
      mission.outputSchema
    )
  );
  const summary = summarizeSuite(collected, locale);
  return summary.allPassed
    ? { ok: true, missionId: mission.id }
    : { ok: false, code: "validation_failed" };
}
