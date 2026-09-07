import type { Locale } from "@/i18n/config";
import type { KingdomDefinition } from "@/lib/types";
import { COMPANY_SHORT, PROJECT_CODE } from "@/data/narrative/canon";

export function createKingdomConstruireAvecIA(
  locale: Locale
): KingdomDefinition {
  if (locale === "en") {
    return {
      id: "construire-avec-ia",
      slug: "construire-avec-ia",
      name: "Building with AI",
      subtitle: `${COMPANY_SHORT} · Project ${PROJECT_CODE}`,
      description:
        "You've joined Automation at Veyra. Your job: turn MILDRED from a half-wired prototype into a real automation system — one failure at a time.",
      missionIds: [
        "mission-01",
        "mission-02",
        "mission-03",
        "mission-04",
        "mission-05",
        "mission-06",
        "mission-07",
        "mission-08",
        "mission-09",
        "mission-10",
      ],
    };
  }

  return {
    id: "construire-avec-ia",
    slug: "construire-avec-ia",
    name: "Construire avec l'IA",
    subtitle: `${COMPANY_SHORT} · Projet ${PROJECT_CODE}`,
    description:
      "Tu as intégré Automation chez Veyra. Ta mission : faire passer MILDRED d’un prototype à moitié branché à un vrai système d’automatisation — une panne après l’autre.",
    missionIds: [
      "mission-01",
      "mission-02",
      "mission-03",
      "mission-04",
      "mission-05",
      "mission-06",
      "mission-07",
      "mission-08",
      "mission-09",
      "mission-10",
    ],
  };
}

export function getKingdoms(locale: Locale) {
  return [createKingdomConstruireAvecIA(locale)];
}

/** Default FR export for convenience */
export const kingdomConstruireAvecIA = createKingdomConstruireAvecIA("fr");
export const kingdoms = [kingdomConstruireAvecIA];
