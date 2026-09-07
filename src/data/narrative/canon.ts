/**
 * Canon narratif — identités du Royaume I.
 * Modifier ici si un nom / titre doit changer (ex. Mira Vale).
 * Voir docs/NARRATIVE.md
 */

export const COMPANY_LEGAL = "VEYRA SYSTEMS";
export const COMPANY_SHORT = "Veyra";

export const TEAM_AUTOMATION = "Automation";

export const PROJECT_CODE = "MILDRED";
export const PROJECT_LABEL = "PROJECT MILDRED";

export const PLAYER_ROLE = {
  en: "Junior AI Systems Engineer",
  fr: "Junior AI Systems Engineer",
} as const;

/** Lead récurrente — identité unique, renommable sans chasse dans les composants */
export const LEAD = {
  id: "mira-vale",
  firstName: "Mira",
  lastName: "Vale",
  fullName: "Mira Vale",
  /** Affichage court dans les dialogues */
  displayName: "MIRA",
  title: {
    en: "Lead Systems Engineer",
    fr: "Lead Systems Engineer",
  },
} as const;

export const DIVISION = {
  en: "AUTOMATION DIVISION",
  fr: "DIVISION AUTOMATION",
} as const;

export const INCOMING_ASSIGNMENT = {
  en: "INCOMING ASSIGNMENT",
  fr: "ASSIGNATION ENTRANTE",
} as const;

export const FROM_LABEL = {
  en: "From",
  fr: "De",
} as const;
