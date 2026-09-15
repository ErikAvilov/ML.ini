/**
 * Mission 06 — JSON contract for model responses.
 * Used server-side (structured output) to reduce provider format flakiness.
 * Learner-facing prompt still teaches the same JSON contract explicitly.
 */

export const AI_INTEGRATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    sentiment: {
      type: "string",
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
    },
    priority: {
      type: "string",
      enum: ["URGENT", "NORMAL"],
    },
  },
  required: ["sentiment", "priority"],
  additionalProperties: false,
} as const;

/** Stronger reminder appended only on the single controlled retry. */
export const AI_INTEGRATION_JSON_RETRY_SUFFIX = `
CRITICAL RETRY — previous response was not valid JSON.
Return ONLY one JSON object. Start with { and end with }.
No Markdown. No code fences. No prose.`;
