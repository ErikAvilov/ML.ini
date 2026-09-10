/**
 * Catalog of Project MILDRED capabilities unlocked across Kingdom I.
 * Used by completion UI to show progression over time.
 */
import type { Locale } from "@/i18n/config";
import type { MildredCapabilityUnlock } from "@/lib/types";

export const MILDRED_CAPABILITY_CATALOG: Record<
  string,
  { label: Record<Locale, string>; status: string }
> = {
  classification: {
    label: { en: "Classification", fr: "Classification" },
    status: "ONLINE",
  },
  "business-rules": {
    label: { en: "Business Rules", fr: "Règles métier" },
    status: "ONLINE",
  },
  "structured-output": {
    label: { en: "Structured Output", fr: "Structured Output" },
    status: "ONLINE",
  },
  "data-parsing": {
    label: { en: "Data Parsing", fr: "Data Parsing" },
    status: "ONLINE",
  },
  "decision-logic": {
    label: { en: "Decision Logic", fr: "Decision Logic" },
    status: "ONLINE",
  },
  "ai-integration": {
    label: { en: "AI Integration", fr: "AI Integration" },
    status: "ONLINE",
  },
};

export function resolveCapabilities(
  ids: string[],
  locale: Locale
): MildredCapabilityUnlock[] {
  return ids
    .map((id) => {
      const entry = MILDRED_CAPABILITY_CATALOG[id];
      if (!entry) return null;
      return {
        id,
        label: entry.label[locale],
        status: entry.status,
      };
    })
    .filter((c): c is MildredCapabilityUnlock => Boolean(c));
}
