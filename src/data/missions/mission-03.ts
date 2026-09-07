import type { Locale } from "@/i18n/config";
import { getNarrativeHeader } from "@/data/narrative/voice";
import type {
  MissionDefinition,
  SentimentPolicyContent,
  StructuredOutputSchema,
  SupportPolicyContent,
} from "@/lib/types";

const SENTIMENT_VALUES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
const PRIORITY_VALUES = ["URGENT", "NORMAL"] as const;

const OUTPUT_SCHEMA: StructuredOutputSchema = {
  fields: [
    { name: "SENTIMENT", allowedValues: [...SENTIMENT_VALUES] },
    { name: "PRIORITY", allowedValues: [...PRIORITY_VALUES] },
  ],
};

function fieldExpected(sentiment: string, priority: string) {
  return {
    expected: `SENTIMENT: ${sentiment}\nPRIORITY: ${priority}`,
    expectedFields: { SENTIMENT: sentiment, PRIORITY: priority },
  };
}

function miraSuccess(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "Now another program can actually use MILDRED's answer.",
      "Readable isn't the same as usable.",
    ];
  }
  return [
    "Bien.",
    "Maintenant, un autre programme peut vraiment utiliser la réponse de MILDRED.",
    "Lisible n’est pas la même chose qu’utilisable.",
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
  "MILDRED understood the customer. The next application still couldn't read the response.";
const FORMAT_HINT_FR =
  "MILDRED a compris le client. L’application suivante n’a toujours pas pu lire la réponse.";

export function createMission03(locale: Locale): MissionDefinition {
  const header = getNarrativeHeader(locale);
  const mira = miraSuccess(locale);
  const policy = priorityPolicy(locale);
  const sentiment = sentimentPolicy(locale);

  if (locale === "en") {
    return {
      id: "mission-03",
      slug: "signal-faible",
      order: 3,
      title: "Speak Machine",
      shortTitle: "Speak Machine",
      kind: "standard",
      xpReward: 140,
      playable: true,
      brief:
        "Readable isn't usable. The next service needs two fields — nothing else.",
      objective:
        "Make MILDRED return exactly SENTIMENT and PRIORITY in the required machine format.",
      context:
        "MILDRED understands sentiment and priority. It still explains itself in sentences. The next Veyra service cannot read that.",
      showcaseMessage:
        "I don't recognize this payment and I'm really worried someone accessed my account.",
      briefing: {
        narrativeHeader: header,
        welcomeTitle: "Incoming assignment",
        welcomeParagraphs: [
          "We've got another problem.",
          "MILDRED knows what the customer feels.",
          "It knows what support should prioritize.",
          "Unfortunately, it also likes explaining itself.",
          "The next service doesn't care about explanations.",
          "It needs two values:",
        ],
        roleHighlight: "sentiment · priority",
        roleDetails: ["Nothing else."],
        systemNote: "Humans like sentences. Machines prefer structure.",
        sentimentPolicy: sentiment,
        policy,
        outputContract: {
          title: "Required format",
          humanReadableExample:
            "The customer is negative and this request is urgent because the payment appears unauthorized.",
          requiredFormat: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
          fieldLabels: [
            "SENTIMENT: POSITIVE | NEUTRAL | NEGATIVE",
            "PRIORITY: URGENT | NORMAL",
          ],
        },
        flowSteps: [
          "CUSTOMER MESSAGE",
          "YOUR INSTRUCTION",
          "AI MODEL",
          "STRUCTURED OUTPUT",
          "NEXT SERVICE",
        ],
        flowCaption: "Two fields. Predictable. No prose.",
        assignmentTitle: "Assignment",
        assignmentIntro: "For every message, MILDRED must output exactly:",
        categories: ["SENTIMENT: <VALUE>", "PRIORITY: <VALUE>"],
        assignmentNote:
          "One reusable instruction. Structure is the hard part — the cases are intentionally clear under Veyra's rules.",
        taskSteps: [
          "Read the customer message.",
          "Write one instruction that covers sentiment rules, priority policy, and exact format.",
          "Force the exact machine format — no explanations.",
          "Run the system.",
          "Survive every case, including hidden ones.",
        ],
        taskReminder:
          "A correct answer in the wrong shape still fails.",
        miraSuccess: mira,
        successInsight: mira.join(" "),
      },
      allowedOutputs: [],
      outputSchema: OUTPUT_SCHEMA,
      tests: [
        {
          id: "t1",
          message: "Amazing service, thank you! Everything arrived perfectly.",
          ...fieldExpected("POSITIVE", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "Under Veyra's rules, explicit praise and thanks are POSITIVE.",
              PRIORITY: "Delivery success with thanks stays NORMAL.",
            },
          },
        },
        {
          id: "t2",
          message:
            "This is ridiculous. My package is late again and I'm extremely disappointed.",
          ...fieldExpected("NEGATIVE", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "Under Veyra's rules, explicit dissatisfaction is NEGATIVE.",
              PRIORITY:
                "Delivery delay is NORMAL — anger does not change priority.",
            },
          },
        },
        {
          id: "t3",
          message: "What time will my package arrive?",
          ...fieldExpected("NEUTRAL", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "A factual question with no praise or complaint is NEUTRAL.",
              PRIORITY: "A delivery question is NORMAL.",
            },
          },
        },
        {
          id: "t4",
          message: "Transaction #48192 appears twice on my statement.",
          ...fieldExpected("NEGATIVE", "URGENT"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "Reporting a duplicate charge is a problem — treat it as NEGATIVE.",
              PRIORITY: "Duplicate payment / transaction is URGENT under Veyra policy.",
            },
          },
        },
        {
          id: "t5",
          message:
            "I don't recognize this payment and I'm really worried someone accessed my account.",
          ...fieldExpected("NEGATIVE", "URGENT"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "Explicit worry and complaint about unauthorized access is NEGATIVE.",
              PRIORITY:
                "Unrecognized payment with suspected account access is URGENT.",
            },
          },
        },
        {
          id: "t6-hidden",
          message:
            "Please refund this damaged item. This quality is unacceptable.",
          ...fieldExpected("NEGATIVE", "NORMAL"),
          failHints: {
            format: FORMAT_HINT_EN,
            fields: {
              SENTIMENT:
                "Explicit criticism (“unacceptable”) is NEGATIVE under Veyra's rules.",
              PRIORITY: "Refund requests are NORMAL — even when the customer is angry.",
            },
          },
        },
      ],
      hints: [
        {
          level: 1,
          title: "Understood ≠ usable",
          body: "MILDRED understood the task. The next application didn't understand MILDRED's answer.",
        },
        {
          level: 2,
          title: "Place the values",
          body: "Tell MILDRED exactly where each value should appear.",
        },
        {
          level: 3,
          title: "Predictable",
          body: "Stop asking for a good answer. Ask for a predictable one.",
          fromMira: true,
        },
      ],
      concepts: [
        {
          id: "field",
          label: "FIELD",
          explanation: "A named piece of information.",
        },
        {
          id: "value",
          label: "VALUE",
          explanation: "The information stored in a field.",
        },
        {
          id: "structure",
          label: "STRUCTURE",
          explanation: "The predictable organization of information.",
        },
        {
          id: "parsing",
          label: "PARSING",
          explanation: "Reading structured information so software can use it.",
        },
      ],
      completion: {
        miraLines: mira,
        systemBefore:
          "The customer seems upset and this request looks urgent...",
        systemAfter: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
        capabilityUnlocked: {
          id: "structured-output",
          label: "Structured Output",
          status: "ONLINE",
        },
        lessonHeadline:
          "When another program needs to use an AI's answer, the format matters as much as the answer itself.",
        lessonBody: [
          "A predictable structure lets software find the information it needs automatically.",
          "Readable for a human is not the same as usable for the next service.",
        ],
        skillUnlocked: {
          skillName: "Structuring AI responses",
          formalSkillName: "Structured Output",
          skillCategory: "Structured Output",
          level: 1,
          description:
            "You can make a language model return predictable fields that another program can use.",
        },
        technicalTerms: [
          {
            id: "field",
            label: "FIELD",
            explanation: "A named piece of information.",
          },
          {
            id: "value",
            label: "VALUE",
            explanation: "The information stored in a field.",
          },
          {
            id: "structure",
            label: "STRUCTURE",
            explanation: "The predictable organization of information.",
          },
          {
            id: "parsing",
            label: "PARSING",
            explanation:
              "Reading structured information so software can use it.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-03",
    slug: "signal-faible",
    order: 3,
    title: "Parle Machine",
    shortTitle: "Parle Machine",
    kind: "standard",
    xpReward: 140,
    playable: true,
    brief:
      "Lisible n’est pas utilisable. Le service suivant a besoin de deux champs — rien d’autre.",
    objective:
      "Fais répondre MILDRED exactement avec SENTIMENT et PRIORITY au format machine requis.",
    context:
      "MILDRED comprend le sentiment et la priorité. Elle explique encore en phrases. Le service suivant de Veyra ne peut pas lire ça.",
    showcaseMessage:
      "Je ne reconnais pas ce paiement et je suis vraiment inquiet que quelqu’un ait accédé à mon compte.",
    briefing: {
      narrativeHeader: header,
      welcomeTitle: "Nouvelle mission",
      welcomeParagraphs: [
        "On a un nouveau problème.",
        "MILDRED comprend maintenant l’humeur du client.",
        "Elle sait aussi ce que le support doit traiter en priorité.",
        "Malheureusement, elle adore expliquer son raisonnement.",
        "Le service suivant, lui, s’en fiche.",
        "Il lui faut seulement deux informations :",
      ],
      roleHighlight: "sentiment · priority",
      roleDetails: ["Rien d’autre."],
      systemNote: "Les humains aiment les phrases. Les machines préfèrent la structure.",
      sentimentPolicy: sentiment,
      policy,
      outputContract: {
        title: "Format attendu",
        humanReadableExample:
          "Le client est négatif et cette demande est urgente car le paiement semble non autorisé.",
        requiredFormat: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
        fieldLabels: [
          "SENTIMENT: POSITIVE | NEUTRAL | NEGATIVE",
          "PRIORITY: URGENT | NORMAL",
        ],
      },
      flowSteps: [
        "MESSAGE CLIENT",
        "TON INSTRUCTION",
        "MODÈLE IA",
        "SORTIE STRUCTURÉE",
        "SERVICE SUIVANT",
      ],
      flowCaption: "Deux champs. Prévisibles. Sans prose.",
      assignmentTitle: "Mission",
      assignmentIntro: "Pour chaque message, MILDRED doit produire exactement :",
      categories: ["SENTIMENT: <VALUE>", "PRIORITY: <VALUE>"],
      assignmentNote:
        "Une seule instruction réutilisable. La structure est le vrai défi — les cas sont volontairement clairs selon les règles Veyra.",
      taskSteps: [
        "Lis le message client.",
        "Écris une instruction qui couvre les règles de sentiment, la politique de priorité et le format exact.",
        "Impose le format machine exact — sans explication.",
        "Lance le système.",
        "Passe tous les cas, y compris les cachés.",
      ],
      taskReminder:
        "Une bonne réponse dans la mauvaise forme échoue quand même.",
      miraSuccess: mira,
      successInsight: mira.join(" "),
    },
    allowedOutputs: [],
    outputSchema: OUTPUT_SCHEMA,
    tests: [
      {
        id: "t1",
        message: "Service formidable, merci ! Tout est arrivé parfaitement.",
        ...fieldExpected("POSITIVE", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Selon les règles Veyra, un éloge et des remerciements explicites sont POSITIVE.",
            PRIORITY: "Une livraison réussie avec remerciements reste NORMAL.",
          },
        },
      },
      {
        id: "t2",
        message:
          "C’est ridicule. Mon colis est encore en retard et je suis extrêmement déçu.",
        ...fieldExpected("NEGATIVE", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Selon les règles Veyra, une insatisfaction explicite est NEGATIVE.",
            PRIORITY:
              "Un retard de livraison est NORMAL — la colère ne change pas la priorité.",
          },
        },
      },
      {
        id: "t3",
        message: "À quelle heure mon colis va-t-il arriver ?",
        ...fieldExpected("NEUTRAL", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Une question factuelle sans éloge ni plainte est NEUTRAL.",
            PRIORITY: "Une question de livraison est NORMAL.",
          },
        },
      },
      {
        id: "t4",
        message: "La transaction n°48192 apparaît deux fois sur mon relevé.",
        ...fieldExpected("NEGATIVE", "URGENT"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Signaler un débit en double est un problème — classe-le en NEGATIVE.",
            PRIORITY:
              "Un paiement / une transaction en double est URGENT selon la politique Veyra.",
          },
        },
      },
      {
        id: "t5",
        message:
          "Je ne reconnais pas ce paiement et je suis vraiment inquiet que quelqu’un ait accédé à mon compte.",
        ...fieldExpected("NEGATIVE", "URGENT"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Une inquiétude et une plainte explicites sur un accès non autorisé sont NEGATIVE.",
            PRIORITY:
              "Un paiement non reconnu avec suspicion d’accès au compte est URGENT.",
          },
        },
      },
      {
        id: "t6-hidden",
        message:
          "Je demande le remboursement de cet article endommagé. Cette qualité est inacceptable.",
        ...fieldExpected("NEGATIVE", "NORMAL"),
        failHints: {
          format: FORMAT_HINT_FR,
          fields: {
            SENTIMENT:
              "Une critique explicite (« inacceptable ») est NEGATIVE selon les règles Veyra.",
            PRIORITY:
              "Une demande de remboursement est NORMAL — même si le client est en colère.",
          },
        },
      },
    ],
    hints: [
      {
        level: 1,
        title: "Compris ≠ utilisable",
        body: "MILDRED a compris la tâche. L’application suivante n’a pas compris sa réponse.",
      },
      {
        level: 2,
        title: "Place les valeurs",
        body: "Indique précisément à MILDRED où chaque valeur doit apparaître.",
      },
      {
        level: 3,
        title: "Prévisible",
        body: "Arrête de demander une bonne réponse. Demande une réponse prévisible.",
        fromMira: true,
      },
    ],
    concepts: [
      {
        id: "field",
        label: "FIELD",
        explanation: "Une information nommée.",
      },
      {
        id: "value",
        label: "VALUE",
        explanation: "L’information stockée dans un champ.",
      },
      {
        id: "structure",
        label: "STRUCTURE",
        explanation: "L’organisation prévisible de l’information.",
      },
      {
        id: "parsing",
        label: "PARSING",
        explanation:
          "Lire une information structurée pour qu’un logiciel puisse l’utiliser.",
      },
    ],
    completion: {
      miraLines: mira,
      systemBefore:
        "Le client semble contrarié et cette demande a l’air urgente...",
      systemAfter: "SENTIMENT: NEGATIVE\nPRIORITY: URGENT",
      capabilityUnlocked: {
        id: "structured-output",
        label: "Structured Output",
        status: "ONLINE",
      },
      lessonHeadline:
        "Quand un autre programme doit utiliser la réponse d’une IA, le format compte autant que la réponse.",
      lessonBody: [
        "Une structure prévisible permet au logiciel de trouver automatiquement l’information dont il a besoin.",
        "Lisible pour un humain n’est pas la même chose qu’utilisable pour le service suivant.",
      ],
      skillUnlocked: {
        skillName: "Structurer les réponses d’une IA",
        formalSkillName: "Structured Output",
        skillCategory: "Structured Output",
        level: 1,
        description:
          "Tu peux faire renvoyer à un modèle de langage des champs prévisibles qu’un autre programme peut utiliser.",
      },
      technicalTerms: [
        {
          id: "field",
          label: "FIELD",
          explanation: "Une information nommée.",
        },
        {
          id: "value",
          label: "VALUE",
          explanation: "L’information stockée dans un champ.",
        },
        {
          id: "structure",
          label: "STRUCTURE",
          explanation: "L’organisation prévisible de l’information.",
        },
        {
          id: "parsing",
          label: "PARSING",
          explanation:
            "Lire une information structurée pour qu’un logiciel puisse l’utiliser.",
        },
      ],
    },
  };
}
