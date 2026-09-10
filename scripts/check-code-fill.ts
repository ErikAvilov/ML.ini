/**
 * Self-check for Mission 05 code-fill / logic route helpers.
 * Run: npx tsx scripts/check-code-fill.ts
 */
import assert from "node:assert/strict";
import {
  evaluateCodeFill,
  evaluateCodeFillTask,
  evaluateDictKeyBlank,
  evaluateLogicRoute,
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

console.log("code-fill: ok");
