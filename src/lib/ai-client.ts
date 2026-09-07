import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ReasoningEffort } from "openai/resources/shared";

export type AIProvider = "gemini" | "openai";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionResult {
  text: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
}

export interface CompleteChatOptions {
  messages: ChatMessage[];
  model?: string;
  maxOutputTokens: number;
  /** When set, ask the model for JSON (schema when supported). */
  jsonSchema?: Record<string, unknown>;
  signal?: AbortSignal;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_OPENAI_MODEL = "gpt-5.6-luna";
const DEFAULT_REASONING_EFFORT: ReasoningEffort = "low";

function envProvider(): AIProvider {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "openai") return "openai";
  if (raw === "gemini") return "gemini";
  // Auto: prefer Gemini when a Google key is present.
  if (getGeminiApiKey()) return "gemini";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  return "gemini";
}

export function getAIProvider(): AIProvider {
  return envProvider();
}

export function getGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null
  );
}

export function hasAICredentials(): boolean {
  if (getAIProvider() === "openai") {
    return Boolean(process.env.OPENAI_API_KEY?.trim());
  }
  return Boolean(getGeminiApiKey());
}

export function getMissingKeyMessage() {
  if (getAIProvider() === "openai") {
    return "OPENAI_API_KEY manquante. Ajoute-la dans `.env` ou `.env.local` à la racine.";
  }
  return "GEMINI_API_KEY manquante. Ajoute-la dans `.env` ou `.env.local` à la racine (Google AI Studio).";
}

/** Production / playground model. */
export const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  process.env.OPENAI_MODEL?.trim() ||
  (getAIProvider() === "openai" ? DEFAULT_OPENAI_MODEL : DEFAULT_GEMINI_MODEL);

/**
 * Optional pinned model for pedagogical eval experiments only.
 * Falls back to MODEL so comparisons stay aligned with production unless overridden.
 */
export const EVAL_MODEL =
  process.env.GEMINI_EVAL_MODEL?.trim() ||
  process.env.OPENAI_EVAL_MODEL?.trim() ||
  MODEL;

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

export const DEFAULT_MODEL_ID = DEFAULT_GEMINI_MODEL;

/** @deprecated Prefer hasAICredentials + completeChat. Kept for transitional OpenAI callers. */
export function getAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

type OpenAIChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

/** @deprecated Prefer completeChat. */
export function buildChatCompletionParams(options: {
  messages: OpenAIChatMessage[];
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

function splitMessages(messages: ChatMessage[]): {
  system: string | undefined;
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
} {
  const systemParts: string[] = [];
  const contents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }> = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
      continue;
    }
    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    });
  }

  return {
    system: systemParts.length ? systemParts.join("\n\n") : undefined,
    contents,
  };
}

async function completeWithGemini(
  options: CompleteChatOptions
): Promise<ChatCompletionResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { system, contents } = splitMessages(options.messages);
  const model = options.model ?? MODEL;

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      ...(system ? { systemInstruction: system } : {}),
      maxOutputTokens: options.maxOutputTokens,
      ...(options.signal ? { abortSignal: options.signal } : {}),
      ...(options.jsonSchema
        ? {
            responseMimeType: "application/json",
            responseJsonSchema: options.jsonSchema,
          }
        : {}),
    },
  });

  const text = response.text?.trim() ?? "";
  const usageMeta = response.usageMetadata;

  return {
    text,
    usage: {
      inputTokens: usageMeta?.promptTokenCount ?? null,
      outputTokens: usageMeta?.candidatesTokenCount ?? null,
      totalTokens: usageMeta?.totalTokenCount ?? null,
    },
  };
}

async function completeWithOpenAI(
  options: CompleteChatOptions
): Promise<ChatCompletionResult> {
  const client = getAIClient();
  if (!client) {
    throw new Error("MISSING_KEY");
  }

  const completion = await client.chat.completions.create(
    buildChatCompletionParams({
      model: options.model ?? MODEL,
      maxCompletionTokens: options.maxOutputTokens,
      messages: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      ...(options.jsonSchema
        ? {
            responseFormat: {
              type: "json_schema" as const,
              json_schema: {
                name: "structured_output",
                strict: true,
                schema: options.jsonSchema,
              },
            },
          }
        : {}),
    }),
    options.signal ? { signal: options.signal } : undefined
  );

  const u = completion.usage;
  return {
    text: completion.choices[0]?.message?.content?.trim() ?? "",
    usage: {
      inputTokens: u?.prompt_tokens ?? null,
      outputTokens: u?.completion_tokens ?? null,
      totalTokens: u?.total_tokens ?? null,
    },
  };
}

/**
 * Provider-agnostic chat completion used by classify / hint / batch.
 * Default provider: Gemini (GEMINI_API_KEY or GOOGLE_API_KEY).
 */
export async function completeChat(
  options: CompleteChatOptions
): Promise<ChatCompletionResult> {
  if (getAIProvider() === "openai") {
    return completeWithOpenAI(options);
  }
  return completeWithGemini(options);
}
