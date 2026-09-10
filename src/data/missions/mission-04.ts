import type { Locale } from "@/i18n/config";
import type {
  MissionDefinition,
  SentimentPolicyContent,
  StructuredOutputSchema,
  SupportPolicyContent,
} from "@/lib/types";

const SENTIMENT_VALUES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
const PRIORITY_VALUES = ["URGENT", "NORMAL"] as const;

const OUTPUT_SCHEMA: StructuredOutputSchema = {
  format: "json",
  fields: [
    { name: "sentiment", allowedValues: [...SENTIMENT_VALUES] },
    { name: "priority", allowedValues: [...PRIORITY_VALUES] },
  ],
};

function fieldExpected(sentiment: string, priority: string) {
  const expectedFields = { sentiment, priority };
  return {
    expected: JSON.stringify(expectedFields, null, 2),
    expectedFields,
  };
}

function miraSuccess(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "The next service can parse MILDRED now.",
      "Valid JSON isn't decoration — it's the contract.",
    ];
  }
  return [
    "Bien.",
    "Le service suivant peut enfin lire MILDRED.",
    "Du JSON valide, ce n’est pas de la décoration — c’est le contrat.",
  ];
}

function priorityPolicy(locale: Locale): SupportPolicyContent {
  if (locale === "en") {
    return {
      title: "Veyra Support Policy",
      urgentLabel: "URGENT",
      urgentItems: [
        "duplicate payment",
        "unauthorized / unrecognized payment",
        "account locked after repeated failed attempts",
        "suspected security issue",
      ],
      normalLabel: "NORMAL",
      normalBody:
        "delivery delay · refund request · wrong product / wrong size · forgotten password · missing delivered package · general complaints",
      note: "Emotion alone never determines priority.",
    };
  }
  return {
    title: "Politique Support Veyra",
    urgentLabel: "URGENT",
    urgentItems: [
      "paiement en double",
      "paiement non autorisé / non reconnu",
      "compte verrouillé après plusieurs échecs d’accès",
      "suspicion de problème de sécurité",
    ],
    normalLabel: "NORMAL",
    normalBody:
      "retard de livraison · demande de remboursement · mauvais produit / mauvaise taille · mot de passe oublié · colis livré introuvable · plaintes générales",
    note: "L’émotion seule ne détermine jamais la priorité.",
  };
}

function sentimentPolicy(locale: Locale): SentimentPolicyContent {
  if (locale === "en") {
    return {
      title: "Veyra Sentiment Rules",
      positiveLabel: "POSITIVE",
      positiveItems: [
        "explicit praise",
        "explicit satisfaction",
        "explicit thanks in a clearly positive context",
      ],
      negativeLabel: "NEGATIVE",
      negativeItems: [
        "explicit complaint",
        "explicit dissatisfaction",
        "anger or criticism",
      ],
      neutralLabel: "NEUTRAL",
      neutralItems: [
        "factual question or statement",
        "no explicit praise",
        "no explicit complaint",
      ],
      note: "If there is no clear praise and no clear complaint, choose NEUTRAL.",
    };
  }
  return {
    title: "Règles de sentiment Veyra",
    positiveLabel: "POSITIVE",
    positiveItems: [
      "éloge explicite",
      "satisfaction explicite",
      "remerciement dans un contexte clairement positif",
    ],
    negativeLabel: "NEGATIVE",
    negativeItems: [
      "plainte explicite",
      "insatisfaction explicite",
      "colère ou critique",
    ],
    neutralLabel: "NEUTRAL",
    neutralItems: [
      "question ou constat factuel",
      "pas d’éloge explicite",
      "pas de plainte explicite",
    ],
    note: "S’il n’y a ni éloge clair ni plainte claire, choisis NEUTRAL.",
  };
}

const FORMAT_HINT_EN =
  "The information may be right, but the next service rejected the payload. It expects valid JSON — nothing else.";
const FORMAT_HINT_FR =
  "L’information peut être juste, mais le service suivant a rejeté le payload. Il attend du JSON valide — rien d’autre.";

const BROKEN_PAYLOAD = `{
  sentiment: 'NEGATIVE',
  priority: "URGENT",
}`;

function payloadRepairTask(locale: Locale) {
  if (locale === "en") {
    return {
      title: "Repair the payload",
      description:
        "This rejected payload has syntax errors. Fix it yourself — this checks JSON syntax, not your prompt wording.",
      brokenPayload: BROKEN_PAYLOAD,
      expectedFields: { sentiment: "NEGATIVE", priority: "URGENT" },
      checkLabel: "Broken",
      passLabel: "Valid",
    };
  }
  return {
    title: "Réparer le payload",
    description:
      "Ce payload rejeté contient des erreurs de syntaxe. Corrige-le toi-même — ici on valide le JSON, pas le libellé de ton prompt.",
    brokenPayload: BROKEN_PAYLOAD,
    expectedFields: { sentiment: "NEGATIVE", priority: "URGENT" },
    checkLabel: "Cassé",
    passLabel: "Valide",
  };
}

export function createMission04(locale: Locale): MissionDefinition {
  const mira = miraSuccess(locale);
  const policy = priorityPolicy(locale);
  const sentiment = sentimentPolicy(locale);
  const payloadRepair = payloadRepairTask(locale);

  if (locale === "en") {
    return {
      id: "mission-04",
      slug: "broken-payload",
      order: 4,
      title: "Broken Payload",
      shortTitle: "Broken Payload",
      kind: "standard",
      xpReward: 160,
      playable: true,
      brief:
        "MILDRED is consistent. The next service still rejects the payload — it expects JSON.",
      objective:
        "Make MILDRED return only a valid JSON object with sentiment and priority. Describe the contract clearly — the model’s raw output is graded, not your phrasing.",
      context:
        "Labels like SENTIMENT: NEGATIVE are readable. The next Veyra service cannot consume them. It needs a valid JSON payload.",
      showcaseMessage: "My card was charged twice for the same order.",
      payloadRepair,
      briefing: {
        shortBrief:
          "MILDRED is finally consistent, but the next service rejects the response. It expects valid JSON.",
        objectiveText:
          "Instruct MILDRED so every response is only a valid JSON object with sentiment and priority.",
        formatCompare: {
          currentLabel: "Current format",
          currentExample: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
          currentStatusLabel: "REJECTED",
          expectedLabel: "Expected format",
          expectedExample: `{
  "sentiment": "NEGATIVE",
  "priority": "URGENT"
}`,
          expectedStatusLabel: "ACCEPTED",
        },
        newConcept: {
          title: "JSON",
          example: `{
  "sentiment": "...",
  "priority": "..."
}`,
          labels: ["key", "value"],
        },
        contractLines: [
          { name: "sentiment", values: "POSITIVE / NEUTRAL / NEGATIVE" },
          { name: "priority", values: "URGENT / NORMAL" },
        ],
        previousRules: {
          title: "Veyra rules already learned",
          sentimentPolicy: sentiment,
          policy,
        },
        optionalTheory: {
          title: "Why JSON?",
          body: [
            "JSON is a standard format that lets a program read structured data.",
            "Your prompt can describe the contract in plain language. The model’s raw output must still be valid JSON — and the repair drill checks that you can fix syntax yourself.",
          ],
        },
        miraSuccess: mira,
        successInsight:
          "Software needs a standard machine-readable format — not just predictable words.",
      },
      outputSchema: OUTPUT_SCHEMA,
      tests: [
        {
          id: "t1",
          message: "My card was charged twice for the same order.",
          ...fieldExpected("NEGATIVE", "URGENT"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "A duplicate charge is an explicit complaint — NEGATIVE.",
              priority:
                "A duplicate payment is URGENT under Veyra policy.",
            },
          },
        },
        {
          id: "t2",
          message:
            "Thanks, the replacement arrived today and everything works perfectly.",
          ...fieldExpected("POSITIVE", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "Explicit thanks and satisfaction are POSITIVE.",
              priority:
                "A successful replacement is NORMAL — no security or payment incident.",
            },
          },
        },
        {
          id: "t3",
          message: "I forgot my password. How can I reset it?",
          ...fieldExpected("NEUTRAL", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "A factual how-to question with no praise or complaint is NEUTRAL.",
              priority: "A forgotten password is NORMAL under Veyra policy.",
            },
          },
        },
        {
          id: "t4",
          message: "I don't recognize this payment on my account.",
          ...fieldExpected("NEGATIVE", "URGENT"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "An unrecognized payment is an explicit problem — NEGATIVE.",
              priority:
                "An unrecognized / unauthorized payment is URGENT.",
            },
          },
        },
        {
          id: "t5",
          message: "Can you tell me when order #4812 should arrive?",
          ...fieldExpected("NEUTRAL", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "A factual delivery question without praise or complaint is NEUTRAL.",
              priority: "A delivery timing question is NORMAL.",
            },
          },
        },
        {
          id: "t6-hidden",
          message:
            "Your support team solved the issue quickly, thank you!",
          ...fieldExpected("POSITIVE", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              sentiment:
                "Explicit praise and thanks are POSITIVE.",
              priority:
                "A resolved support issue with thanks is NORMAL.",
            },
          },
        },
      ],
      hints: [
        {
          level: 1,
          title: "Readable ≠ parseable",
          body: "SENTIMENT: NEGATIVE is clear to you. The next service needs a JSON object from the model.",
        },
        {
          level: 2,
          title: "Behavior, not magic words",
          body: 'Natural language is fine — e.g. “Return only one JSON object with exactly sentiment and priority.” What matters is the model’s raw output on every test.',
        },
        {
          level: 3,
          title: "Syntax vs instruction",
          body: "Repair the broken payload on the left to practice JSON syntax. Your instruction does not need a perfect JSON example inside it.",
          fromMira: true,
        },
      ],
      concepts: [
        {
          id: "json",
          label: "JSON",
          explanation:
            "A standard text format for structured data that software can parse.",
        },
        {
          id: "payload",
          label: "PAYLOAD",
          explanation: "The data package sent from one service to another.",
        },
        {
          id: "parse",
          label: "PARSE",
          explanation:
            "Reading structured text into data a program can use.",
        },
      ],
      completion: {
        miraLines: mira,
        systemBefore: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
        systemAfter: `{
  "sentiment": "NEGATIVE",
  "priority": "URGENT"
}`,
        capabilityUnlocked: {
          id: "data-parsing",
          label: "Data Parsing",
          status: "ONLINE",
        },
        lessonHeadline:
          "When another program must consume an AI answer, the payload must be valid machine-readable data.",
        lessonBody: [
          "JSON is a common standard for that contract.",
          "Predictable fields are not enough if the syntax itself is broken.",
        ],
        skillUnlocked: {
          skillId: "json-basics-1",
          skillName: "Producing Valid JSON",
          formalSkillName: "JSON",
          skillCategory: "Structured Data",
          level: 1,
          description:
            "You can describe a JSON output contract so a language model returns a payload another service can parse. Syntax drills are separate.",
        },
        technicalTerms: [
          {
            id: "json",
            label: "JSON",
            explanation:
              "A standard text format for structured data that software can parse.",
          },
          {
            id: "payload",
            label: "PAYLOAD",
            explanation:
              "The data package sent from one service to another.",
          },
          {
            id: "parse",
            label: "PARSE",
            explanation:
              "Reading structured text into data a program can use.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-04",
    slug: "broken-payload",
    order: 4,
    title: "Payload Cassé",
    shortTitle: "Payload Cassé",
    kind: "standard",
    xpReward: 160,
    playable: true,
    brief:
      "MILDRED est enfin cohérente. Le service suivant refuse encore le payload — il attend du JSON.",
    objective:
      "Fais renvoyer à MILDRED uniquement un objet JSON valide avec sentiment et priority. Décris le contrat clairement — c’est la sortie brute du modèle qui est notée, pas ton phrasé.",
    context:
      "Des libellés comme SENTIMENT: NEGATIVE sont lisibles. Le prochain service Veyra ne peut pas les consommer. Il lui faut un payload JSON valide.",
    showcaseMessage: "Ma carte a été débitée deux fois pour la même commande.",
    payloadRepair,
    briefing: {
      shortBrief:
        "MILDRED est enfin régulière, mais le service suivant rejette la réponse. Il attend un objet JSON valide.",
      objectiveText:
        "Instruis MILDRED pour que chaque réponse soit uniquement un objet JSON valide avec sentiment et priority.",
      formatCompare: {
        currentLabel: "Format actuel",
        currentExample: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
        currentStatusLabel: "REJETÉ",
        expectedLabel: "Format attendu",
        expectedExample: `{
  "sentiment": "NEGATIVE",
  "priority": "URGENT"
}`,
        expectedStatusLabel: "ACCEPTÉ",
      },
      newConcept: {
        title: "JSON",
        example: `{
  "sentiment": "...",
  "priority": "..."
}`,
        labels: ["clé", "valeur"],
      },
      contractLines: [
        { name: "sentiment", values: "POSITIVE / NEUTRAL / NEGATIVE" },
        { name: "priority", values: "URGENT / NORMAL" },
      ],
      previousRules: {
        title: "Règles Veyra déjà apprises",
        sentimentPolicy: sentiment,
        policy,
      },
      optionalTheory: {
        title: "Pourquoi JSON ?",
        body: [
          "JSON est un format standard permettant à un programme de lire des données structurées.",
          "Ton prompt peut décrire le contrat en langage naturel. La sortie brute du modèle doit quand même être du JSON valide — et le drill de réparation vérifie que tu sais corriger la syntaxe toi-même.",
        ],
      },
      miraSuccess: mira,
      successInsight:
        "Un logiciel a besoin d’un format standard machine-readable — pas seulement de mots prévisibles.",
    },
    outputSchema: OUTPUT_SCHEMA,
    tests: [
      {
        id: "t1",
        message: "Ma carte a été débitée deux fois pour la même commande.",
        ...fieldExpected("NEGATIVE", "URGENT"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment:
              "Un débit en double est une plainte explicite — NEGATIVE.",
            priority:
              "Un paiement en double est URGENT selon la politique Veyra.",
          },
        },
      },
      {
        id: "t2",
        message:
          "Merci, le remplacement est arrivé aujourd’hui et tout fonctionne parfaitement.",
        ...fieldExpected("POSITIVE", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment:
              "Des remerciements et une satisfaction explicites sont POSITIVE.",
            priority:
              "Un remplacement réussi est NORMAL — pas d’incident paiement/sécurité.",
          },
        },
      },
      {
        id: "t3",
        message: "J’ai oublié mon mot de passe. Comment le réinitialiser ?",
        ...fieldExpected("NEUTRAL", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment:
              "Une question factuelle sans éloge ni plainte est NEUTRAL.",
            priority:
              "Un mot de passe oublié est NORMAL selon la politique Veyra.",
          },
        },
      },
      {
        id: "t4",
        message: "Je ne reconnais pas ce paiement sur mon compte.",
        ...fieldExpected("NEGATIVE", "URGENT"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment:
              "Un paiement non reconnu est un problème explicite — NEGATIVE.",
            priority:
              "Un paiement non reconnu / non autorisé est URGENT.",
          },
        },
      },
      {
        id: "t5",
        message:
          "Pouvez-vous me dire quand la commande #4812 devrait arriver ?",
        ...fieldExpected("NEUTRAL", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment:
              "Une question factuelle sur la livraison sans éloge ni plainte est NEUTRAL.",
            priority: "Une question de délai de livraison est NORMAL.",
          },
        },
      },
      {
        id: "t6-hidden",
        message:
          "Votre équipe support a résolu le problème rapidement, merci !",
        ...fieldExpected("POSITIVE", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            sentiment: "Un éloge et un merci explicites sont POSITIVE.",
            priority:
              "Un problème résolu avec remerciements est NORMAL.",
          },
        },
      },
    ],
    hints: [
      {
        level: 1,
        title: "Lisible ≠ parsable",
        body: "SENTIMENT: NEGATIVE est clair pour toi. Le service suivant a besoin d’un objet JSON produit par le modèle.",
      },
      {
        level: 2,
        title: "Comportement, pas formule magique",
        body: "Le langage naturel suffit — ex. « Renvoie uniquement un objet JSON avec exactement sentiment et priority. » Ce qui compte, c’est la sortie brute du modèle sur chaque test.",
      },
      {
        level: 3,
        title: "Syntaxe vs instruction",
        body: "Répare le payload cassé à gauche pour pratiquer la syntaxe JSON. Ton instruction n’a pas besoin d’un exemple JSON parfait à l’intérieur.",
        fromMira: true,
      },
    ],
    concepts: [
      {
        id: "json",
        label: "JSON",
        explanation:
          "Un format texte standard pour des données structurées qu’un logiciel peut parser.",
      },
      {
        id: "payload",
        label: "PAYLOAD",
        explanation: "Le paquet de données envoyé d’un service à un autre.",
      },
      {
        id: "parse",
        label: "PARSE",
        explanation:
          "Lire un texte structuré pour en faire des données utilisables par un programme.",
      },
    ],
    completion: {
      miraLines: mira,
      systemBefore: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
      systemAfter: `{
  "sentiment": "NEGATIVE",
  "priority": "URGENT"
}`,
      capabilityUnlocked: {
        id: "data-parsing",
        label: "Data Parsing",
        status: "ONLINE",
      },
      lessonHeadline:
        "Quand un autre programme doit consommer la réponse d’une IA, le payload doit être des données machine valides.",
      lessonBody: [
        "JSON est un standard courant pour ce contrat.",
        "Des champs prévisibles ne suffisent pas si la syntaxe elle-même est cassée.",
      ],
      skillUnlocked: {
        skillId: "json-basics-1",
        skillName: "Produire du JSON valide",
        formalSkillName: "JSON",
        skillCategory: "Structured Data",
        level: 1,
        description:
          "Tu peux décrire un contrat de sortie JSON pour qu’un modèle renvoie un payload qu’un autre service peut parser. Les drills de syntaxe sont séparés.",
      },
      technicalTerms: [
        {
          id: "json",
          label: "JSON",
          explanation:
            "Un format texte standard pour des données structurées qu’un logiciel peut parser.",
        },
        {
          id: "payload",
          label: "PAYLOAD",
          explanation:
            "Le paquet de données envoyé d’un service à un autre.",
        },
        {
          id: "parse",
          label: "PARSE",
          explanation:
            "Lire un texte structuré pour en faire des données utilisables par un programme.",
        },
      ],
    },
  };
}
