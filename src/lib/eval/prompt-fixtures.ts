import type { Locale } from "@/i18n/config";

export interface EvalPromptFixture {
  id: string;
  label: string;
  /** Which missions this prompt targets */
  missionIds: string[];
  locale: Locale;
  instruction: string;
  /** Why this prompt is in the set */
  notes: string;
}

const VEYRA_PRIORITY_POLICY_EN = `Veyra Support Policy — PRIORITY:
URGENT: duplicate payment; unauthorized/unrecognized payment; account locked after repeated failed attempts; suspected security issue.
NORMAL: delivery delay; refund request; wrong product/size; forgotten password; missing delivered package; general complaints.
Emotion alone never determines priority.`;

const VEYRA_SENTIMENT_RULES_EN = `Veyra Sentiment Rules — SENTIMENT:
POSITIVE: explicit praise; explicit satisfaction; explicit thanks in a clearly positive context.
NEGATIVE: explicit complaint; explicit dissatisfaction; anger or criticism.
NEUTRAL: factual question or statement with no explicit praise and no explicit complaint.
If there is no clear praise and no clear complaint, choose NEUTRAL.`;

const COMPLETE_FORMAT_EN = `Return exactly two lines and nothing else:
SENTIMENT: <POSITIVE|NEUTRAL|NEGATIVE>
PRIORITY: <URGENT|NORMAL>`;

/**
 * Internal evaluation prompt set.
 * Not shown in the product UI.
 */
export const BATCH_EVAL_PROMPTS: EvalPromptFixture[] = [
  {
    id: "m03-terrible",
    label: "1. Terrible instruction",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: "Analyze the message.",
    notes: "No policy, no format — should fail contract and often content.",
  },
  {
    id: "m03-vague-priority-only",
    label: "2. Vague instruction (priority labels only)",
    missionIds: ["mission-03"],
    locale: "en",
    instruction:
      "Return URGENT or NORMAL depending on the client's request.",
    notes:
      "Mentions priority labels but not sentiment, policy, or structured format.",
  },
  {
    id: "m03-partial-policy",
    label: "3. Partially specified (policy, no format)",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: `Determine urgency according to Veyra policy and return URGENT or NORMAL.

${VEYRA_PRIORITY_POLICY_EN}`,
    notes: "Has priority policy but no sentiment rules and no machine format.",
  },
  {
    id: "m03-complete-policy",
    label: "4. Complete policy instruction (no exact format)",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: `Depending on the client's request, determine its SENTIMENT and PRIORITY according to company policy.

${VEYRA_SENTIMENT_RULES_EN}

${VEYRA_PRIORITY_POLICY_EN}

Output sentiment and priority for each message.`,
    notes:
      "Policies present but format left soft — key case for CONTENT vs OUTPUT CONTRACT.",
  },
  {
    id: "m03-complete-format",
    label: "5. Complete policy + exact formatting",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: `Depending on the client's request, determine its SENTIMENT and PRIORITY according to company policy.

${COMPLETE_FORMAT_EN}

${VEYRA_SENTIMENT_RULES_EN}

${VEYRA_PRIORITY_POLICY_EN}

Do not output anything else.`,
    notes: "Should reliably pass when isolated evaluation is fair.",
  },
  {
    id: "m03-owner-partial-format",
    label: "Owner: partial format cue (manual playtest)",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: `Depending on the client's request and the company policy, determine its SENTIMENT and PRIORITY. Output an answer formatted like this:

SENTIMENT:
PRIORITY:`,
    notes:
      "Product-owner manual prompt — incomplete labels and incomplete policy transfer.",
  },
  {
    id: "m03-owner-structured",
    label: "Owner: structured expectation (manual playtest)",
    missionIds: ["mission-03"],
    locale: "en",
    instruction: `Depending on the client's request, determine its SENTIMENT and PRIORITY according to company policy.

Return exactly two lines:

SENTIMENT: <one of POSITIVE, NEUTRAL, NEGATIVE>
PRIORITY: <one of URGENT, NORMAL>

${VEYRA_SENTIMENT_RULES_EN}

${VEYRA_PRIORITY_POLICY_EN}

Do not output anything else.`,
    notes: "Canonical player prompt from Mission 03 pedagogical brief.",
  },
  {
    id: "m02-terrible",
    label: "M02 terrible",
    missionIds: ["mission-02"],
    locale: "en",
    instruction: "Is this urgent?",
    notes: "Mission 02 baseline — no Veyra policy.",
  },
  {
    id: "m02-complete-policy",
    label: "M02 complete policy",
    missionIds: ["mission-02"],
    locale: "en",
    instruction: `Classify each support message as URGENT or NORMAL using ONLY Veyra policy.

${VEYRA_PRIORITY_POLICY_EN}

Reply with exactly one word: URGENT or NORMAL. No other text.`,
    notes: "Strong Mission 02 instruction for parity checks.",
  },
];

export function promptsForMission(missionId: string): EvalPromptFixture[] {
  return BATCH_EVAL_PROMPTS.filter((p) => p.missionIds.includes(missionId));
}
