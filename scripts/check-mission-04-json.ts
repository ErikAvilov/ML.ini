/**
 * Self-check for Mission 04 JSON validation.
 * Run: npx tsx scripts/check-mission-04-json.ts
 */
import assert from "node:assert/strict";
import {
  evaluateJsonStructuredTest,
  evaluatePayloadRepair,
  parseJsonStructuredOutput,
} from "../src/lib/validation";
import type { ClassificationTest, StructuredOutputSchema } from "../src/lib/types";

const schema: StructuredOutputSchema = {
  format: "json",
  fields: [
    { name: "sentiment", allowedValues: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
    { name: "priority", allowedValues: ["URGENT", "NORMAL"] },
  ],
};

const test: ClassificationTest = {
  id: "t1",
  message: "My card was charged twice for the same order.",
  expected: '{\n  "sentiment": "NEGATIVE",\n  "priority": "URGENT"\n}',
  expectedFields: { sentiment: "NEGATIVE", priority: "URGENT" },
};

function evalRaw(raw: string) {
  return evaluateJsonStructuredTest(raw, test, schema);
}

// Pass
{
  const r = evalRaw('{"sentiment":"NEGATIVE","priority":"URGENT"}');
  assert.equal(r.matchesExpected, true);
  assert.equal(r.jsonOk, true);
  assert.equal(r.fieldsOk, true);
  assert.equal(r.contentOk, true);
}

// Trailing comma
{
  const r = evalRaw('{"sentiment":"NEGATIVE","priority":"URGENT",}');
  assert.equal(r.matchesExpected, false);
  assert.equal(r.jsonOk, false);
  assert.equal(r.jsonErrorCode, "trailing_comma");
}

// Unquoted keys
{
  const r = evalRaw('{sentiment:"NEGATIVE",priority:"URGENT"}');
  assert.equal(r.jsonOk, false);
  assert.equal(r.jsonErrorCode, "unquoted_keys");
}

// Prose wrapper / fences
{
  const r = evalRaw('```json\n{"sentiment":"NEGATIVE","priority":"URGENT"}\n```');
  assert.equal(r.jsonOk, false);
  assert.equal(r.jsonErrorCode, "prose_wrapper");
}

// Extra field
{
  const r = evalRaw(
    '{"sentiment":"NEGATIVE","priority":"URGENT","reason":"angry"}'
  );
  assert.equal(r.jsonOk, true);
  assert.equal(r.fieldsOk, false);
  assert.equal(r.jsonErrorCode, "extra_fields");
}

// Wrong keys
{
  const r = evalRaw('{"emotion":"NEGATIVE","urgency":"URGENT"}');
  assert.equal(r.jsonOk, true);
  assert.equal(r.fieldsOk, false);
  assert.equal(r.jsonErrorCode, "wrong_keys");
}

// Case-sensitive values
{
  const r = evalRaw('{"sentiment":"negative","priority":"URGENT"}');
  assert.equal(r.jsonOk, true);
  assert.equal(r.fieldsOk, false);
  assert.equal(r.jsonErrorCode, "invalid_values");
}

// Valid JSON, wrong classification
{
  const r = evalRaw('{"sentiment":"NEUTRAL","priority":"URGENT"}');
  assert.equal(r.jsonOk, true);
  assert.equal(r.fieldsOk, true);
  assert.equal(r.contractOk, true);
  assert.equal(r.contentOk, false);
  assert.equal(r.matchesExpected, false);
}

// KEY:VALUE must not pass JSON mode
{
  const r = evalRaw("SENTIMENT: NEGATIVE\nPRIORITY: URGENT");
  assert.equal(r.matchesExpected, false);
  assert.equal(r.jsonOk, false);
}

assert.equal(
  parseJsonStructuredOutput('{"sentiment":"NEGATIVE","priority":"URGENT"}', schema)
    .ok,
  true
);

// Payload repair micro-task
{
  const broken = `{
  sentiment: 'NEGATIVE',
  priority: "URGENT",
}`;
  const fail = evaluatePayloadRepair(broken, {
    sentiment: "NEGATIVE",
    priority: "URGENT",
  }, schema);
  assert.equal(fail.ok, false);

  const pass = evaluatePayloadRepair(
    '{"sentiment":"NEGATIVE","priority":"URGENT"}',
    { sentiment: "NEGATIVE", priority: "URGENT" },
    schema
  );
  assert.equal(pass.ok, true);
}

console.log("mission-04 json checks: ok");
