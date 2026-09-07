import {
  EVAL_REQUEST_TIMEOUT_MS,
  MODEL,
  completeChat,
  hasAICredentials,
} from "@/lib/ai-client";

export interface BatchTestItem {
  testId: string;
  message: string;
}

export interface BatchClassifyResult {
  results: Array<{ testId: string; rawOutput: string }>;
  warnings: string[];
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

function buildBatchUserPayload(
  instruction: string,
  tests: BatchTestItem[]
): string {
  const items = tests.map((t) => ({
    testId: t.testId,
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

async function withRetries<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
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

/**
 * Single LLM call for all mission tests.
 * Outer JSON schema only — rawOutput stays player-instruction-driven.
 */
export async function classifyBatchItems(options: {
  instruction: string;
  tests: BatchTestItem[];
  model?: string;
}): Promise<BatchClassifyResult> {
  if (!hasAICredentials()) {
    throw new Error("MISSING_KEY");
  }

  const model = options.model ?? MODEL;
  const tests = options.tests;
  const maxOutputTokens = Math.min(8192, Math.max(2048, tests.length * 400));

  return withRetries(async () => {
    const warnings: string[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      EVAL_REQUEST_TIMEOUT_MS
    );

    try {
      let content = "";

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
              content: buildBatchUserPayload(options.instruction, tests),
            },
          ],
        });
        content = result.text;
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
              content: buildBatchUserPayload(options.instruction, tests),
            },
          ],
        });
        content = result.text;
      }

      const results: Array<{ testId: string; rawOutput: string }> = [];

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
            results.push({
              testId: row.testId,
              rawOutput: typeof row.rawOutput === "string" ? row.rawOutput : "",
            });
          }
        }
      } catch {
        warnings.push("Failed to parse batch JSON wrapper");
      }

      return { results, warnings };
    } finally {
      clearTimeout(timeout);
    }
  });
}
