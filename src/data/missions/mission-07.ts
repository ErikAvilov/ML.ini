import type { Locale } from "@/i18n/config";
import type {
  ClassificationTest,
  MissionDefinition,
  ServiceActionCodeFillTask,
} from "@/lib/types";

const HUMAN_ROUTE = "HUMAN_REVIEW";
const QUEUE_ROUTE = "STANDARD_QUEUE";

function codeFillTask(locale: Locale): ServiceActionCodeFillTask {
  const segment0 = `message = input["message"]

result = {
    "sentiment": "NEGATIVE",
    "priority": "URGENT"
}

route = "HUMAN_REVIEW"

if route == "HUMAN_REVIEW":
    support.`;
  const segment1 = `(
        message=`;
  const segment2 = `,
        priority=`;
  const segment3 = `
    )
else:
    support.`;
  const segment4 = `(
        message=`;
  const segment5 = `
    )`;

  if (locale === "en") {
    return {
      mode: "service-action",
      title: "Send the action",
      description:
        "Route is already decided. Call the right Support action with the right data.",
      segments: [segment0, segment1, segment2, segment3, segment4, segment5],
      blanks: [
        { id: "humanMethod", placeholder: "action", expected: "create_ticket" },
        { id: "humanMessage", placeholder: "message", expected: "message" },
        {
          id: "humanPriority",
          placeholder: 'result["priority"]',
          expected: 'result["priority"]',
        },
        { id: "queueMethod", placeholder: "action", expected: "queue_message" },
        { id: "queueMessage", placeholder: "message", expected: "message" },
      ],
      checkLabel: "Incomplete",
      passLabel: "Wired",
      humanRoute: HUMAN_ROUTE,
      queueRoute: QUEUE_ROUTE,
    };
  }

  return {
    mode: "service-action",
    title: "Envoyer l’action",
    description:
      "La route est déjà décidée. Appelle la bonne action Support avec les bonnes données.",
    segments: [segment0, segment1, segment2, segment3, segment4, segment5],
    blanks: [
      { id: "humanMethod", placeholder: "action", expected: "create_ticket" },
      { id: "humanMessage", placeholder: "message", expected: "message" },
      {
        id: "humanPriority",
        placeholder: 'result["priority"]',
        expected: 'result["priority"]',
      },
      { id: "queueMethod", placeholder: "action", expected: "queue_message" },
      { id: "queueMessage", placeholder: "message", expected: "message" },
    ],
    checkLabel: "Incomplet",
    passLabel: "Branché",
    humanRoute: HUMAN_ROUTE,
    queueRoute: QUEUE_ROUTE,
  };
}

function miraSuccess(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "MILDRED decided. The program chose. Support acted.",
      "A decision that never leaves the program changes nothing.",
    ];
  }
  return [
    "Bien.",
    "MILDRED a décidé. Le programme a choisi. Support a agi.",
    "Une décision qui ne quitte jamais le programme ne change rien.",
  ];
}

function tests(locale: Locale): ClassificationTest[] {
  const longMsg =
    locale === "en"
      ? "Where can I download my invoice??? Please help — order #A-9912 (re: billing)."
      : "Où puis-je télécharger ma facture ??? Merci — commande #A-9912 (re: facturation).";

  if (locale === "en") {
    return [
      {
        id: "t1",
        message: "My card was charged twice.",
        expected: "create_ticket",
        serviceFixture: {
          route: HUMAN_ROUTE,
          priority: "URGENT",
          sentiment: "NEGATIVE",
        },
        failHint: "HUMAN_REVIEW must create a human ticket.",
        failHints: {
          fields: {
            action:
              "MILDRED chose HUMAN_REVIEW, but no human ticket was created.",
          },
        },
      },
      {
        id: "t2",
        message: "Where can I download my invoice?",
        expected: "queue_message",
        serviceFixture: {
          route: QUEUE_ROUTE,
          priority: "NORMAL",
          sentiment: "NEUTRAL",
        },
        failHint: "STANDARD_QUEUE must queue a normal request.",
        failHints: {
          fields: {
            action: "STANDARD_QUEUE should call queue_message, not create_ticket.",
          },
        },
      },
      {
        id: "t3",
        message: "I can't access my account after three failed logins.",
        expected: "create_ticket",
        serviceFixture: {
          route: HUMAN_ROUTE,
          priority: "URGENT",
          sentiment: "NEGATIVE",
        },
        failHint:
          "The support service should receive the original customer message.",
        failHints: {
          fields: {
            action:
              "The support service should receive the original customer message.",
          },
        },
      },
      {
        id: "t4-hidden",
        message: "Thanks — but I still need a human to unlock my account.",
        expected: "create_ticket",
        serviceFixture: {
          route: HUMAN_ROUTE,
          priority: "URGENT",
          sentiment: "POSITIVE",
        },
        failHint: "Do not infer the route from sentiment.",
        failHints: {
          fields: {
            action:
              "MILDRED chose HUMAN_REVIEW, but no human ticket was created.",
          },
        },
      },
      {
        id: "t5-hidden",
        message: longMsg,
        expected: "queue_message",
        serviceFixture: {
          route: QUEUE_ROUTE,
          priority: "NORMAL",
          sentiment: "NEUTRAL",
        },
        failHint:
          "The support service should receive the original customer message.",
      },
      {
        id: "t6-hidden",
        message: "Can you remind me of your opening hours?",
        expected: "queue_message",
        serviceFixture: {
          route: QUEUE_ROUTE,
          priority: "NORMAL",
          sentiment: "NEUTRAL",
        },
        failHint: "Exactly one queue_message — no create_ticket.",
      },
    ];
  }

  return [
    {
      id: "t1",
      message: "Ma carte a été débitée deux fois.",
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN_ROUTE,
        priority: "URGENT",
        sentiment: "NEGATIVE",
      },
      failHint: "HUMAN_REVIEW doit créer un ticket humain.",
      failHints: {
        fields: {
          action:
            "MILDRED a choisi HUMAN_REVIEW, mais aucun ticket humain n’a été créé.",
        },
      },
    },
    {
      id: "t2",
      message: "Où puis-je télécharger ma facture ?",
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE_ROUTE,
        priority: "NORMAL",
        sentiment: "NEUTRAL",
      },
      failHint: "STANDARD_QUEUE doit mettre la demande en file.",
      failHints: {
        fields: {
          action:
            "STANDARD_QUEUE doit appeler queue_message, pas create_ticket.",
        },
      },
    },
    {
      id: "t3",
      message: "Je n’arrive plus à accéder à mon compte après trois échecs.",
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN_ROUTE,
        priority: "URGENT",
        sentiment: "NEGATIVE",
      },
      failHint:
        "Le service support doit recevoir le message client d’origine.",
      failHints: {
        fields: {
          action:
            "Le service support doit recevoir le message client d’origine.",
        },
      },
    },
    {
      id: "t4-hidden",
      message: "Merci — mais j’ai encore besoin d’un humain pour débloquer mon compte.",
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN_ROUTE,
        priority: "URGENT",
        sentiment: "POSITIVE",
      },
      failHint: "N’infère pas la route à partir du sentiment.",
      failHints: {
        fields: {
          action:
            "MILDRED a choisi HUMAN_REVIEW, mais aucun ticket humain n’a été créé.",
        },
      },
    },
    {
      id: "t5-hidden",
      message: longMsg,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE_ROUTE,
        priority: "NORMAL",
        sentiment: "NEUTRAL",
      },
      failHint:
        "Le service support doit recevoir le message client d’origine.",
    },
    {
      id: "t6-hidden",
      message: "Pouvez-vous me rappeler vos horaires d’ouverture ?",
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE_ROUTE,
        priority: "NORMAL",
        sentiment: "NEUTRAL",
      },
      failHint: "Exactement un queue_message — pas de create_ticket.",
    },
  ];
}

export function createMission07(locale: Locale): MissionDefinition {
  const codeFill = codeFillTask(locale);
  const mira = miraSuccess(locale);
  const suite = tests(locale);

  if (locale === "en") {
    return {
      id: "mission-07",
      slug: "chaine-de-confiance",
      order: 7,
      title: "Beyond the Walls",
      shortTitle: "Beyond",
      kind: "standard",
      xpReward: 240,
      playable: true,
      brief:
        "MILDRED knows what should happen. That isn't enough. A decision that never leaves the program changes nothing.",
      objective:
        "1. On HUMAN_REVIEW, create a support ticket with message + priority.\n2. Otherwise, queue the message.",
      context: "Project MILDRED — external action.",
      showcaseMessage: "My card was charged twice.",
      codeFill,
      tests: suite,
      briefing: {
        shortBrief:
          "MILDRED knows what should happen. That isn't enough. Veyra's support service exposes two actions — send each case to the right one, with the right data.",
        objectiveText:
          "1. If route is HUMAN_REVIEW → support.create_ticket(message, priority).\n2. Else → support.queue_message(message).",
        categories: ["create_ticket", "queue_message"],
        newConcept: {
          title: "Decide → choose → act",
          summary:
            "AI decides. Code chooses the route. A service performs the action outside the program.",
          example: `route == "HUMAN_REVIEW"
  →  support.create_ticket(message, result["priority"])
else
  →  support.queue_message(message)`,
          labels: [
            "create_ticket — opens a human support ticket",
            "queue_message — queues a normal request",
            "message — the original customer text",
            'result["priority"] — priority from MILDRED',
          ],
        },
        optionalTheory: {
          title: "From Mission 06",
          body: [
            "You already call the model, parse JSON, and choose a route.",
            "This mission sends that decision to Support — still a local simulation, not a real network lesson.",
          ],
        },
        successInsight:
          "An automation becomes useful when it sends existing data to another system.",
        miraSuccess: mira,
      },
      hints: [
        {
          level: 1,
          title: "Use what you have",
          body: "Each service argument needs a value you already have.",
        },
        {
          level: 2,
          title: "Message vs priority",
          body: "The original customer text is stored in `message`. The AI priority is inside `result`.",
          fromMira: true,
        },
        {
          level: 3,
          title: "Read the field",
          body: '`result["priority"]` reads the priority produced by MILDRED.',
        },
      ],
      concepts: [
        {
          id: "external-action",
          label: "external action",
          explanation: "Sending work to another system so something happens outside the program.",
        },
        {
          id: "service",
          label: "service",
          explanation: "A system that exposes named actions your program can call.",
        },
      ],
      completion: {
        miraLines: mira,
        systemBefore:
          "MILDRED could understand and decide — but decisions stayed inside the program.",
        systemAfter:
          "The program calls Support: create_ticket or queue_message with the right data.",
        capabilityUnlocked: {
          id: "external-actions",
          label: "External Actions",
          status: "ONLINE",
        },
        lessonHeadline:
          "A decision that never leaves the program changes nothing.",
        lessonBody: [
          "Support.create_ticket and Support.queue_message are actions — not HTTP lessons.",
          "Pass the original message and the priority MILDRED produced.",
        ],
        skillUnlocked: {
          skillId: "external-actions-1",
          skillName: "Send data to another system",
          formalSkillName: "External Actions I",
          skillCategory: "Service Integration",
          level: 1,
          description:
            "You can send data from your program to another system.",
        },
        technicalTerms: [
          {
            id: "action",
            label: "action",
            explanation: "A named operation a service performs — e.g. create_ticket.",
          },
          {
            id: "argument",
            label: "argument",
            explanation: "A value passed into that action — message, priority.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-07",
    slug: "chaine-de-confiance",
    order: 7,
    title: "Au-delà des Murs",
    shortTitle: "Au-delà",
    kind: "standard",
    xpReward: 240,
    playable: true,
    brief:
      "MILDRED sait ce qui doit se passer. Ce n’est pas assez. Une décision qui ne quitte jamais le programme ne change rien.",
    objective:
      "1. Sur HUMAN_REVIEW, crée un ticket support avec message + priorité.\n2. Sinon, mets le message en file.",
    context: "Projet MILDRED — action externe.",
    showcaseMessage: "Ma carte a été débitée deux fois.",
    codeFill,
    tests: suite,
    briefing: {
      shortBrief:
        "MILDRED sait ce qui doit se passer. Ce n’est pas assez. Le service support de Veyra expose deux actions — envoie chaque cas à la bonne, avec les bonnes données.",
      objectiveText:
        "1. Si route = HUMAN_REVIEW → support.create_ticket(message, priority).\n2. Sinon → support.queue_message(message).",
      categories: ["create_ticket", "queue_message"],
      newConcept: {
        title: "Décider → choisir → agir",
        summary:
          "L’IA décide. Le code choisit la route. Un service exécute l’action hors du programme.",
        example: `route == "HUMAN_REVIEW"
  →  support.create_ticket(message, result["priority"])
else
  →  support.queue_message(message)`,
        labels: [
          "create_ticket — ouvre un ticket humain",
          "queue_message — met une demande normale en file",
          "message — le texte client d’origine",
          'result["priority"] — priorité produite par MILDRED',
        ],
      },
      optionalTheory: {
        title: "Depuis la Mission 06",
        body: [
          "Tu appelles déjà le modèle, parses le JSON, et choisis une route.",
          "Ici, tu envoies cette décision à Support — toujours une simulation locale, pas une leçon réseau.",
        ],
      },
      successInsight:
        "Une automatisation devient utile quand elle envoie des données existantes à un autre système.",
      miraSuccess: mira,
    },
    hints: [
      {
        level: 1,
        title: "Utilise ce que tu as",
        body: "Chaque argument du service a besoin d’une valeur que tu as déjà.",
      },
      {
        level: 2,
        title: "Message vs priorité",
        body: "Le texte client d’origine est dans `message`. La priorité IA est dans `result`.",
        fromMira: true,
      },
      {
        level: 3,
        title: "Lis le champ",
        body: '`result["priority"]` lit la priorité produite par MILDRED.',
      },
    ],
    concepts: [
      {
        id: "external-action",
        label: "action externe",
        explanation:
          "Envoyer du travail à un autre système pour qu’il se passe quelque chose hors du programme.",
      },
      {
        id: "service",
        label: "service",
        explanation:
          "Un système qui expose des actions nommées que ton programme peut appeler.",
      },
    ],
    completion: {
      miraLines: mira,
      systemBefore:
        "MILDRED pouvait comprendre et décider — mais les décisions restaient dans le programme.",
      systemAfter:
        "Le programme appelle Support : create_ticket ou queue_message avec les bonnes données.",
      capabilityUnlocked: {
        id: "external-actions",
        label: "External Actions",
        status: "ONLINE",
      },
      lessonHeadline:
        "Une décision qui ne quitte jamais le programme ne change rien.",
      lessonBody: [
        "Support.create_ticket et Support.queue_message sont des actions — pas une leçon HTTP.",
        "Passe le message d’origine et la priorité produite par MILDRED.",
      ],
      skillUnlocked: {
        skillId: "external-actions-1",
        skillName: "Envoyer des données à un autre système",
        formalSkillName: "External Actions I",
        skillCategory: "Service Integration",
        level: 1,
        description:
          "Tu peux envoyer des données de ton programme vers un autre système.",
      },
      technicalTerms: [
        {
          id: "action",
          label: "action",
          explanation:
            "Une opération nommée qu’un service exécute — ex. create_ticket.",
        },
        {
          id: "argument",
          label: "argument",
          explanation:
            "Une valeur passée à cette action — message, priority.",
        },
      ],
    },
  };
}
