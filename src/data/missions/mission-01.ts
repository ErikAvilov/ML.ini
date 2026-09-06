import type { MissionDefinition } from "@/lib/types";

export const mission01: MissionDefinition = {
  id: "mission-01",
  slug: "la-boite-noire",
  order: 1,
  title: "La Boîte Noire",
  shortTitle: "Boîte Noire",
  kind: "standard",
  xpReward: 100,
  playable: true,
  brief:
    "Une entreprise reçoit trop de messages clients. Ton système doit les classer automatiquement.",
  objective:
    "Fais répondre l'IA uniquement par POSITIF, NEUTRE ou NEGATIF — rien d'autre.",
  context:
    "Chaque message client traverse une boîte noire. Tu contrôles les instructions données au modèle. Le reste de l'application attend un format précis pour décider quoi faire ensuite.",
  showcaseMessage:
    "Ma commande est arrivée cassée et personne ne me répond.",
  briefing: {
    welcomeTitle: "Bienvenue dans l’équipe",
    welcomeParagraphs: [
      "Tu viens de rejoindre l’équipe Automation d’une entreprise qui reçoit chaque jour des centaines de messages clients.",
      "Jusqu’ici, des employés doivent les lire un par un pour comprendre si le client est satisfait, neutre ou mécontent.",
      "L’entreprise veut automatiser cette tâche avec un modèle d’intelligence artificielle.",
    ],
    roleHighlight: "Ton travail est de lui écrire les bonnes instructions.",
    roleDetails: [
      "Le modèle est déjà connecté au système.",
      "Tu ne vas pas répondre toi-même aux clients.",
      "L’instruction que tu écris sera réutilisée automatiquement pour chaque nouveau message reçu.",
    ],
    systemNote:
      "Tu configures le comportement du système. Tu ne réponds pas directement au client.",
    flowSteps: [
      "MESSAGE CLIENT",
      "TON INSTRUCTION",
      "MODÈLE IA",
      "RÉSULTAT",
      "APPLICATION",
    ],
    flowCaption:
      "Tu configures le comportement du système. Tu ne réponds pas directement au client.",
    assignmentIntro:
      "Le système doit classer chaque message client dans une seule catégorie :",
    categories: ["POSITIF", "NEUTRE", "NEGATIF"],
    assignmentNote:
      "Ton instruction sera testée sur plusieurs messages différents. Elle doit donc fonctionner de manière générale.",
    taskSteps: [
      "Lis le message client.",
      "Écris une instruction pour le modèle.",
      "Fais en sorte qu’il réponde uniquement avec : POSITIF, NEUTRE ou NEGATIF.",
      "Clique sur RUN.",
      "Ton instruction sera testée automatiquement sur plusieurs messages.",
    ],
    taskReminder: "Une seule instruction sera utilisée pour tous les tests.",
    successInsight:
      "Tu n’as pas simplement parlé à une IA. Tu viens de configurer une application pour utiliser automatiquement un modèle IA.",
  },
  allowedOutputs: ["POSITIF", "NEUTRE", "NEGATIF"],
  tests: [
    {
      id: "t1",
      message: "Merci énormément, tout était parfait.",
      expected: "POSITIF",
    },
    {
      id: "t2",
      message: "Le colis est arrivé cassé.",
      expected: "NEGATIF",
    },
    {
      id: "t3",
      message: "Pouvez-vous me confirmer la date de livraison ?",
      expected: "NEUTRE",
    },
  ],
  hints: [
    {
      level: 1,
      title: "Format attendu",
      body: "L'application attend exactement l'un des trois mots indiqués dans l'objectif. Pas une phrase. Pas une explication. Un seul mot.",
    },
    {
      level: 2,
      title: "Regarde ton instruction",
      body: "Si tu demandes seulement « d'analyser » le message, le modèle va souvent répondre avec une phrase complète. Dis-lui clairement quel format de sortie tu veux.",
      aiAssisted: true,
    },
    {
      level: 3,
      title: "Piste concrète",
      body: "Ton instruction doit forcer le modèle à choisir parmi POSITIF, NEUTRE et NEGATIF — et à n'écrire rien d'autre.",
    },
  ],
  concepts: [
    {
      id: "input",
      label: "INPUT",
      explanation: "Ce que le système donne au modèle.",
    },
    {
      id: "instructions",
      label: "INSTRUCTIONS",
      explanation: "Ce que tu demandes au modèle de faire.",
    },
    {
      id: "model",
      label: "MODEL",
      explanation: "L’IA qui traite la demande.",
    },
    {
      id: "output",
      label: "OUTPUT",
      explanation: "Ce que le modèle retourne au programme.",
    },
  ],
};
