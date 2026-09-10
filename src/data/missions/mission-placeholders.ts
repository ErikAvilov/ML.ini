import type { Locale } from "@/i18n/config";
import type { MissionDefinition } from "@/lib/types";

interface LockedMissionCopy {
  title: string;
  shortTitle: string;
  brief: string;
  objective: string;
  context: string;
  comingSoonMessage: string;
}

const PLACEHOLDERS: Record<
  string,
  {
    fr: LockedMissionCopy;
    en: LockedMissionCopy;
    kind?: MissionDefinition["kind"];
    xpReward?: number;
  }
> = {
  "mission-06": {
    fr: {
      title: "Lui Donner Vie",
      shortTitle: "Vie",
      brief: "Le prototype doit sortir du bac à sable et parler au vrai code.",
      objective: "Contenu à venir.",
      context: "Projet MILDRED — limite suivante.",
      comingSoonMessage: "Mission 6 en construction.",
    },
    en: {
      title: "Bring It to Life",
      shortTitle: "Bring Alive",
      brief: "The prototype has to leave the sandbox and talk to real code.",
      objective: "Content coming soon.",
      context: "Project MILDRED — next limit.",
      comingSoonMessage: "Mission 6 under construction.",
    },
  },
  "mission-07": {
    fr: {
      title: "Au-delà des Murs",
      shortTitle: "Au-delà",
      brief: "MILDRED doit joindre un service extérieur. Veyra n’est plus seul.",
      objective: "Contenu à venir.",
      context: "Projet MILDRED — limite suivante.",
      comingSoonMessage: "Mission 7 en construction.",
    },
    en: {
      title: "Beyond the Walls",
      shortTitle: "Beyond",
      brief: "MILDRED must reach an outside service. Veyra isn't alone anymore.",
      objective: "Content coming soon.",
      context: "Project MILDRED — next limit.",
      comingSoonMessage: "Mission 7 under construction.",
    },
  },
  "mission-08": {
    fr: {
      title: "La Chaîne",
      shortTitle: "Chaîne",
      brief: "Les briques existent. Il faut qu’elles tiennent ensemble.",
      objective: "Contenu à venir.",
      context: "Projet MILDRED — limite suivante.",
      comingSoonMessage: "Mission 8 en construction.",
    },
    en: {
      title: "The Chain",
      shortTitle: "The Chain",
      brief: "The bricks exist. Now they have to hold together.",
      objective: "Content coming soon.",
      context: "Project MILDRED — next limit.",
      comingSoonMessage: "Mission 8 under construction.",
    },
  },
  "mission-09": {
    fr: {
      title: "Alerte Rouge",
      shortTitle: "Alerte",
      brief:
        "Un test à plus grande échelle. Erreurs, edge cases, comportements inattendus.",
      objective: "Contenu à venir.",
      context: "Projet MILDRED — limite suivante.",
      comingSoonMessage: "Mission 9 en construction.",
    },
    en: {
      title: "Red Alert",
      shortTitle: "Red Alert",
      brief:
        "A larger-scale test. Errors, edge cases, unexpected behavior.",
      objective: "Content coming soon.",
      context: "Project MILDRED — next limit.",
      comingSoonMessage: "Mission 9 under construction.",
    },
  },
  "mission-10": {
    fr: {
      title: "Nuit de Lancement",
      shortTitle: "Boss",
      brief:
        "MILDRED doit être déployé. Mira ne tient plus la main.",
      objective: "Contenu à venir.",
      context: "Projet MILDRED — boss.",
      comingSoonMessage: "Mission 10 en construction.",
    },
    en: {
      title: "Launch Night",
      shortTitle: "Boss",
      brief: "MILDRED must ship. Mira stops holding your hand.",
      objective: "Content coming soon.",
      context: "Project MILDRED — boss.",
      comingSoonMessage: "Mission 10 under construction.",
    },
    kind: "boss",
    xpReward: 500,
  },
};

const META: Record<string, { order: number; slug: string }> = {
  "mission-06": { order: 6, slug: "echo-controle" },
  "mission-07": { order: 7, slug: "chaine-de-confiance" },
  "mission-08": { order: 8, slug: "seuil-critique" },
  "mission-09": { order: 9, slug: "derniere-ligne" },
  "mission-10": { order: 10, slug: "coeur-du-systeme" },
};

function createLockedMission(id: string, locale: Locale): MissionDefinition {
  const meta = META[id];
  const entry = PLACEHOLDERS[id];
  const copy = entry[locale];
  const order = meta.order;

  return {
    id,
    slug: meta.slug,
    order,
    title: copy.title,
    shortTitle: copy.shortTitle,
    kind: entry.kind ?? "standard",
    xpReward: entry.xpReward ?? 100 + order * 20,
    playable: false,
    brief: copy.brief,
    objective: copy.objective,
    context: copy.context,
    comingSoonMessage: copy.comingSoonMessage,
  };
}

export function createMission06(locale: Locale) {
  return createLockedMission("mission-06", locale);
}
export function createMission07(locale: Locale) {
  return createLockedMission("mission-07", locale);
}
export function createMission08(locale: Locale) {
  return createLockedMission("mission-08", locale);
}
export function createMission09(locale: Locale) {
  return createLockedMission("mission-09", locale);
}
export function createMission10(locale: Locale) {
  return createLockedMission("mission-10", locale);
}
