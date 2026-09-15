/**
 * Self-check for Mission 08–09 pipeline helpers.
 * Run: npx tsx scripts/check-pipeline.ts
 */
import assert from "node:assert/strict";
import {
  defaultChainConnections,
  emptyConnections,
  evaluatePipelineConnections,
  evaluateSafetyConfig,
  portKey,
  simulatePipeline,
} from "../src/lib/missions/pipeline";
import type {
  PipelineConnections,
  PipelineTask,
  SafetyRuleConfig,
} from "../src/lib/types";

const expected = defaultChainConnections();

const minimalTask: PipelineTask = {
  title: "Pipeline",
  description: "test",
  blocks: [
    {
      id: "customer",
      title: "Customer",
      inputs: [],
      outputs: [{ id: "message", label: "message" }],
    },
    {
      id: "ai",
      title: "AI",
      inputs: [
        {
          id: "message",
          label: "message",
          allowed: [{ blockId: "customer", field: "message" }],
        },
      ],
      outputs: [{ id: "response", label: "response" }],
    },
    {
      id: "parse",
      title: "Parse JSON",
      inputs: [
        {
          id: "text",
          label: "text",
          allowed: [{ blockId: "ai", field: "response" }],
        },
      ],
      outputs: [
        { id: "data", label: "data" },
        { id: "data.priority", label: "data.priority" },
      ],
    },
    {
      id: "decision",
      title: "Decision",
      inputs: [
        {
          id: "priority",
          label: "priority",
          allowed: [
            { blockId: "parse", field: "data.priority" },
            { blockId: "ai", field: "response" },
            { blockId: "parse", field: "data" },
          ],
        },
      ],
      outputs: [{ id: "route", label: "route" }],
    },
    {
      id: "action",
      title: "Action",
      inputs: [
        {
          id: "route",
          label: "route",
          allowed: [{ blockId: "decision", field: "route" }],
        },
        {
          id: "message",
          label: "message",
          allowed: [{ blockId: "customer", field: "message" }],
        },
        {
          id: "priority",
          label: "priority",
          allowed: [{ blockId: "parse", field: "data.priority" }],
        },
      ],
      outputs: [],
    },
  ],
  expectedConnections: expected,
  checkLabel: "Check",
  passLabel: "OK",
};

assert.equal(portKey("decision", "priority"), "decision.priority");

const empty = emptyConnections(minimalTask);
assert.equal(empty["ai.message"], null);
assert.equal(empty["action.priority"], null);

assert.equal(
  evaluatePipelineConnections(expected as PipelineConnections, expected).ok,
  true
);

const wrongDecision: PipelineConnections = {
  ...expected,
  "decision.priority": { blockId: "ai", field: "response" },
};
const decisionFail = evaluatePipelineConnections(wrongDecision, expected);
assert.equal(decisionFail.ok, false);
if (!decisionFail.ok) {
  assert.equal(decisionFail.which, "decision_got_response");
}

const wrongObject: PipelineConnections = {
  ...expected,
  "decision.priority": { blockId: "parse", field: "data" },
};
const objectFail = evaluatePipelineConnections(wrongObject, expected);
assert.equal(objectFail.ok, false);
if (!objectFail.ok) {
  assert.equal(objectFail.which, "decision_got_object");
}

const message = "Billing is broken again";
const urgentJson = '{"sentiment":"NEGATIVE","priority":"URGENT"}';
const normalJson = '{"sentiment":"NEUTRAL","priority":"NORMAL"}';

const happyUrgent = simulatePipeline({
  connections: expected,
  message,
  aiResponse: urgentJson,
  expectedAction: "create_ticket",
});
assert.equal(happyUrgent.matchesExpected, true);
assert.equal(happyUrgent.action?.action, "create_ticket");
assert.equal(happyUrgent.route, "HUMAN_REVIEW");
assert.ok(happyUrgent.report.includes("ACTION SENT"));

const happyQueue = simulatePipeline({
  connections: expected,
  message,
  aiResponse: normalJson,
  expectedAction: "queue_message",
});
assert.equal(happyQueue.matchesExpected, true);
assert.equal(happyQueue.action?.action, "queue_message");
assert.equal(happyQueue.route, "STANDARD_QUEUE");

const badWiring = simulatePipeline({
  connections: wrongDecision,
  message,
  aiResponse: urgentJson,
  expectedAction: "create_ticket",
});
assert.equal(badWiring.matchesExpected, false);

const badJson = simulatePipeline({
  connections: expected,
  message,
  aiResponse: "not json at all",
  expectedAction: "create_ticket",
});
assert.equal(badJson.matchesExpected, false);
assert.equal(badJson.fallbackReason, "INVALID_AI_OUTPUT");

const safety: SafetyRuleConfig = {
  onParseFail: { target: "MANUAL_REVIEW", reason: "INVALID_AI_OUTPUT" },
  onInvalidPriority: { target: "MANUAL_REVIEW", reason: "INVALID_PRIORITY" },
  onActionFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
};

assert.equal(evaluateSafetyConfig(safety, safety).ok, true);
assert.equal(
  evaluateSafetyConfig(
    {
      ...safety,
      onParseFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
    },
    safety
  ).ok,
  false
);

const withFallback = simulatePipeline({
  connections: expected,
  message,
  aiResponse: "broken",
  safety,
  expectedFallback: "INVALID_AI_OUTPUT",
});
assert.equal(withFallback.matchesExpected, true);
assert.equal(withFallback.action?.action, "manual_review");
assert.ok(withFallback.report.includes("FALLBACK"));

const forceFail = simulatePipeline({
  connections: expected,
  message,
  aiResponse: urgentJson,
  safety,
  forceActionFailure: true,
  expectedFallback: "ACTION_FAILED",
});
assert.equal(forceFail.matchesExpected, true);
assert.equal(forceFail.fallbackReason, "ACTION_FAILED");

console.log("pipeline: ok");
