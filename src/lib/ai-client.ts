import OpenAI from "openai";
import type { ReasoningEffort } from "openai/resources/shared";

/** Défaut produit — surchargeable via OPENAI_MODEL. */
const DEFAULT_MODEL = "gpt-5.6-luna";
const DEFAULT_REASONING_EFFORT: ReasoningEffort = "low";

export function getAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

export function getMissingKeyMessage() {
  return "OPENAI_API_KEY manquante. Ajoute-la dans `.env` ou `.env.local` à la racine.";
}

/** Production / playground model. */
export const MODEL = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

/**
 * Optional pinned model for pedagogical eval experiments only.
 * Falls back to MODEL so comparisons stay aligned with production unless overridden.
 */
export const EVAL_MODEL =
  process.env.OPENAI_EVAL_MODEL?.trim() || MODEL;

export const REASONING_EFFORT: ReasoningEffort = (() => {
  const raw = process.env.OPENAI_REASONING_EFFORT?.trim().toLowerCase();
  const allowed: ReasoningEffort[] = [
    "none",
    "minimal",
    "low",
    "medium",
    "high",
    "xhigh",
  ];
  if (raw && (allowed as string[]).includes(raw)) {
    return raw as ReasoningEffort;
  }
  return DEFAULT_REASONING_EFFORT;
})();

export const REQUEST_TIMEOUT_MS = 45_000;
/** Batch eval may need longer for multi-item JSON. */
export const EVAL_REQUEST_TIMEOUT_MS = 120_000;

export const DEFAULT_MODEL_ID = DEFAULT_MODEL;

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/**
 * Shared chat.completions payload for GPT-5.x (reasoning_effort + max_completion_tokens).
 * Omits temperature — GPT-5 reasoning models often reject custom temperature.
 */
export function buildChatCompletionParams(options: {
  messages: ChatMessage[];
  model?: string;
  maxCompletionTokens: number;
  reasoningEffort?: ReasoningEffort;
  responseFormat?: OpenAI.Chat.Completions.ChatCompletionCreateParams["response_format"];
}): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  return {
    model: options.model ?? MODEL,
    messages: options.messages,
    reasoning_effort: options.reasoningEffort ?? REASONING_EFFORT,
    max_completion_tokens: options.maxCompletionTokens,
    ...(options.responseFormat
      ? { response_format: options.responseFormat }
      : {}),
  };
}
