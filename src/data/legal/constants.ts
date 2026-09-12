/** Centralized legal / operator facts for MLINI public policies. */

export const LEGAL_SITE_URL = "https://mlini.dev";

/** Fixed revision date — update intentionally when policies change. */
export const LEGAL_LAST_UPDATED_LABEL = "13 septembre 2026";
export const LEGAL_LAST_UPDATED_ISO = "2026-09-13";

export const LEGAL_OPERATOR = {
  productName: "MLINI",
  commercialName: "Nefatafl",
  operatorName: "Erik Avilov",
  status:
    "entrepreneur individuel exerçant sous le nom commercial Nefatafl",
  siren: "843729203",
  email: "erikavilov@gmail.com",
} as const;

export const LEGAL_PATHS = {
  privacy: "/privacy",
  terms: "/terms",
} as const;

export const LEGAL_URLS = {
  privacy: `${LEGAL_SITE_URL}${LEGAL_PATHS.privacy}`,
  terms: `${LEGAL_SITE_URL}${LEGAL_PATHS.terms}`,
  home: LEGAL_SITE_URL,
} as const;

/** Account deletion confirmation phrase (case-sensitive as typed by user). */
export const ACCOUNT_DELETE_CONFIRM_PHRASE = "SUPPRIMER";
