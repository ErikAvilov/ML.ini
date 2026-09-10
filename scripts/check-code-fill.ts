/**
 * Self-check for Mission 05 code-fill / logic route helpers.
 * Run: npx tsx scripts/check-code-fill.ts
 */
import assert from "node:assert/strict";
import {
  evaluateCodeFill,
  evaluateLogicRoute,
  normalizeCodeBlank,
} from "../src/lib/validation";

assert.equal(normalizeCodeBlank(`  priority  ==  'URGENT' `), 'priority == "URGENT"');

assert.equal(evaluateCodeFill('priority == "URGENT"', "priority", "URGENT"), true);
assert.equal(evaluateCodeFill("priority == 'URGENT'", "priority", "URGENT"), true);
assert.equal(evaluateCodeFill("priority==\"URGENT\"", "priority", "URGENT"), true);
assert.equal(evaluateCodeFill('(priority == "URGENT")', "priority", "URGENT"), true);
assert.equal(evaluateCodeFill('priority != "URGENT"', "priority", "URGENT"), false);
assert.equal(evaluateCodeFill('priority == "NORMAL"', "priority", "URGENT"), false);
assert.equal(evaluateCodeFill("", "priority", "URGENT"), false);

assert.equal(
  evaluateLogicRoute("URGENT", "URGENT", "HUMAN_REVIEW", "STANDARD_QUEUE"),
  "HUMAN_REVIEW"
);
assert.equal(
  evaluateLogicRoute("NORMAL", "URGENT", "HUMAN_REVIEW", "STANDARD_QUEUE"),
  "STANDARD_QUEUE"
);

console.log("code-fill: ok");
