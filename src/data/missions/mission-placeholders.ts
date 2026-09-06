import type { MissionDefinition } from "@/lib/types";

function lockedMission(
  order: number,
  id: string,
  slug: string,
  title: string,
  shortTitle: string,
  kind: MissionDefinition["kind"] = "standard",
  xpReward = 100 + order * 20
): MissionDefinition {
  return {
    id,
    slug,
    order,
    title,
    shortTitle,
    kind,
    xpReward,
    playable: false,
    brief: "Mission verrouillée — avance sur le chemin pour l'atteindre.",
    objective: "Contenu à venir.",
    context: "Visible sur la carte, pas encore jouable.",
    comingSoonMessage: `Mission ${order} en construction.`,
  };
}

export const mission03 = lockedMission(
  3,
  "mission-03",
  "signal-faible",
  "Signal Faible",
  "Signal Faible"
);

export const mission04 = lockedMission(
  4,
  "mission-04",
  "double-entree",
  "Double Entrée",
  "Double Entrée"
);

export const mission05 = lockedMission(
  5,
  "mission-05",
  "garde-frontiere",
  "Garde-Frontière",
  "Garde-Frontière"
);

export const mission06 = lockedMission(
  6,
  "mission-06",
  "echo-controle",
  "Écho Contrôlé",
  "Écho Contrôlé"
);

export const mission07 = lockedMission(
  7,
  "mission-07",
  "chaine-de-confiance",
  "Chaîne de Confiance",
  "Chaîne"
);

export const mission08 = lockedMission(
  8,
  "mission-08",
  "seuil-critique",
  "Seuil Critique",
  "Seuil Critique"
);

export const mission09 = lockedMission(
  9,
  "mission-09",
  "derniere-ligne",
  "Dernière Ligne",
  "Dernière Ligne"
);

export const mission10 = lockedMission(
  10,
  "mission-10",
  "coeur-du-systeme",
  "Cœur du Système",
  "Boss",
  "boss",
  500
);
