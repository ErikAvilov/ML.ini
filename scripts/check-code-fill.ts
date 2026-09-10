/**
 * Self-check for Mission 05/06 code-fill helpers.
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
  extractAiIntegrationFillFromSource,
  extractLogicFillFromSource,
  normalizeCodeBlank,
} from "../src/lib/validation";

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

console.log("code-fill: ok");
