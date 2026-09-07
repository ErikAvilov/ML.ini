import type { Locale } from "@/i18n/config";

/** Clé canonique indépendante de la langue */
export type SentimentKey = "positive" | "neutral" | "negative";

export const SENTIMENT_KEYS: SentimentKey[] = [
  "positive",
  "neutral",
  "negative",
];

const LABELS: Record<Locale, Record<SentimentKey, string>> = {
  fr: {
    positive: "POSITIF",
    neutral: "NEUTRE",
    negative: "NEGATIF",
  },
  en: {
    positive: "POSITIVE",
    neutral: "NEUTRAL",
    negative: "NEGATIVE",
  },
};

export function getSentimentLabel(
  key: SentimentKey,
  locale: Locale
): string {
  return LABELS[locale][key];
}

export function getSentimentLabels(locale: Locale): string[] {
  return SENTIMENT_KEYS.map((key) => LABELS[locale][key]);
}

export function sentimentKeyFromLabel(
  label: string,
  locale: Locale
): SentimentKey | null {
  const normalized = label
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const key of SENTIMENT_KEYS) {
    const candidate = LABELS[locale][key]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (normalized === candidate) return key;
  }
  return null;
}
