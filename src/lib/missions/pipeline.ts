/**
 * Fixed-block pipeline simulation for Missions 08–10.
 * No free canvas — blocks and ports are canonical.
 */

import type {
  ClassificationResult,
  ClassificationTest,
  PipelineConnections,
  PipelinePortRef,
  PipelineTask,
  SafetyReasonCode,
  SafetyRuleConfig,
} from "@/lib/types";
import {
  createSupportService,
  formatSupportActionReport,
  type SupportCall,
} from "@/lib/missions/support-service";

export const ALLOWED_PRIORITIES = new Set(["URGENT", "NORMAL"]);

export function portKey(blockId: string, inputId: string): string {
  return `${blockId}.${inputId}`;
}

export function samePort(
  a: PipelinePortRef | null | undefined,
  b: PipelinePortRef | null | undefined
): boolean {
  if (!a || !b) return false;
  return a.blockId === b.blockId && a.field === b.field;
}

export type PipelineConnectionFail =
  | "ai_needs_message"
  | "parse_needs_response"
  | "decision_needs_priority_field"
  | "decision_got_response"
  | "decision_got_object"
  | "decision_got_sentiment"
  | "action_missing_message"
  | "action_missing_route"
  | "action_missing_priority"
  | "generic";

/** Compare learner connections to expected — returns first pedagogical fail. */
export function evaluatePipelineConnections(
  connections: PipelineConnections,
  expected: Record<string, PipelinePortRef>
): { ok: true } | { ok: false; which: PipelineConnectionFail; key: string } {
  for (const [key, want] of Object.entries(expected)) {
    const got = connections[key] ?? null;
    if (!samePort(got, want)) {
      return { ok: false, which: classifyConnectionFail(key, got, want), key };
    }
  }
  return { ok: true };
}

function classifyConnectionFail(
  key: string,
  got: PipelinePortRef | null,
  want: PipelinePortRef
): PipelineConnectionFail {
  if (key === "ai.message") return "ai_needs_message";
  if (key === "parse.text") {
    if (got?.blockId === "ai" && got.field === "response") {
      /* wrong somehow */
    }
    return "parse_needs_response";
  }
  if (key === "decision.priority") {
    if (got?.blockId === "ai" && got.field === "response") {
      return "decision_got_response";
    }
    if (got?.blockId === "parse" && got.field === "data") {
      return "decision_got_object";
    }
    if (got?.field === "data.sentiment" || got?.field === "sentiment") {
      return "decision_got_sentiment";
    }
    if (want.field.includes("priority")) return "decision_needs_priority_field";
  }
  if (key === "action.message") return "action_missing_message";
  if (key === "action.route") return "action_missing_route";
  if (key === "action.priority") return "action_missing_priority";
  return "generic";
}

export type PipelineStepId =
  | "customer"
  | "ai"
  | "parse"
  | "decision"
  | "action"
  | "fallback";

export type PipelineSimStep = {
  id: PipelineStepId;
  ok: boolean | null; // null = skipped
  detail?: string;
};

export type PipelineSimResult = {
  steps: PipelineSimStep[];
  route: string | null;
  priority: string | null;
  action: SupportCall | null;
  fallbackReason: SafetyReasonCode | null;
  report: string;
  matchesExpected: boolean;
};

function parseAiJson(raw: string): {
  ok: boolean;
  data: Record<string, string> | null;
} {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const slice =
      start >= 0 && end > start ? raw.slice(start, end + 1) : raw.trim();
    const parsed = JSON.parse(slice) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, data: null };
    }
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string") data[k] = v;
    }
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

export type PipelineSimOptions = {
  connections: PipelineConnections;
  message: string;
  /** Deterministic AI fixture text (JSON or invalid). */
  aiResponse: string;
  urgentPriority?: string;
  humanRoute?: string;
  queueRoute?: string;
  /** When set, enable safety fallbacks (Mission 09+). */
  safety?: SafetyRuleConfig | null;
  forceActionFailure?: boolean;
  expectedAction?: string;
  expectedFallback?: SafetyReasonCode | null;
};

/**
 * Run the fixed pipeline with learner connections + deterministic AI fixture.
 */
export function simulatePipeline(opts: PipelineSimOptions): PipelineSimResult {
  const humanRoute = opts.humanRoute ?? "HUMAN_REVIEW";
  const queueRoute = opts.queueRoute ?? "STANDARD_QUEUE";
  const urgent = opts.urgentPriority ?? "URGENT";
  const steps: PipelineSimStep[] = [
    { id: "customer", ok: true, detail: opts.message },
  ];

  const aiIn = opts.connections["ai.message"];
  if (!samePort(aiIn, { blockId: "customer", field: "message" })) {
    steps.push({ id: "ai", ok: false, detail: "missing message" });
    return failEarly(steps, opts);
  }
  steps.push({ id: "ai", ok: true, detail: "response received" });

  const parseIn = opts.connections["parse.text"];
  if (!samePort(parseIn, { blockId: "ai", field: "response" })) {
    steps.push({ id: "parse", ok: false, detail: "missing response" });
    return failEarly(steps, opts);
  }

  const parsed = parseAiJson(opts.aiResponse);
  if (!parsed.ok || !parsed.data) {
    steps.push({ id: "parse", ok: false, detail: "invalid JSON" });
    steps.push({ id: "decision", ok: null });
    steps.push({ id: "action", ok: null });
    return applyFallback(steps, opts, "INVALID_AI_OUTPUT");
  }
  steps.push({ id: "parse", ok: true, detail: "JSON ok" });

  const priorityPort = opts.connections["decision.priority"];
  const priority =
    priorityPort?.field === "data.priority"
      ? parsed.data.priority?.trim().toUpperCase() ?? null
      : null;

  if (
    !samePort(priorityPort, { blockId: "parse", field: "data.priority" }) ||
    !priority
  ) {
    steps.push({ id: "decision", ok: false, detail: "priority missing" });
    steps.push({ id: "action", ok: null });
    return applyFallback(steps, opts, "INVALID_PRIORITY");
  }

  if (!ALLOWED_PRIORITIES.has(priority)) {
    steps.push({
      id: "decision",
      ok: false,
      detail: `unknown priority ${priority}`,
    });
    steps.push({ id: "action", ok: null });
    return applyFallback(steps, opts, "INVALID_PRIORITY");
  }

  const route = priority === urgent ? humanRoute : queueRoute;
  steps.push({ id: "decision", ok: true, detail: route });

  const actionRoute = opts.connections["action.route"];
  const actionMessage = opts.connections["action.message"];
  const actionPriority = opts.connections["action.priority"];
  if (
    !samePort(actionRoute, { blockId: "decision", field: "route" }) ||
    !samePort(actionMessage, { blockId: "customer", field: "message" }) ||
    !samePort(actionPriority, { blockId: "parse", field: "data.priority" })
  ) {
    steps.push({ id: "action", ok: false, detail: "inputs incomplete" });
    return applyFallback(steps, opts, "ACTION_FAILED");
  }

  const support = createSupportService();
  if (opts.forceActionFailure) support.failNextAction(true);

  try {
    if (route === humanRoute) {
      support.create_ticket(opts.message, priority);
    } else {
      support.queue_message(opts.message);
    }
  } catch {
    steps.push({ id: "action", ok: false, detail: "action failed" });
    return applyFallback(steps, opts, "ACTION_FAILED");
  }

  const call = support.calls[0] ?? null;
  steps.push({
    id: "action",
    ok: true,
    detail: call ? `support.${call.action}` : undefined,
  });

  const report = call
    ? [
        "INPUT",
        `"${opts.message}"`,
        "",
        "MILDRED RESULT",
        opts.aiResponse.trim(),
        "",
        "ROUTE",
        route,
        "",
        formatSupportActionReport(call),
      ].join("\n")
    : "";

  const matches =
    opts.expectedFallback == null &&
    (opts.expectedAction
      ? call?.action === opts.expectedAction
      : true) &&
    call?.args.message === opts.message;

  return {
    steps,
    route,
    priority,
    action: call,
    fallbackReason: null,
    report,
    matchesExpected: Boolean(matches),
  };
}

function failEarly(
  steps: PipelineSimStep[],
  opts: PipelineSimOptions
): PipelineSimResult {
  return {
    steps,
    route: null,
    priority: null,
    action: null,
    fallbackReason: null,
    report: steps.map((s) => `${s.id}: ${s.ok === false ? "✕" : "✓"}`).join("\n"),
    matchesExpected: false,
  };
}

function applyFallback(
  steps: PipelineSimStep[],
  opts: PipelineSimOptions,
  reason: SafetyReasonCode
): PipelineSimResult {
  const safety = opts.safety;
  if (!safety) {
    return {
      steps,
      route: null,
      priority: null,
      action: null,
      fallbackReason: reason,
      report: `PARSE/DECISION failed · no safety configured (${reason})`,
      matchesExpected: opts.expectedFallback === reason,
    };
  }

  const rule =
    reason === "INVALID_AI_OUTPUT"
      ? safety.onParseFail
      : reason === "INVALID_PRIORITY"
        ? safety.onInvalidPriority
        : safety.onActionFail;

  const support = createSupportService();
  support.manual_review(opts.message, rule.reason);
  const call = support.calls[0]!;
  steps.push({
    id: "fallback",
    ok: true,
    detail: `MANUAL REVIEW · ${rule.reason}`,
  });

  const report = [
    "FALLBACK",
    "✓ MANUAL REVIEW",
    "",
    "reason:",
    rule.reason,
    "",
    "message:",
    `"${opts.message}"`,
  ].join("\n");

  const matches =
    opts.expectedFallback === reason && rule.reason === reason;

  return {
    steps,
    route: null,
    priority: null,
    action: call,
    fallbackReason: reason,
    report,
    matchesExpected: matches,
  };
}

/** Build ClassificationResult from a pipeline simulation. */
export function pipelineResultToClassification(
  test: ClassificationTest,
  sim: PipelineSimResult
): ClassificationResult {
  return {
    raw: sim.report,
    normalized:
      sim.fallbackReason ??
      sim.action?.action ??
      sim.route ??
      null,
    isValidCategory: sim.matchesExpected || sim.action != null,
    matchesExpected: sim.matchesExpected,
    expected: test.expected,
    message: test.message,
    testId: test.id,
    failHint: sim.matchesExpected ? undefined : test.failHint,
    parsedFields: {
      ...(sim.route ? { route: sim.route } : {}),
      ...(sim.priority ? { priority: sim.priority } : {}),
      ...(sim.action ? { action: sim.action.action } : {}),
      ...(sim.fallbackReason ? { fallback: sim.fallbackReason } : {}),
    },
  };
}

/** Canonical Mission 08 expected connections. */
export function defaultChainConnections(): Record<string, PipelinePortRef> {
  return {
    "ai.message": { blockId: "customer", field: "message" },
    "parse.text": { blockId: "ai", field: "response" },
    "decision.priority": { blockId: "parse", field: "data.priority" },
    "action.route": { blockId: "decision", field: "route" },
    "action.message": { blockId: "customer", field: "message" },
    "action.priority": { blockId: "parse", field: "data.priority" },
  };
}

export function emptyConnections(task: PipelineTask): PipelineConnections {
  const out: PipelineConnections = {};
  for (const block of task.blocks) {
    for (const input of block.inputs) {
      out[portKey(block.id, input.id)] = null;
    }
  }
  return out;
}

export function evaluateSafetyConfig(
  config: SafetyRuleConfig,
  expected: SafetyRuleConfig
): { ok: true } | { ok: false; which: string } {
  if (config.onParseFail.target !== expected.onParseFail.target) {
    return { ok: false, which: "parseTarget" };
  }
  if (config.onParseFail.reason !== expected.onParseFail.reason) {
    return { ok: false, which: "parseReason" };
  }
  if (config.onInvalidPriority.target !== expected.onInvalidPriority.target) {
    return { ok: false, which: "priorityTarget" };
  }
  if (config.onInvalidPriority.reason !== expected.onInvalidPriority.reason) {
    return { ok: false, which: "priorityReason" };
  }
  if (config.onActionFail.target !== expected.onActionFail.target) {
    return { ok: false, which: "actionTarget" };
  }
  if (config.onActionFail.reason !== expected.onActionFail.reason) {
    return { ok: false, which: "actionReason" };
  }
  return { ok: true };
}
