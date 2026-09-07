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

export function evaluateMissionTest(
  raw: string,
  test: ClassificationTest,
  allowedOutputs: string[],
  schema?: StructuredOutputSchema
): ClassificationResult {
  if (schema && test.expectedFields) {
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
