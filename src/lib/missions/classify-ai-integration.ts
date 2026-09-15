import {
  completeChat,
  hasAICredentials,
  REQUEST_TIMEOUT_MS,
} from "@/lib/ai-client";
import { classifyBatchItems } from "@/lib/ai-batch-classify";
import { getApiMessages } from "@/i18n/messages/api";
import type { Locale } from "@/i18n/config";
import type { ClassificationResult, ClassificationTest } from "@/lib/types";
import { evaluateAiIntegrationRun } from "@/lib/validation";
import {
  AI_INTEGRATION_JSON_RETRY_SUFFIX,
  AI_INTEGRATION_JSON_SCHEMA,
} from "@/lib/missions/ai-integration-json";

/**
 * Single MILDRED classify call for Mission 06.
 * `expectJson` asks the provider for structured JSON (reliability);
 * the player instruction still teaches the JSON contract.
 */
export async function classifyAiIntegrationMessage(options: {
  instruction: string;
  message: string;
  locale: Locale;
  /** Stronger structured request — used on the controlled retry. */
  retry?: boolean;
}): Promise<string> {
  if (!hasAICredentials()) {
    throw new Error("MISSING_KEY");
  }

  const msg = getApiMessages(options.locale);
  const instruction = options.retry
    ? `${options.instruction.trim()}\n${AI_INTEGRATION_JSON_RETRY_SUFFIX}`
    : options.instruction.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const { text } = await completeChat({
      maxOutputTokens: 1024,
      signal: controller.signal,
      jsonSchema: AI_INTEGRATION_JSON_SCHEMA as unknown as Record<
        string,
        unknown
      >,
      messages: [
        { role: "system", content: msg.pedagogicalConstraints },
        {
          role: "user",
          content: [
            msg.classifyUserPrefix,
            instruction,
            "",
            msg.classifyMessagePrefix,
            options.message.trim(),
          ].join("\n"),
        },
      ],
    });
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function evaluateSuite(
  byId: Map<string, string>,
  tests: ClassificationTest[],
  opts: {
    compareValue: string;
    trueRoute: string;
    falseRoute: string;
  }
): ClassificationResult[] {
  return tests.map((test) =>
    evaluateAiIntegrationRun(byId.get(test.id) ?? "", test, opts)
  );
}

/**
 * Batch classify Mission 06 tests.
 * One controlled retry for items whose model output is not valid JSON.
 */
export async function classifyAiIntegrationSuite(options: {
  instruction: string;
  tests: ClassificationTest[];
  locale: Locale;
  compareValue: string;
  trueRoute: string;
  falseRoute: string;
}): Promise<ClassificationResult[]> {
  const { results } = await classifyBatchItems({
    instruction: options.instruction,
    tests: options.tests.map((t) => ({ testId: t.id, message: t.message })),
  });
  const byId = new Map(results.map((r) => [r.testId, r.rawOutput] as const));
  let collected = evaluateSuite(byId, options.tests, options);

  const malformed = collected.filter((r) => r.errorKind === "system");
  if (malformed.length === 0) return collected;

  // One controlled retry — malformed items only, with structured JSON request.
  for (const result of malformed) {
    const test = options.tests.find((t) => t.id === result.testId);
    if (!test) continue;
    const raw = await classifyAiIntegrationMessage({
      instruction: options.instruction,
      message: test.message,
      locale: options.locale,
      retry: true,
    });
    byId.set(test.id, raw);
  }

  collected = evaluateSuite(byId, options.tests, options);
  return collected;
}
