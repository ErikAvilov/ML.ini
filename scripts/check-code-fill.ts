/**
 * Self-check for Mission 05/06/07 code-fill helpers.
 * Run: npx tsx scripts/check-code-fill.ts
 */
import assert from "node:assert/strict";
import {
  buildCodeFillStarterSource,
  CODE_FILL_BLANK_MARK,
  evaluateAiIntegrationFill,
  evaluateAiIntegrationRun,
  evaluateCodeFill,
  evaluateCodeFillTask,
  evaluateDictKeyBlank,
  evaluateIdentifierBlank,
  evaluateLogicRoute,
  evaluateServiceActionFill,
  evaluateServiceActionRun,
  extractAiIntegrationFillFromSource,
  extractLogicFillFromSource,
  extractServiceActionFillFromSource,
  normalizeCodeBlank,
} from "../src/lib/validation";
import {
  createSupportService,
  formatSupportActionReport,
  matchSupportCall,
  simulateServiceAction,
} from "../src/lib/missions/support-service";

assert.equal(normalizeCodeBlank(`  priority  ==  'URGENT' `), 'priority == "URGENT"');

assert.equal(evaluateDictKeyBlank("priority", "priority"), true);
assert.equal(evaluateDictKeyBlank('"priority"', "priority"), true);
assert.equal(evaluateDictKeyBlank("sentiment", "priority"), false);

assert.equal(evaluateCodeFill('priority == "URGENT"', "priority", "URGENT"), true);
assert.equal(evaluateCodeFill("priority == 'URGENT'", "priority", "URGENT"), true);
assert.equal(evaluateCodeFill('priority != "URGENT"', "priority", "URGENT"), false);

const task = {
  expectedKey: "priority",
  compareVariable: "priority",
  compareValue: "URGENT",
};
assert.equal(evaluateCodeFillTask("priority", 'priority == "URGENT"', task).ok, true);
assert.equal(
  evaluateCodeFillTask("sentiment", 'priority == "URGENT"', task).ok,
  false
);
assert.equal(
  (evaluateCodeFillTask("sentiment", 'priority == "URGENT"', task) as { which: string })
    .which,
  "key"
);
assert.equal(
  (evaluateCodeFillTask("priority", 'priority == "NORMAL"', task) as { which: string })
    .which,
  "condition"
);

assert.equal(
  evaluateLogicRoute("URGENT", "URGENT", "HUMAN_REVIEW", "STANDARD_QUEUE"),
  "HUMAN_REVIEW"
);
assert.equal(
  evaluateLogicRoute("NORMAL", "URGENT", "HUMAN_REVIEW", "STANDARD_QUEUE"),
  "STANDARD_QUEUE"
);

assert.equal(evaluateIdentifierBlank("instruction", "instruction"), true);
assert.equal(evaluateIdentifierBlank(" message ", "message"), true);
assert.equal(evaluateIdentifierBlank('"priority"', "priority", true), true);

const blanks = [
  { id: "instruction", expected: "instruction" },
  { id: "message", expected: "message" },
  { id: "priority", expected: "priority", stripQuotes: true },
];
assert.equal(
  evaluateAiIntegrationFill(["instruction", "message", "priority"], blanks).ok,
  true
);
assert.equal(
  (evaluateAiIntegrationFill(["prompt", "message", "priority"], blanks) as {
    blankId: string;
  }).blankId,
  "instruction"
);
assert.equal(
  (evaluateAiIntegrationFill(["instruction", "msg", "priority"], blanks) as {
    blankId: string;
  }).blankId,
  "message"
);

const logicStarter = buildCodeFillStarterSource({
  mode: "logic",
  prefix: 'priority = result["',
  middle: '"]\n\nif ',
  suffix: ':\n    route = "HUMAN_REVIEW"',
});
assert.ok(logicStarter.includes(CODE_FILL_BLANK_MARK));
assert.deepEqual(extractLogicFillFromSource(logicStarter), {
  key: "",
  condition: "",
});
assert.deepEqual(
  extractLogicFillFromSource(
    'priority = result["priority"]\n\nif priority == "URGENT":\n    route = "HUMAN_REVIEW"'
  ),
  { key: "priority", condition: 'priority == "URGENT"' }
);

const aiExtract = extractAiIntegrationFillFromSource(
  'response = ai.ask(instruction, message)\npriority = result["priority"]'
);
assert.deepEqual(aiExtract.values, ["instruction", "message", "priority"]);

const pass = evaluateAiIntegrationRun(
  '{"sentiment":"NEGATIVE","priority":"URGENT"}',
  {
    id: "t1",
    message: "charged twice",
    expected: "HUMAN_REVIEW",
  },
  {
    compareValue: "URGENT",
    trueRoute: "HUMAN_REVIEW",
    falseRoute: "STANDARD_QUEUE",
  }
);
assert.equal(pass.matchesExpected, true);
assert.equal(pass.normalized, "HUMAN_REVIEW");

const fail = evaluateAiIntegrationRun(
  '{"sentiment":"NEUTRAL","priority":"NORMAL"}',
  {
    id: "t1",
    message: "charged twice",
    expected: "HUMAN_REVIEW",
  },
  {
    compareValue: "URGENT",
    trueRoute: "HUMAN_REVIEW",
    falseRoute: "STANDARD_QUEUE",
  }
);
assert.equal(fail.matchesExpected, false);
assert.equal(fail.normalized, "STANDARD_QUEUE");

const badJson = evaluateAiIntegrationRun(
  "not json",
  { id: "t1", message: "x", expected: "HUMAN_REVIEW" },
  {
    compareValue: "URGENT",
    trueRoute: "HUMAN_REVIEW",
    falseRoute: "STANDARD_QUEUE",
  }
);
assert.equal(badJson.matchesExpected, false);
assert.equal(badJson.jsonOk, false);

// --- Mission 07 service-action ---
const goodSource = `
if route == "HUMAN_REVIEW":
    support.create_ticket(
        message=message,
        priority=result["priority"]
    )
else:
    support.queue_message(
        message=message
    )
`;
const extracted = extractServiceActionFillFromSource(goodSource);
assert.deepEqual(extracted, {
  humanMethod: "create_ticket",
  humanMessage: "message",
  humanPriority: 'result["priority"]',
  queueMethod: "queue_message",
  queueMessage: "message",
});
assert.equal(evaluateServiceActionFill(extracted).ok, true);

assert.equal(
  (
    evaluateServiceActionFill({
      ...extracted,
      humanPriority: '"URGENT"',
    }) as { which: string }
  ).which,
  "humanPriorityHardcoded"
);
assert.equal(
  (
    evaluateServiceActionFill({
      ...extracted,
      humanPriority: "result",
    }) as { which: string }
  ).which,
  "humanPriorityObject"
);
assert.equal(
  (
    evaluateServiceActionFill({
      ...extracted,
      humanMethod: "queue_message",
    }) as { which: string }
  ).which,
  "humanMethod"
);

const support = createSupportService();
const call = simulateServiceAction(support, {
  route: "HUMAN_REVIEW",
  priority: "URGENT",
  message: "My card was charged twice.",
});
assert.equal(call.action, "create_ticket");
assert.ok(
  matchSupportCall(call, {
    action: "create_ticket",
    message: "My card was charged twice.",
    priority: "URGENT",
  })
);
assert.ok(formatSupportActionReport(call).includes("ACTION SENT"));
assert.ok(formatSupportActionReport(call).includes("create_ticket"));

const runPass = evaluateServiceActionRun(
  {
    id: "t1",
    message: "My card was charged twice.",
    expected: "create_ticket",
    serviceFixture: { route: "HUMAN_REVIEW", priority: "URGENT" },
  },
  { humanRoute: "HUMAN_REVIEW" }
);
assert.equal(runPass.matchesExpected, true);
assert.equal(runPass.normalized, "create_ticket");

const runQueue = evaluateServiceActionRun(
  {
    id: "t2",
    message: "Where can I download my invoice?",
    expected: "queue_message",
    serviceFixture: { route: "STANDARD_QUEUE", priority: "NORMAL" },
  },
  { humanRoute: "HUMAN_REVIEW" }
);
assert.equal(runQueue.matchesExpected, true);
assert.equal(runQueue.normalized, "queue_message");

const serviceStarter = buildCodeFillStarterSource({
  mode: "service-action",
  segments: ["support.", "(\n  message=", "\n)"],
  blanks: [{}, {}],
});
assert.ok(serviceStarter.includes(CODE_FILL_BLANK_MARK));

console.log("code-fill: ok");
