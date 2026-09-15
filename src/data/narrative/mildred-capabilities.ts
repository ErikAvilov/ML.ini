/**
 * Catalog of Project MILDRED capabilities unlocked across Kingdom I.
 * Used by completion UI to show progression over time.
 */
import type { Locale } from "@/i18n/config";

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
  "external-actions": {
    label: { en: "External Actions", fr: "External Actions" },
    status: "ONLINE",
  },
  "workflow-composition": {
    label: { en: "Workflow Composition", fr: "Workflow Composition" },
    status: "ONLINE",
  },
  guardrails: {
    label: { en: "Guardrails", fr: "Guardrails" },
    status: "ONLINE",
  },
  "mildred-live": {
    label: { en: "MILDRED Live", fr: "MILDRED Live" },
    status: "LIVE",
  },
};
