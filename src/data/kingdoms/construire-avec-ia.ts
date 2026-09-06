import type { KingdomDefinition } from "@/lib/types";

export const kingdomConstruireAvecIA: KingdomDefinition = {
  id: "construire-avec-ia",
  slug: "construire-avec-ia",
  name: "Construire avec l'IA",
  subtitle: "Pars de zéro. Construis ton premier système IA.",
  description:
    "Un parcours technique déguisé en expédition. Tu n'apprends pas des définitions — tu construis, tu casses, tu comprends, tu avances.",
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

export const kingdoms = [kingdomConstruireAvecIA];
