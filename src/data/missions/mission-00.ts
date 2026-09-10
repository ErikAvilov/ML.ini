import type { Locale } from "@/i18n/config";
import type { MissionDefinition } from "@/lib/types";

/** Kingdom I onboarding — not one of the 10 core missions. */
export function createMission00(locale: Locale): MissionDefinition {
  if (locale === "en") {
    return {
      id: "mission-00",
      slug: "welcome-veyra",
      order: 0,
      title: "Welcome to Veyra",
      shortTitle: "Welcome",
      kind: "intro",
      xpReward: 0,
      playable: true,
      brief:
        "You're joining Automation. Mira Vale will brief you — then you build MILDRED, one failure at a time.",
      objective: "Understand how missions work, then start Mission 01.",
      context:
        "One-time Kingdom introduction. Veyra, Mira, MILDRED, and the mission loop.",
      intro: {
        nextSlug: "la-boite-noire",
        ctaLabel: "Start Mission 01",
        sections: [
          {
            title: "Veyra Systems",
            body: [
              "Veyra builds software for support teams.",
              "You're in Automation Division — Project MILDRED.",
            ],
          },
          {
            title: "Mira Vale",
            body: [
              "Mira is your lead. Short briefs. No fluff.",
              "She already knows the system. You're here to make it reliable.",
            ],
          },
          {
            title: "Project MILDRED",
            body: [
              "MILDRED is a half-wired automation prototype.",
              "Your job: teach it to process customer messages the rest of Veyra can trust.",
            ],
          },
          {
            title: "How a mission works",
            body: [
              "PROBLEM → ATTEMPT → RUN → FAIL → UNDERSTAND → CORRECT → SUCCEED",
              "You write one reusable instruction. Hidden tests check it. Fix until it holds.",
            ],
          },
          {
            title: "XP, skills, boss",
            body: [
              "Clearing missions earns XP and unlocks skills on your tree.",
              "MILDRED gains capabilities. The Kingdom ends with a boss — not today.",
            ],
          },
        ],
      },
    };
  }

  return {
    id: "mission-00",
    slug: "welcome-veyra",
    order: 0,
    title: "Bienvenue chez Veyra",
    shortTitle: "Bienvenue",
    kind: "intro",
    xpReward: 0,
    playable: true,
    brief:
      "Tu intègres Automation. Mira Vale te briefe — ensuite tu construis MILDRED, une panne après l’autre.",
    objective: "Comprendre le fonctionnement des missions, puis lancer la Mission 01.",
    context:
      "Introduction unique au Royaume. Veyra, Mira, MILDRED, et la boucle de mission.",
    intro: {
      nextSlug: "la-boite-noire",
      ctaLabel: "Commencer la Mission 01",
      sections: [
        {
          title: "Veyra Systems",
          body: [
            "Veyra construit des outils pour les équipes support.",
            "Tu es dans la division Automation — projet MILDRED.",
          ],
        },
        {
          title: "Mira Vale",
          body: [
            "Mira est ta lead. Briefs courts. Zéro baratin.",
            "Elle connaît déjà le système. Toi, tu dois le rendre fiable.",
          ],
        },
        {
          title: "Projet MILDRED",
          body: [
            "MILDRED est un prototype d’automatisation à moitié branché.",
            "Ton rôle : lui apprendre à traiter des messages clients que le reste de Veyra peut utiliser.",
          ],
        },
        {
          title: "Comment marche une mission",
          body: [
            "PROBLÈME → ESSAIE → LANCE → ÉCHOUE → COMPRENDS → CORRIGE → RÉUSSIS",
            "Tu écris une instruction réutilisable. Des tests cachés la vérifient. Tu corriges jusqu’à ce que ça tienne.",
          ],
        },
        {
          title: "XP, compétences, boss",
          body: [
            "Réussir une mission donne de l’XP et débloque des compétences.",
            "MILDRED gagne des capacités. Le Royaume se termine par un boss — pas aujourd’hui.",
          ],
        },
      ],
    },
  };
}
