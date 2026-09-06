import OpenAI from "openai";

/**
 * Client LLM pour le développement / tests.
 * NVIDIA NIM — API compatible OpenAI.
 * https://integrate.api.nvidia.com/v1
 */
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

/** Modèle rapide et adapté au proto. Surchargeable via NVIDIA_MODEL. */
const DEFAULT_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

export function getAIClient() {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: NVIDIA_BASE_URL,
  });
}

export function getMissingKeyMessage() {
  return "NVIDIA_API_KEY manquante. Ajoute-la dans `.env` ou `.env.local` à la racine (clé nvapi-… depuis build.nvidia.com).";
}

export const MODEL = process.env.NVIDIA_MODEL?.trim() || DEFAULT_MODEL;
export const REQUEST_TIMEOUT_MS = 25_000;
