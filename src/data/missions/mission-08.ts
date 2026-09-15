import type { Locale } from "@/i18n/config";
import type {
  ClassificationTest,
  MissionDefinition,
  PipelineTask,
} from "@/lib/types";
import { defaultChainConnections } from "@/lib/missions/pipeline";

const HUMAN = "HUMAN_REVIEW";
const QUEUE = "STANDARD_QUEUE";

function pipelineTask(locale: Locale): PipelineTask {
  const expected = defaultChainConnections();
  const blocks: PipelineTask["blocks"] = [
    {
      id: "customer",
      title: locale === "en" ? "Customer Message" : "Message client",
      inputs: [],
      outputs: [{ id: "message", label: "message" }],
    },
    {
      id: "ai",
      title: locale === "en" ? "Ask MILDRED" : "Demander à MILDRED",
      inputs: [
        {
          id: "message",
          label: "message",
          allowed: [{ blockId: "customer", field: "message" }],
        },
      ],
      outputs: [{ id: "response", label: "response" }],
    },
    {
      id: "parse",
      title: "Parse JSON",
      inputs: [
        {
          id: "text",
          label: "text",
          allowed: [{ blockId: "ai", field: "response" }],
        },
      ],
      outputs: [
        { id: "data", label: "data" },
        { id: "data.priority", label: "data.priority" },
        { id: "data.sentiment", label: "data.sentiment" },
      ],
    },
    {
      id: "decision",
      title: locale === "en" ? "Choose Route" : "Choisir la route",
      inputs: [
        {
          id: "priority",
          label: "priority",
          allowed: [
            { blockId: "parse", field: "data.priority" },
            { blockId: "parse", field: "data" },
            { blockId: "ai", field: "response" },
            { blockId: "parse", field: "data.sentiment" },
          ],
        },
      ],
      outputs: [{ id: "route", label: "route" }],
    },
    {
      id: "action",
      title: locale === "en" ? "Support Action" : "Action Support",
      inputs: [
        {
          id: "route",
          label: "route",
          allowed: [{ blockId: "decision", field: "route" }],
        },
        {
          id: "message",
          label: "message",
          allowed: [
            { blockId: "customer", field: "message" },
            { blockId: "ai", field: "response" },
          ],
        },
        {
          id: "priority",
          label: "priority",
          allowed: [
            { blockId: "parse", field: "data.priority" },
            { blockId: "parse", field: "data" },
            { blockId: "decision", field: "route" },
          ],
        },
      ],
      outputs: [],
    },
  ];

  if (locale === "en") {
    return {
      title: "Build the chain",
      description:
        "Connect each step's inputs to the right outputs. Data must flow through the full automation.",
      blocks,
      expectedConnections: expected,
      urgentPriority: "URGENT",
      humanRoute: HUMAN,
      queueRoute: QUEUE,
      checkLabel: "Incomplete",
      passLabel: "Connected",
    };
  }

  return {
    title: "Construire la chaîne",
    description:
      "Connecte les entrées de chaque étape aux bonnes sorties. Les données doivent traverser toute l’automatisation.",
    blocks,
    expectedConnections: expected,
    urgentPriority: "URGENT",
    humanRoute: HUMAN,
    queueRoute: QUEUE,
    checkLabel: "Incomplet",
    passLabel: "Connecté",
  };
}

function aiJson(priority: string, sentiment = "NEGATIVE"): string {
  return JSON.stringify({ sentiment, priority });
}

function tests(locale: Locale): ClassificationTest[] {
  const msgUrgent =
    locale === "en"
      ? "My card was charged twice."
      : "Ma carte a été débitée deux fois.";
  const msgNormal =
    locale === "en"
      ? "Where can I download my invoice?"
      : "Où puis-je télécharger ma facture ?";
  const msgPositiveUrgent =
    locale === "en"
      ? "Thanks for yesterday — but now I'm locked out."
      : "Merci pour hier — mais là je suis bloqué.";
  const msgAlt =
    locale === "en"
      ? "Please cancel the unrecognized payment on my statement."
      : "Merci d’annuler le paiement non reconnu sur mon relevé.";

  return [
    {
      id: "t1",
      message: msgUrgent,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "Urgent priority must create a human ticket."
          : "Une priorité urgente doit créer un ticket humain.",
    },
    {
      id: "t2",
      message: msgNormal,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        sentiment: "NEUTRAL",
        aiResponse: aiJson("NORMAL", "NEUTRAL"),
      },
      failHint:
        locale === "en"
          ? "Normal priority must queue the message."
          : "Une priorité normale doit mettre le message en file.",
    },
    {
      id: "t3",
      message: msgPositiveUrgent,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "POSITIVE",
        aiResponse: aiJson("URGENT", "POSITIVE"),
      },
      failHint:
        locale === "en"
          ? "Routing follows priority, not sentiment."
          : "Le routage suit la priorité, pas le sentiment.",
    },
    {
      id: "t4-hidden",
      message: msgAlt,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "The support service knows what to do, but not which customer message to process."
          : "Le service support sait quoi faire, mais pas quel message client traiter.",
    },
    {
      id: "t5-hidden",
      message: msgNormal,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("NORMAL", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "Routing must follow the parsed priority, not a hardcoded value."
          : "Le routage doit suivre la priorité parsée, pas une valeur en dur.",
    },
  ];
}

export function createMission08(locale: Locale): MissionDefinition {
  const pipeline = pipelineTask(locale);
  const suite = tests(locale);

  if (locale === "en") {
    return {
      id: "mission-08",
      slug: "seuil-critique",
      order: 8,
      title: "The Chain",
      shortTitle: "Chain",
      kind: "standard",
      xpReward: 260,
      playable: true,
      brief:
        "The bricks exist. Now they have to hold together — each step's output can feed the next.",
      objective:
        "1. Connect Customer → AI → Parse → Decision → Support.\n2. Reuse the original message at the action step.\n3. Feed priority from Parse into Decision and Support.",
      context: "Project MILDRED — workflow composition.",
      showcaseMessage: suite[0]!.message,
      pipeline,
      tests: suite,
      briefing: {
        shortBrief:
          "Each step has a contract. Outputs can feed later inputs. Some earlier data stays useful — like the original customer message.",
        objectiveText:
          "Wire the five blocks so data flows: message → AI → JSON → route → Support action.",
        categories: ["create_ticket", "queue_message"],
        newConcept: {
          title: "INPUT → AI → PARSE → DECISION → ACTION",
          summary:
            "Each step has inputs and outputs. One step's output can feed another. Some data is needed again later.",
          example: `Customer.message → AI.message
AI.response → Parse.text
Parse.data.priority → Decision.priority
Decision.route → Action.route
Customer.message → Action.message`,
          labels: [
            "IN / OUT — each step's contract",
            "Parse sits between text and priority",
            "Customer.message feeds AI and Support",
          ],
        },
        optionalTheory: {
          title: "Light types",
          body: [
            "Think of inputs and outputs as named slots — not a type-system lesson.",
            "If a step expects a priority, do not pass raw model text.",
          ],
        },
        successInsight:
          "A workflow works when data flows through every step that needs it.",
        miraSuccess: [
          "Good.",
          "The chain holds.",
          "Message in, action out — with structure in between.",
        ],
      },
      hints: [
        {
          level: 1,
          title: "Follow the data",
          body: "Follow each piece of data from where it is created to where it is needed.",
        },
        {
          level: 2,
          title: "Text is not priority",
          body: "MILDRED returns text. The decision needs a priority value. Something must happen between them.",
          fromMira: true,
        },
        {
          level: 3,
          title: "The bridge",
          body: "AI.response → Parse JSON → data.priority",
        },
      ],
      completion: {
        miraLines: [
          "Good.",
          "The chain holds.",
          "Message in, action out — with structure in between.",
        ],
        systemBefore: "Pieces worked alone — they did not yet form one workflow.",
        systemAfter:
          "Customer → MILDRED → JSON → route → Support runs as one chain.",
        capabilityUnlocked: {
          id: "workflow-composition",
          label: "Workflow Composition",
          status: "ONLINE",
        },
        lessonHeadline:
          "Automations are contracts: outputs feed later inputs.",
        lessonBody: [
          "Parse turns MILDRED's text into data the decision can use.",
          "The original message must still reach Support at the end.",
        ],
        skillUnlocked: {
          skillId: "workflow-composition-1",
          skillName: "Connect processing steps",
          formalSkillName: "Workflow Composition I",
          skillCategory: "Data Flow",
          level: 1,
          description:
            "You can connect multiple processing steps into a working automation.",
        },
      },
    };
  }

  return {
    id: "mission-08",
    slug: "seuil-critique",
    order: 8,
    title: "La Chaîne",
    shortTitle: "Chaîne",
    kind: "standard",
    xpReward: 260,
    playable: true,
    brief:
      "Les briques existent. Il faut qu’elles tiennent ensemble — la sortie d’une étape peut alimenter la suivante.",
    objective:
      "1. Connecte Client → IA → Parse → Décision → Support.\n2. Réutilise le message d’origine à l’étape action.\n3. Passe la priorité du Parse vers Décision et Support.",
    context: "Projet MILDRED — composition de workflow.",
    showcaseMessage: suite[0]!.message,
    pipeline,
    tests: suite,
    briefing: {
      shortBrief:
        "Chaque étape a un contrat. Les sorties peuvent alimenter des entrées plus loin. Certaines données restent utiles — comme le message client d’origine.",
      objectiveText:
        "Branchez les cinq blocs pour que les données circulent : message → IA → JSON → route → action Support.",
      categories: ["create_ticket", "queue_message"],
      newConcept: {
        title: "INPUT → IA → PARSE → DÉCISION → ACTION",
        summary:
          "Chaque étape a des entrées et des sorties. La sortie d’une étape peut alimenter une autre. Certaines données servent encore plus loin.",
        example: `Customer.message → AI.message
AI.response → Parse.text
Parse.data.priority → Decision.priority
Decision.route → Action.route
Customer.message → Action.message`,
        labels: [
          "IN / OUT — contrat de chaque étape",
          "Parse s’intercale entre texte et priorité",
          "Customer.message alimente l’IA et le Support",
        ],
      },
      optionalTheory: {
        title: "Types légers",
        body: [
          "Pense entrées/sorties comme des emplacements nommés — pas un cours de système de types.",
          "Si une étape attend une priorité, ne lui passe pas le texte brut du modèle.",
        ],
      },
      successInsight:
        "Un workflow marche quand les données traversent chaque étape qui en a besoin.",
      miraSuccess: [
        "Bien.",
        "La chaîne tient.",
        "Message en entrée, action en sortie — avec de la structure au milieu.",
      ],
    },
    hints: [
      {
        level: 1,
        title: "Suis les données",
        body: "Suis chaque donnée depuis là où elle est créée jusqu’à là où elle est nécessaire.",
      },
      {
        level: 2,
        title: "Le texte n’est pas la priorité",
        body: "MILDRED renvoie du texte. La décision a besoin d’une priorité. Quelque chose doit se passer entre les deux.",
        fromMira: true,
      },
      {
        level: 3,
        title: "Le pont",
        body: "AI.response → Parse JSON → data.priority",
      },
    ],
    completion: {
      miraLines: [
        "Bien.",
        "La chaîne tient.",
        "Message en entrée, action en sortie — avec de la structure au milieu.",
      ],
      systemBefore:
        "Les pièces marchaient isolément — elles ne formaient pas encore un workflow.",
      systemAfter:
        "Client → MILDRED → JSON → route → Support s’exécute comme une chaîne.",
      capabilityUnlocked: {
        id: "workflow-composition",
        label: "Workflow Composition",
        status: "ONLINE",
      },
      lessonHeadline:
        "Les automatisations sont des contrats : les sorties alimentent les entrées suivantes.",
      lessonBody: [
        "Parse transforme le texte de MILDRED en données utilisables par la décision.",
        "Le message d’origine doit encore atteindre Support à la fin.",
      ],
      skillUnlocked: {
        skillId: "workflow-composition-1",
        skillName: "Connecter des étapes de traitement",
        formalSkillName: "Workflow Composition I",
        skillCategory: "Data Flow",
        level: 1,
        description:
          "Tu peux connecter plusieurs étapes de traitement en une automatisation qui marche.",
      },
    },
  };
}
