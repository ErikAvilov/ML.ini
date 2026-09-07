import type { Locale } from "@/i18n/config";
import {
  COMPANY_LEGAL,
  COMPANY_SHORT,
  DIVISION,
  FROM_LABEL,
  INCOMING_ASSIGNMENT,
  LEAD,
  PROJECT_LABEL,
  TEAM_AUTOMATION,
} from "@/data/narrative/canon";

export interface NarrativeHeaderContent {
  company: string;
  division: string;
  project: string;
  assignmentLabel: string;
  fromLabel: string;
  fromName: string;
  fromTitle: string;
}

export function getNarrativeHeader(locale: Locale): NarrativeHeaderContent {
  return {
    company: COMPANY_LEGAL,
    division: DIVISION[locale],
    project: PROJECT_LABEL,
    assignmentLabel: INCOMING_ASSIGNMENT[locale],
    fromLabel: FROM_LABEL[locale],
    fromName: LEAD.fullName,
    fromTitle: LEAD.title[locale],
  };
}

/** Répliques Mira — Mission 01 (format invalide uniquement) */
export function getMiraFormatFailLines(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "The model understood the message.",
      "The application didn't understand the model.",
      "Look at the expected output again.",
    ];
  }
  return [
    "Le modèle a compris le message.",
    "L’application, elle, n’a pas compris le modèle.",
    "Regarde à nouveau le format attendu.",
  ];
}

export function getMiraSuccessLines(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "Now MILDRED can make the same decision without someone reading every message.",
      "That's automation.",
    ];
  }
  return [
    "Bien.",
    "MILDRED peut maintenant prendre cette décision sans qu’une personne lise chaque message.",
    "Ça, c’est de l’automatisation.",
  ];
}

export function getMiraSuccessLinesMission02(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Better.",
      "You didn't make MILDRED smarter.",
      "You made the rules clearer.",
    ];
  }
  return [
    "Mieux.",
    "Tu n’as pas rendu MILDRED plus intelligente.",
    "Tu as rendu les règles plus claires.",
  ];
}

export { COMPANY_SHORT, TEAM_AUTOMATION, LEAD };
