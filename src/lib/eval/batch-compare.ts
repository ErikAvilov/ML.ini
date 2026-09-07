import type { Locale } from "@/i18n/config";
import { getApiMessages } from "@/i18n/messages/api";
import {
  EVAL_MODEL,
  EVAL_REQUEST_TIMEOUT_MS,
  completeChat,
  hasAICredentials,
} from "@/lib/ai-client";
import { evaluateMissionTest } from "@/lib/validation";
import type {
  ClassificationResult,
  ClassificationTest,
  MissionDefinition,
} from "@/lib/types";

export type EvalMode = "PARALLEL_ISOLATED" | "SINGLE_BATCH";

export interface TokenUsage {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}

export interface PerTestEvalRow {
  testId: string;
  message: string;
  rawOutput: string;
  evaluation: ClassificationResult;
  passed: boolean;
  contentOk: boolean | null | undefined;
  contractOk: boolean | undefined;
}

export interface ModeRunResult {
  mode: EvalMode;
  model: string;
  latencyMs: number;
  requestCount: number;
  usage: TokenUsage;
  results: PerTestEvalRow[];
  passed: number;
  total: number;
  allPassed: boolean;
  /** Parser / transport errors that did not map cleanly to a test */
  warnings: string[];
}

export type MismatchKind =
  | "FALSE_PASS"
  | "FALSE_FAIL"
  | "PASS_AGREE"
  | "FAIL_AGREE";

export interface TestMismatch {
  testId: string;
  kind: MismatchKind;
  isolatedPass: boolean;
  batchPass: boolean;
  isolatedRaw: string;
  batchRaw: string;
  isolatedContentOk?: boolean | null;
  batchContentOk?: boolean | null;
  isolatedContractOk?: boolean;
  batchContractOk?: boolean;
}

export interface ComparisonReport {
  missionId: string;
  missionTitle: string;
  promptId: string;
  promptLabel: string;
  instruction: string;
  model: string;
  isolated: ModeRunResult;
  batch: ModeRunResult;
  perTest: TestMismatch[];
  /** Isolated suite failed but batch suite passed */
  suiteFalsePass: boolean;
  /** Isolated suite passed but batch suite failed */
  suiteFalseFail: boolean;
  falsePassTestIds: string[];
  falseFailTestIds: string[];
}

const BATCH_WRAPPER_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          testId: { type: "string" },
          rawOutput: { type: "string" },
        },
        required: ["testId", "rawOutput"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
} as const;

function emptyUsage(): TokenUsage {
  return { inputTokens: null, outputTokens: null, totalTokens: null };
}

function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  const sum = (x: number | null, y: number | null) =>
    x === null && y === null ? null : (x ?? 0) + (y ?? 0);
  return {
    inputTokens: sum(a.inputTokens, b.inputTokens),
    outputTokens: sum(a.outputTokens, b.outputTokens),
    totalTokens: sum(a.totalTokens, b.totalTokens),
  };
}

function usageFromResult(usage: {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}): TokenUsage {
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };
}

function buildRows(
  tests: ClassificationTest[],
  outputsById: Map<string, string>,
  mission: MissionDefinition,
  warnings: string[]
): PerTestEvalRow[] {
  return tests.map((test) => {
    const rawOutput = outputsById.get(test.id);
    if (rawOutput === undefined) {
      warnings.push(`Missing rawOutput for test ${test.id}`);
    }
    const raw = rawOutput ?? "";
    const evaluation = evaluateMissionTest(
      raw,
      test,
      mission.allowedOutputs ?? [],
      mission.outputSchema
    );
    return {
      testId: test.id,
      message: test.message,
      rawOutput: raw,
      evaluation,
      passed: evaluation.matchesExpected,
      contentOk: evaluation.contentOk,
      contractOk: evaluation.contractOk,
    };
  });
}

async function classifyIsolated(
  model: string,
  instruction: string,
  message: string,
  locale: Locale
): Promise<{ output: string; usage: TokenUsage }> {
  const msg = getApiMessages(locale);

  return withRetries(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      EVAL_REQUEST_TIMEOUT_MS
    );

    try {
      const result = await completeChat({
        model,
        maxOutputTokens: 1024,
        signal: controller.signal,
        messages: [
          { role: "system", content: msg.pedagogicalConstraints },
          {
            role: "user",
            content: [
              msg.classifyUserPrefix,
              instruction,
              "",
              msg.classifyMessagePrefix,
              message,
            ].join("\n"),
          },
        ],
      });

      return {
        output: result.text,
        usage: usageFromResult(result.usage),
      };
    } finally {
      clearTimeout(timeout);
    }
  });
}

async function withRetries<T>(
  fn: () => Promise<T>,
  attempts = 4
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined;
      const name =
        err && typeof err === "object" && "name" in err
          ? String((err as { name?: string }).name)
          : "";
      const message = err instanceof Error ? err.message : "";
      const retryable =
        status === 429 ||
        status === 503 ||
        status === 504 ||
        name === "APIUserAbortError" ||
        name === "AbortError" ||
        message.toLowerCase().includes("aborted");
      if (!retryable || i === attempts - 1) throw err;
      const delay = 1200 * 2 ** i + Math.floor(Math.random() * 400);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }

  const agents = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run()
  );
  await Promise.all(agents);
  return results;
}

function buildBatchUserPayload(
  instruction: string,
  tests: ClassificationTest[]
): string {
  const items = tests.map((t) => ({
    testId: t.id,
    customerMessage: t.message,
  }));

  return [
    "PLAYER_INSTRUCTION:",
    instruction,
    "",
    "TEST_ITEMS (JSON):",
    JSON.stringify(items, null, 2),
    "",
    "Return a JSON object with a `results` array.",
    "Each element must be: { \"testId\": string, \"rawOutput\": string }.",
    "`rawOutput` must be exactly what MILDRED would output under PLAYER_INSTRUCTION alone.",
    "Do not rewrite rawOutput into a different schema than the player asked for.",
  ].join("\n");
}

const BATCH_SYSTEM = `You are running an evaluation harness for an educational product.

Apply PLAYER_INSTRUCTION independently to each test item.

Treat each item as if it were a separate inference.

Do not derive missing rules by comparing test items.

Do not use one customer message as an example for another.

For each test, generate the response that MILDRED would have produced if that
message had been processed alone.

CRITICAL:
- Put the player-driven MILDRED response in rawOutput only.
- Do NOT normalize, reformat, or upgrade rawOutput into SENTIMENT:/PRIORITY: lines
  unless PLAYER_INSTRUCTION itself requires that exact format.
- The outer JSON wrapper exists only so the harness can collect answers.
- Never invent policy rules that are not in PLAYER_INSTRUCTION.`;

async function classifyBatch(
  model: string,
  instruction: string,
  tests: ClassificationTest[]
): Promise<{
  outputsById: Map<string, string>;
  usage: TokenUsage;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const maxOutputTokens = Math.min(8192, Math.max(2048, tests.length * 400));

  return withRetries(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      EVAL_REQUEST_TIMEOUT_MS
    );

    try {
      let content = "";
      let usage = emptyUsage();

      try {
        const result = await completeChat({
          model,
          maxOutputTokens,
          signal: controller.signal,
          jsonSchema: BATCH_WRAPPER_SCHEMA as unknown as Record<string, unknown>,
          messages: [
            { role: "system", content: BATCH_SYSTEM },
            {
              role: "user",
              content: buildBatchUserPayload(instruction, tests),
            },
          ],
        });
        content = result.text;
        usage = usageFromResult(result.usage);
      } catch (strictErr) {
        const status =
          strictErr && typeof strictErr === "object" && "status" in strictErr
            ? Number((strictErr as { status?: number }).status)
            : undefined;
        if (status === 429 || status === 503 || status === 504) {
          throw strictErr;
        }
        warnings.push(
          `json schema failed (${
            strictErr instanceof Error ? strictErr.message : "unknown"
          }); retrying without schema`
        );
        const result = await completeChat({
          model,
          maxOutputTokens,
          signal: controller.signal,
          messages: [
            {
              role: "system",
              content: `${BATCH_SYSTEM}\n\nRespond with valid JSON only.`,
            },
            {
              role: "user",
              content: buildBatchUserPayload(instruction, tests),
            },
          ],
        });
        content = result.text;
        usage = usageFromResult(result.usage);
      }

      const outputsById = new Map<string, string>();

      try {
        const parsed = JSON.parse(content) as {
          results?: Array<{ testId?: string; rawOutput?: string }>;
        };
        if (!Array.isArray(parsed.results)) {
          warnings.push("Batch JSON missing results array");
        } else {
          for (const row of parsed.results) {
            if (!row?.testId) {
              warnings.push("Batch row missing testId");
              continue;
            }
            outputsById.set(
              row.testId,
              typeof row.rawOutput === "string" ? row.rawOutput : ""
            );
          }
        }
      } catch {
        warnings.push("Failed to parse batch JSON wrapper");
        warnings.push(`Raw model content (truncated): ${content.slice(0, 240)}`);
      }

      return { outputsById, usage, warnings };
    } finally {
      clearTimeout(timeout);
    }
  });
}

export async function runParallelIsolated(options: {
  mission: MissionDefinition;
  instruction: string;
  locale: Locale;
  model?: string;
}): Promise<ModeRunResult> {
  if (!hasAICredentials()) {
    throw new Error("AI API key missing (GEMINI_API_KEY or OPENAI_API_KEY)");
  }

  const model = options.model ?? EVAL_MODEL;
  const tests = options.mission.tests ?? [];
  const warnings: string[] = [];
  const started = Date.now();

  const settled = await mapPool(tests, 2, async (test) => {
    const { output, usage } = await classifyIsolated(
      model,
      options.instruction,
      test.message,
      options.locale
    );
    return { testId: test.id, output, usage };
  });

  const latencyMs = Date.now() - started;
  let usage = emptyUsage();
  const outputsById = new Map<string, string>();
  for (const row of settled) {
    outputsById.set(row.testId, row.output);
    usage = addUsage(usage, row.usage);
  }

  const results = buildRows(tests, outputsById, options.mission, warnings);
  const passed = results.filter((r) => r.passed).length;

  return {
    mode: "PARALLEL_ISOLATED",
    model,
    latencyMs,
    requestCount: tests.length,
    usage,
    results,
    passed,
    total: tests.length,
    allPassed: passed === tests.length && tests.length > 0,
    warnings,
  };
}

export async function runSingleBatch(options: {
  mission: MissionDefinition;
  instruction: string;
  locale?: Locale;
  model?: string;
}): Promise<ModeRunResult> {
  if (!hasAICredentials()) {
    throw new Error("AI API key missing (GEMINI_API_KEY or OPENAI_API_KEY)");
  }

  const model = options.model ?? EVAL_MODEL;
  const tests = options.mission.tests ?? [];
  const started = Date.now();

  const { outputsById, usage, warnings } = await classifyBatch(
    model,
    options.instruction,
    tests
  );

  const latencyMs = Date.now() - started;
  const results = buildRows(tests, outputsById, options.mission, warnings);
  const passed = results.filter((r) => r.passed).length;

  return {
    mode: "SINGLE_BATCH",
    model,
    latencyMs,
    requestCount: 1,
    usage,
    results,
    passed,
    total: tests.length,
    allPassed: passed === tests.length && tests.length > 0,
    warnings,
  };
}

export async function compareIsolatedVsBatch(options: {
  mission: MissionDefinition;
  instruction: string;
  promptId: string;
  promptLabel: string;
  locale: Locale;
  model?: string;
}): Promise<ComparisonReport> {
  const model = options.model ?? EVAL_MODEL;

  // Sequential modes: avoid provider rate limits and keep latency comparable.
  const isolated = await runParallelIsolated({
    mission: options.mission,
    instruction: options.instruction,
    locale: options.locale,
    model,
  });
  const batch = await runSingleBatch({
    mission: options.mission,
    instruction: options.instruction,
    locale: options.locale,
    model,
  });

  const perTest: TestMismatch[] = (options.mission.tests ?? []).map((test) => {
    const i = isolated.results.find((r) => r.testId === test.id)!;
    const b = batch.results.find((r) => r.testId === test.id)!;
    let kind: MismatchKind;
    if (!i.passed && b.passed) kind = "FALSE_PASS";
    else if (i.passed && !b.passed) kind = "FALSE_FAIL";
    else if (i.passed && b.passed) kind = "PASS_AGREE";
    else kind = "FAIL_AGREE";

    return {
      testId: test.id,
      kind,
      isolatedPass: i.passed,
      batchPass: b.passed,
      isolatedRaw: i.rawOutput,
      batchRaw: b.rawOutput,
      isolatedContentOk: i.contentOk,
      batchContentOk: b.contentOk,
      isolatedContractOk: i.contractOk,
      batchContractOk: b.contractOk,
    };
  });

  const falsePassTestIds = perTest
    .filter((m) => m.kind === "FALSE_PASS")
    .map((m) => m.testId);
  const falseFailTestIds = perTest
    .filter((m) => m.kind === "FALSE_FAIL")
    .map((m) => m.testId);

  return {
    missionId: options.mission.id,
    missionTitle: options.mission.title,
    promptId: options.promptId,
    promptLabel: options.promptLabel,
    instruction: options.instruction,
    model,
    isolated,
    batch,
    perTest,
    suiteFalsePass: !isolated.allPassed && batch.allPassed,
    suiteFalseFail: isolated.allPassed && !batch.allPassed,
    falsePassTestIds,
    falseFailTestIds,
  };
}

export function formatComparisonMarkdown(report: ComparisonReport): string {
  const lines: string[] = [];
  lines.push(`### ${report.promptLabel} (\`${report.promptId}\`)`);
  lines.push("");
  lines.push(`- Model: \`${report.model}\``);
  lines.push(
    `- Isolated: **${report.isolated.passed}/${report.isolated.total}** in ${report.isolated.latencyMs}ms · tokens in/out/total: ${report.isolated.usage.inputTokens}/${report.isolated.usage.outputTokens}/${report.isolated.usage.totalTokens} · requests: ${report.isolated.requestCount}`
  );
  lines.push(
    `- Batch: **${report.batch.passed}/${report.batch.total}** in ${report.batch.latencyMs}ms · tokens in/out/total: ${report.batch.usage.inputTokens}/${report.batch.usage.outputTokens}/${report.batch.usage.totalTokens} · requests: ${report.batch.requestCount}`
  );
  lines.push(
    `- Suite false pass (isolated fail → batch pass): **${report.suiteFalsePass}**`
  );
  lines.push(
    `- Per-test FALSE_PASS: ${
      report.falsePassTestIds.length
        ? report.falsePassTestIds.join(", ")
        : "none"
    }`
  );
  lines.push(
    `- Per-test FALSE_FAIL: ${
      report.falseFailTestIds.length
        ? report.falseFailTestIds.join(", ")
        : "none"
    }`
  );
  if (report.batch.warnings.length) {
    lines.push(`- Batch warnings: ${report.batch.warnings.join(" | ")}`);
  }
  lines.push("");
  lines.push("| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const row of report.perTest) {
    lines.push(
      `| ${row.testId} | ${row.isolatedPass ? "PASS" : "FAIL"} | ${
        row.batchPass ? "PASS" : "FAIL"
      } | ${fmtBool(row.isolatedContentOk)}/${fmtBool(row.batchContentOk)} | ${fmtBool(row.isolatedContractOk)}/${fmtBool(row.batchContractOk)} | ${row.kind} |`
    );
  }
  lines.push("");
  lines.push("<details><summary>Raw outputs</summary>");
  lines.push("");
  for (const row of report.perTest) {
    lines.push(`**${row.testId}**`);
    lines.push("");
    lines.push("Isolated:");
    lines.push("```");
    lines.push(row.isolatedRaw || "(empty)");
    lines.push("```");
    lines.push("Batch:");
    lines.push("```");
    lines.push(row.batchRaw || "(empty)");
    lines.push("```");
  }
  lines.push("</details>");
  lines.push("");
  return lines.join("\n");
}

function fmtBool(v: boolean | null | undefined): string {
  if (v === true) return "✓";
  if (v === false) return "✕";
  if (v === null) return "?";
  return "—";
}
