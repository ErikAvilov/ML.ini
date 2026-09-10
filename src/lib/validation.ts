import type { Locale } from "@/i18n/config";
import { getCommonMessages, t } from "@/i18n/messages/common";
import { getMiraFormatFailLines } from "@/data/narrative/voice";
import type {
  ClassificationResult,
  ClassificationTest,
  MissionTestErrorKind,
  StructuredOutputSchema,
  TestSuiteSummary,
} from "@/lib/types";

export function normalizeClassification(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?;:]+$/g, "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Parse raw model output against the mission's allowed labels. */
export function parseAllowedLabel(
  raw: string,
  allowedOutputs: string[]
): string | null {
  const normalized = normalizeClassification(raw);
  for (const label of allowedOutputs) {
    if (normalizeClassification(label) === normalized) {
      return label;
    }
  }
  return null;
}

export function evaluateClassification(
  raw: string,
  expected: string,
  allowedOutputs: string[],
  message: string,
  testId: string,
  failHint?: string
): ClassificationResult {
  const normalized = parseAllowedLabel(raw, allowedOutputs);
  const isValidCategory = normalized !== null;
  const matchesExpected =
    isValidCategory &&
    normalizeClassification(normalized) === normalizeClassification(expected);

  return {
    raw,
    normalized,
    isValidCategory,
    matchesExpected,
    expected,
    message,
    testId,
    failHint,
    errorKind: matchesExpected
      ? null
      : isValidCategory
        ? "value"
        : "format",
    parsedFields: null,
  };
}

function canonicalizeFields(
  fields: Record<string, string>,
  schema: StructuredOutputSchema
): string {
  return schema.fields
    .map((f) => `${f.name}: ${fields[f.name]}`)
    .join("\n");
}

/**
 * Parse KEY: VALUE lines against a structured schema.
 * Rejects prose, missing fields, unknown fields, and invalid values.
 */
export function parseStructuredOutput(
  raw: string,
  schema: StructuredOutputSchema
):
  | { ok: true; fields: Record<string, string>; canonical: string }
  | { ok: false } {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length !== schema.fields.length) {
    return { ok: false };
  }

  const required = new Map(
    schema.fields.map((f) => [normalizeClassification(f.name), f])
  );
  const parsed: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^([A-Za-z_]+)\s*:\s*(.+)$/);
    if (!match) return { ok: false };

    const keyNorm = normalizeClassification(match[1]);
    const spec = required.get(keyNorm);
    if (!spec) return { ok: false };
    if (parsed[spec.name]) return { ok: false };

    const valueRaw = match[2].trim();
    const value = parseAllowedLabel(valueRaw, spec.allowedValues);
    if (!value) return { ok: false };

    parsed[spec.name] = value;
  }

  if (Object.keys(parsed).length !== schema.fields.length) {
    return { ok: false };
  }

  return {
    ok: true,
    fields: parsed,
    canonical: canonicalizeFields(parsed, schema),
  };
}

/** Soft-read allowed labels from free-form text (format failures). */
export function probeStructuredFieldValues(
  raw: string,
  schema: StructuredOutputSchema
): Record<string, string | null> {
  const tokens = new Set(
    normalizeClassification(raw)
      .split(/[^A-Z0-9]+/)
      .filter(Boolean)
  );

  const found: Record<string, string | null> = {};
  for (const field of schema.fields) {
    const ranked = [...field.allowedValues].sort(
      (a, b) =>
        normalizeClassification(b).length - normalizeClassification(a).length
    );
    let hit: string | null = null;
    for (const value of ranked) {
      if (tokens.has(normalizeClassification(value))) {
        hit = value;
        break;
      }
    }
    found[field.name] = hit;
  }
  return found;
}

function assessProbedContent(
  probed: Record<string, string | null>,
  expectedFields: Record<string, string>,
  schema: StructuredOutputSchema
): boolean | null {
  let sawMissing = false;
  for (const field of schema.fields) {
    const got = probed[field.name];
    const expected = expectedFields[field.name];
    if (!got) {
      sawMissing = true;
      continue;
    }
    if (
      normalizeClassification(got) !== normalizeClassification(expected ?? "")
    ) {
      return false;
    }
  }
  if (sawMissing) return null;
  return true;
}

function semanticErrorKind(
  fieldName: string
): Exclude<MissionTestErrorKind, "format" | null> {
  const n = normalizeClassification(fieldName);
  if (n === "SENTIMENT") return "sentiment";
  if (n === "PRIORITY") return "priority";
  return "value";
}

export function evaluateStructuredTest(
  raw: string,
  test: ClassificationTest,
  schema: StructuredOutputSchema
): ClassificationResult {
  const expectedFields = test.expectedFields ?? {};
  const expected =
    test.expected || canonicalizeFields(expectedFields, schema);

  const parsed = parseStructuredOutput(raw, schema);
  if (!parsed.ok) {
    const probed = probeStructuredFieldValues(raw, schema);
    const contentOk = assessProbedContent(probed, expectedFields, schema);
    const formatHint = test.failHints?.format ?? test.failHint;

    return {
      raw,
      normalized: null,
      isValidCategory: false,
      matchesExpected: false,
      expected,
      message: test.message,
      testId: test.id,
      failHint: contentOk === true ? formatHint : undefined,
      errorKind: "format",
      parsedFields: null,
      contentOk,
      contractOk: false,
      fieldMismatches: [],
    };
  }

  const mismatched = schema.fields.filter(
    (f) =>
      normalizeClassification(parsed.fields[f.name] ?? "") !==
      normalizeClassification(expectedFields[f.name] ?? "")
  );

  if (mismatched.length === 0) {
    return {
      raw,
      normalized: parsed.canonical,
      isValidCategory: true,
      matchesExpected: true,
      expected,
      message: test.message,
      testId: test.id,
      errorKind: null,
      parsedFields: parsed.fields,
      contentOk: true,
      contractOk: true,
      fieldMismatches: [],
    };
  }

  const primary = mismatched[0];
  const kind = semanticErrorKind(primary.name);
  const fieldHint = test.failHints?.fields?.[primary.name];

  return {
    raw,
    normalized: parsed.canonical,
    isValidCategory: true,
    matchesExpected: false,
    expected,
    message: test.message,
    testId: test.id,
    failHint: fieldHint ?? test.failHint,
    errorKind: kind,
    parsedFields: parsed.fields,
    contentOk: false,
    contractOk: true,
    fieldMismatches: mismatched.map((f) => f.name),
  };
}

function canonicalizeJsonFields(
  fields: Record<string, string>,
  schema: StructuredOutputSchema
): string {
  const obj: Record<string, string> = {};
  for (const field of schema.fields) {
    obj[field.name] = fields[field.name];
  }
  return `${JSON.stringify(obj, null, 2)}`;
}

export type JsonErrorCode = NonNullable<
  import("@/lib/types").ClassificationResult["jsonErrorCode"]
>;

export function classifyJsonParseFailure(raw: string, err: unknown): JsonErrorCode {
  const trimmed = raw.trim();
  const msg = err instanceof Error ? err.message.toLowerCase() : "";

  if (
    trimmed.includes("```") ||
    /^(here|voici|result|the result|output|réponse)\b/i.test(trimmed)
  ) {
    return "prose_wrapper";
  }
  if (/,\s*[}\]]/.test(trimmed)) return "trailing_comma";
  if (/(^|[{,]\s*)'[A-Za-z_]/.test(trimmed) || /:\s*'/.test(trimmed)) {
    return "single_quotes";
  }
  if (/[{,]\s*[A-Za-z_][A-Za-z0-9_]*\s*:/.test(trimmed)) {
    return "unquoted_keys";
  }
  if (
    msg.includes("unexpected end") ||
    (trimmed.startsWith("{") && !trimmed.endsWith("}"))
  ) {
    return "unclosed";
  }
  return "generic";
}

/**
 * Parse the entire model response as a JSON object matching the schema.
 * No fence stripping, no substring extraction, no repair.
 */
export function parseJsonStructuredOutput(
  raw: string,
  schema: StructuredOutputSchema
):
  | {
      ok: true;
      fields: Record<string, string>;
      canonical: string;
    }
  | {
      ok: false;
      jsonOk: boolean;
      fieldsOk: boolean;
      jsonErrorCode: JsonErrorCode;
      fields?: Record<string, string>;
      receivedKeys?: string[];
    } {
  const trimmed = raw.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    return {
      ok: false,
      jsonOk: false,
      fieldsOk: false,
      jsonErrorCode: classifyJsonParseFailure(raw, err),
    };
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    return {
      ok: false,
      jsonOk: true,
      fieldsOk: false,
      jsonErrorCode: "not_object",
    };
  }

  const record = parsed as Record<string, unknown>;
  const receivedKeys = Object.keys(record);
  const required = schema.fields.map((f) => f.name);
  const requiredSet = new Set(required);
  const extra = receivedKeys.filter((k) => !requiredSet.has(k));
  const missing = required.filter((k) => !receivedKeys.includes(k));

  // Prefer wrong_keys when required names are absent (aliases / renames).
  if (missing.length > 0) {
    return {
      ok: false,
      jsonOk: true,
      fieldsOk: false,
      jsonErrorCode: "wrong_keys",
      receivedKeys,
    };
  }
  if (extra.length > 0) {
    return {
      ok: false,
      jsonOk: true,
      fieldsOk: false,
      jsonErrorCode: "extra_fields",
      receivedKeys,
    };
  }
  if (receivedKeys.length !== required.length) {
    return {
      ok: false,
      jsonOk: true,
      fieldsOk: false,
      jsonErrorCode: "wrong_keys",
      receivedKeys,
    };
  }

  const fields: Record<string, string> = {};
  for (const spec of schema.fields) {
    const value = record[spec.name];
    if (typeof value !== "string") {
      return {
        ok: false,
        jsonOk: true,
        fieldsOk: false,
        jsonErrorCode: "invalid_values",
        receivedKeys,
      };
    }
    // Strict: exact allow-list match (no case folding).
    if (!spec.allowedValues.includes(value)) {
      return {
        ok: false,
        jsonOk: true,
        fieldsOk: false,
        jsonErrorCode: "invalid_values",
        fields: { ...fields, [spec.name]: value },
        receivedKeys,
      };
    }
    fields[spec.name] = value;
  }

  return {
    ok: true,
    fields,
    canonical: canonicalizeJsonFields(fields, schema),
  };
}

/**
 * Deterministic micro-task: player repairs broken JSON themselves.
 * Same strict parse rules as Mission 04 model-output validation — no repair, no extract.
 */
export function evaluatePayloadRepair(
  raw: string,
  expectedFields: Record<string, string>,
  schema: StructuredOutputSchema
):
  | { ok: true }
  | {
      ok: false;
      jsonErrorCode?: JsonErrorCode;
      contentMismatch?: boolean;
    } {
  const parsed = parseJsonStructuredOutput(raw, schema);
  if (!parsed.ok) {
    return { ok: false, jsonErrorCode: parsed.jsonErrorCode };
  }
  for (const [key, expected] of Object.entries(expectedFields)) {
    if (parsed.fields[key] !== expected) {
      return { ok: false, contentMismatch: true };
    }
  }
  return { ok: true };
}

/** Normalize a code-fill blank for comparison (quotes + whitespace). */
export function normalizeCodeBlank(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, '"');
}

/** Visible placeholder for unfilled slots in the editable starter. */
export const CODE_FILL_BLANK_MARK = "________";

type CodeFillSourceTask =
  | {
      mode: "logic";
      prefix: string;
      middle: string;
      suffix: string;
    }
  | {
      mode: "ai-integration";
      segments: string[];
      blanks: unknown[];
    };

/** Full starter source: scaffolding filled, learning blanks as ________. */
export function buildCodeFillStarterSource(task: CodeFillSourceTask): string {
  if (task.mode === "logic") {
    return `${task.prefix}${CODE_FILL_BLANK_MARK}${task.middle}${CODE_FILL_BLANK_MARK}${task.suffix}`;
  }
  let out = task.segments[0] ?? "";
  for (let i = 0; i < task.blanks.length; i++) {
    out += CODE_FILL_BLANK_MARK + (task.segments[i + 1] ?? "");
  }
  return out;
}

function cleanExtractedBlank(raw: string): string {
  const t = raw.trim();
  if (!t || t === CODE_FILL_BLANK_MARK || /^_+$/.test(t)) return "";
  return t;
}

/** Pull key + if-condition from free-edited Mission 05 source. */
export function extractLogicFillFromSource(source: string): {
  key: string;
  condition: string;
} {
  const priorityKey = source.match(
    /priority\s*=\s*result\[\s*["']([^"']*)["']\s*\]/
  );
  const anyKey = source.match(/result\[\s*["']([^"']*)["']\s*\]/);
  const key = cleanExtractedBlank(priorityKey?.[1] ?? anyKey?.[1] ?? "");

  const ifMatch = source.match(/\bif\s+([^\n]+?)\s*:/);
  const condition = cleanExtractedBlank(ifMatch?.[1] ?? "");
  return { key, condition };
}

/** Pull ai.ask args + priority key from free-edited Mission 06 source. */
export function extractAiIntegrationFillFromSource(source: string): {
  values: [string, string, string];
} {
  const ask = source.match(/ai\.ask\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/);
  const priorityKey = source.match(
    /priority\s*=\s*result\[\s*["']([^"']*)["']\s*\]/
  );
  const anyKey = source.match(/result\[\s*["']([^"']*)["']\s*\]/);
  return {
    values: [
      cleanExtractedBlank(ask?.[1] ?? ""),
      cleanExtractedBlank(ask?.[2] ?? ""),
      cleanExtractedBlank(priorityKey?.[1] ?? anyKey?.[1] ?? ""),
    ],
  };
}

/**
 * Accept blanks like: priority == "URGENT" (flexible spaces / quotes / optional parens).
 */
export function evaluateCodeFill(
  blank: string,
  compareVariable: string,
  compareValue: string
): boolean {
  const n = normalizeCodeBlank(blank);
  const escapedVar = compareVariable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedVal = compareValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `^\\(?\\s*${escapedVar}\\s*==\\s*"${escapedVal}"\\s*\\)?$`
  );
  return re.test(n);
}

/** Accept dict-key blanks like: priority or "priority". */
export function evaluateDictKeyBlank(
  blank: string,
  expectedKey: string
): boolean {
  const n = normalizeCodeBlank(blank).replace(/"/g, "");
  return n === expectedKey;
}

/** Both Mission 05 blanks must pass. */
export function evaluateCodeFillTask(
  keyBlank: string,
  conditionBlank: string,
  task: {
    expectedKey: string;
    compareVariable: string;
    compareValue: string;
  }
): { ok: true } | { ok: false; which: "key" | "condition" } {
  if (!evaluateDictKeyBlank(keyBlank, task.expectedKey)) {
    return { ok: false, which: "key" };
  }
  if (
    !evaluateCodeFill(
      conditionBlank,
      task.compareVariable,
      task.compareValue
    )
  ) {
    return { ok: false, which: "condition" };
  }
  return { ok: true };
}

/** Identifier blank: `instruction`, `message`, optional quotes. */
export function evaluateIdentifierBlank(
  blank: string,
  expected: string,
  stripQuotes = false
): boolean {
  let n = normalizeCodeBlank(blank);
  if (stripQuotes) n = n.replace(/"/g, "");
  return n === expected;
}

/** Mission 06 wiring blanks — order matches `task.blanks`. */
export function evaluateAiIntegrationFill(
  values: string[],
  blanks: Array<{ id: string; expected: string; stripQuotes?: boolean }>
): { ok: true } | { ok: false; blankId: string } {
  for (let i = 0; i < blanks.length; i++) {
    const blank = blanks[i];
    const value = values[i] ?? "";
    if (
      !evaluateIdentifierBlank(value, blank.expected, blank.stripQuotes === true)
    ) {
      return { ok: false, blankId: blank.id };
    }
  }
  return { ok: true };
}

/** Route from a verified priority==value condition (no Python runtime). */
export function evaluateLogicRoute(
  priority: string,
  compareValue: string,
  trueRoute: string,
  falseRoute: string
): string {
  return priority === compareValue ? trueRoute : falseRoute;
}

/**
 * Mission 06 RUN: model returns JSON → read priority → route.
 * Passes when the derived route matches `test.expected`.
 */
export function evaluateAiIntegrationRun(
  raw: string,
  test: ClassificationTest,
  opts: {
    compareValue: string;
    trueRoute: string;
    falseRoute: string;
    priorityKey?: string;
  }
): ClassificationResult {
  const priorityKey = opts.priorityKey ?? "priority";
  const trimmed = raw.trim();
  let priority: string | null = null;
  let jsonOk = false;

  try {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    const slice =
      start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed;
    const parsed = JSON.parse(slice) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      jsonOk = true;
      const value = (parsed as Record<string, unknown>)[priorityKey];
      if (typeof value === "string") priority = value.trim().toUpperCase();
    }
  } catch {
    jsonOk = false;
  }

  if (!jsonOk || !priority) {
    return {
      raw,
      normalized: null,
      isValidCategory: false,
      matchesExpected: false,
      expected: test.expected,
      message: test.message,
      testId: test.id,
      failHint: test.failHints?.format ?? test.failHint,
      jsonOk: false,
      errorKind: "format",
    };
  }

  const route = evaluateLogicRoute(
    priority,
    opts.compareValue,
    opts.trueRoute,
    opts.falseRoute
  );
  const matches = route === test.expected;

  return {
    raw,
    normalized: route,
    isValidCategory: true,
    matchesExpected: matches,
    expected: test.expected,
    message: test.message,
    testId: test.id,
    failHint: matches
      ? undefined
      : (test.failHints?.fields?.priority ?? test.failHint),
    jsonOk: true,
    parsedFields: { [priorityKey]: priority, route },
  };
}

export function evaluateJsonStructuredTest(
  raw: string,
  test: ClassificationTest,
  schema: StructuredOutputSchema
): ClassificationResult {
  const expectedFields = test.expectedFields ?? {};
  const expected =
    test.expected || canonicalizeJsonFields(expectedFields, schema);
  const parsed = parseJsonStructuredOutput(raw, schema);

  if (!parsed.ok) {
    const formatHint = test.failHints?.format ?? test.failHint;
    let contentOk: boolean | null = null;
    if (parsed.fields) {
      contentOk = assessProbedContent(
        Object.fromEntries(
          schema.fields.map((f) => [f.name, parsed.fields?.[f.name] ?? null])
        ),
        expectedFields,
        schema
      );
    } else if (parsed.jsonOk === false) {
      // Prose / invalid JSON: soft-probe legacy KEY: VALUE style for pedagogy
      const probed = probeStructuredFieldValues(raw, {
        fields: schema.fields.map((f) => ({
          name: f.name.toUpperCase(),
          allowedValues: f.allowedValues,
        })),
      });
      // Map uppercase probe keys back — soft content signal only
      const mapped: Record<string, string | null> = {};
      for (const f of schema.fields) {
        mapped[f.name] =
          probed[f.name.toUpperCase()] ?? probed[f.name] ?? null;
      }
      contentOk = assessProbedContent(mapped, expectedFields, schema);
    }

    return {
      raw,
      normalized: null,
      isValidCategory: false,
      matchesExpected: false,
      expected,
      message: test.message,
      testId: test.id,
      failHint:
        parsed.jsonErrorCode === "prose_wrapper" || contentOk === true
          ? formatHint
          : undefined,
      errorKind: "json",
      parsedFields: parsed.fields ?? null,
      contentOk,
      contractOk: false,
      jsonOk: parsed.jsonOk,
      fieldsOk: parsed.fieldsOk,
      jsonErrorCode: parsed.jsonErrorCode,
      fieldMismatches: [],
    };
  }

  const mismatched = schema.fields.filter(
    (f) => parsed.fields[f.name] !== expectedFields[f.name]
  );

  if (mismatched.length === 0) {
    return {
      raw,
      normalized: parsed.canonical,
      isValidCategory: true,
      matchesExpected: true,
      expected,
      message: test.message,
      testId: test.id,
      errorKind: null,
      parsedFields: parsed.fields,
      contentOk: true,
      contractOk: true,
      jsonOk: true,
      fieldsOk: true,
      fieldMismatches: [],
    };
  }

  const primary = mismatched[0];
  return {
    raw,
    normalized: parsed.canonical,
    isValidCategory: true,
    matchesExpected: false,
    expected,
    message: test.message,
    testId: test.id,
    failHint: test.failHints?.fields?.[primary.name] ?? test.failHint,
    errorKind: semanticErrorKind(primary.name),
    parsedFields: parsed.fields,
    contentOk: false,
    contractOk: true,
    jsonOk: true,
    fieldsOk: true,
    fieldMismatches: mismatched.map((f) => f.name),
  };
}

export function evaluateMissionTest(
  raw: string,
  test: ClassificationTest,
  allowedOutputs: string[],
  schema?: StructuredOutputSchema
): ClassificationResult {
  if (schema && test.expectedFields) {
    if (schema.format === "json") {
      return evaluateJsonStructuredTest(raw, test, schema);
    }
    return evaluateStructuredTest(raw, test, schema);
  }
  return evaluateClassification(
    raw,
    test.expected,
    allowedOutputs,
    test.message,
    test.id,
    test.failHint
  );
}

function isStructuredResult(r: ClassificationResult): boolean {
  return r.contractOk !== undefined;
}

/**
 * Suite-level feedback only — one short explanation.
 * Per-test Expected/Received + field hints live in TestResults.
 */
export function buildFeedback(
  results: ClassificationResult[],
  locale: Locale
): { feedback: string; feedbackSpeaker: "mira" | null } {
  const messages = getCommonMessages(locale);
  const invalid = results.filter((r) => !r.isValidCategory);
  const wrong = results.filter((r) => r.isValidCategory && !r.matchesExpected);
  const passed = results.filter((r) => r.matchesExpected).length;
  const total = results.length;

  if (passed === total) {
    return {
      feedback: messages.feedbackAllPassed,
      feedbackSpeaker: null,
    };
  }

  const structured = results.some(isStructuredResult);

  if (structured) {
    const jsonResults = results.filter((r) => r.jsonOk !== undefined);
    if (jsonResults.length > 0) {
      const jsonFails = jsonResults.filter((r) => r.jsonOk === false);
      const fieldFails = jsonResults.filter(
        (r) => r.jsonOk === true && r.fieldsOk === false
      );
      const contentFails = jsonResults.filter(
        (r) => r.contractOk === true && !r.matchesExpected
      );

      if (jsonFails.some((r) => r.contentOk === true)) {
        return {
          feedback: messages.feedbackJsonContentOkFormatBad,
          feedbackSpeaker: null,
        };
      }
      if (jsonFails.some((r) => r.jsonErrorCode === "prose_wrapper")) {
        return {
          feedback: messages.feedbackJsonProseWrapper,
          feedbackSpeaker: null,
        };
      }
      if (jsonFails.length > 0) {
        const code = jsonFails[0].jsonErrorCode;
        const mapped =
          code === "trailing_comma"
            ? messages.feedbackJsonTrailingComma
            : code === "unquoted_keys"
              ? messages.feedbackJsonUnquotedKeys
              : code === "single_quotes"
                ? messages.feedbackJsonSingleQuotes
                : code === "unclosed"
                  ? messages.feedbackJsonUnclosed
                  : messages.feedbackJsonInvalid;
        return { feedback: mapped, feedbackSpeaker: null };
      }
      if (fieldFails.length > 0) {
        const code = fieldFails[0].jsonErrorCode;
        if (code === "extra_fields") {
          return {
            feedback: messages.feedbackJsonExtraFields,
            feedbackSpeaker: null,
          };
        }
        return {
          feedback: messages.feedbackJsonWrongKeys,
          feedbackSpeaker: null,
        };
      }
      if (contentFails.length > 0) {
        return {
          feedback: messages.feedbackWrongClass,
          feedbackSpeaker: null,
        };
      }
      return {
        feedback: t(messages.feedbackPartial, { passed, total }),
        feedbackSpeaker: null,
      };
    }

    const formatFails = results.filter((r) => r.contractOk === false);
    const contentFails = results.filter(
      (r) => r.contractOk === true && !r.matchesExpected
    );

    if (formatFails.some((r) => r.contentOk === true)) {
      return {
        feedback: messages.feedbackFormatSummary,
        feedbackSpeaker: null,
      };
    }

    if (formatFails.length > 0 && contentFails.length === 0) {
      return {
        feedback: messages.feedbackInvalidFormat,
        feedbackSpeaker: null,
      };
    }

    if (contentFails.length > 0) {
      return {
        feedback: messages.feedbackWrongClass,
        feedbackSpeaker: null,
      };
    }

    return {
      feedback: t(messages.feedbackPartial, { passed, total }),
      feedbackSpeaker: null,
    };
  }

  if (invalid.length > 0) {
    const withHint = invalid.find((r) => r.failHint?.trim());
    if (withHint?.failHint) {
      return {
        feedback: `${messages.feedbackFormatError}\n${withHint.failHint}`,
        feedbackSpeaker: null,
      };
    }
    return {
      feedback: getMiraFormatFailLines(locale).join("\n"),
      feedbackSpeaker: "mira",
    };
  }

  if (wrong.length > 0) {
    const first = wrong[0];
    const hint = first.failHint?.trim();
    if (hint) {
      return { feedback: hint, feedbackSpeaker: null };
    }
    if (first.errorKind === "sentiment") {
      return {
        feedback: messages.feedbackSentimentError,
        feedbackSpeaker: null,
      };
    }
    if (first.errorKind === "priority") {
      return {
        feedback: messages.feedbackPriorityError,
        feedbackSpeaker: null,
      };
    }
    return {
      feedback: messages.feedbackWrongClass,
      feedbackSpeaker: null,
    };
  }

  return {
    feedback: t(messages.feedbackPartial, { passed, total }),
    feedbackSpeaker: null,
  };
}

export function summarizeSuite(
  results: ClassificationResult[],
  locale: Locale
): TestSuiteSummary {
  const passed = results.filter((r) => r.matchesExpected).length;
  const total = results.length;
  const { feedback, feedbackSpeaker } = buildFeedback(results, locale);

  return {
    passed,
    total,
    results,
    feedback,
    feedbackSpeaker,
    allPassed: passed === total && total > 0,
  };
}

export function xpForLevel(level: number): number {
  return level * 200;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

export function xpProgressInLevel(xp: number): {
  level: number;
  current: number;
  needed: number;
  ratio: number;
} {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const needed = xpForLevel(level);
  return {
    level,
    current: remaining,
    needed,
    ratio: needed === 0 ? 0 : remaining / needed,
  };
}
