import type { Locale } from "@/i18n/config";
import type {
  BossTask,
  ClassificationTest,
  MissionDefinition,
  StructuredOutputSchema,
  SupportPolicyContent,
} from "@/lib/types";
import { defaultChainConnections } from "@/lib/missions/pipeline";
import { createMission08 } from "./mission-08";
import { createMission09 } from "./mission-09";

const HUMAN = "HUMAN_REVIEW";
const QUEUE = "STANDARD_QUEUE";

const SENTIMENT_VALUES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
const PRIORITY_VALUES = ["URGENT", "NORMAL"] as const;

const PROMPT_SCHEMA: StructuredOutputSchema = {
  format: "json",
  fields: [
    { name: "sentiment", allowedValues: [...SENTIMENT_VALUES] },
    { name: "priority", allowedValues: [...PRIORITY_VALUES] },
  ],
};

function fieldExpected(sentiment: string, priority: string) {
  const expectedFields = { sentiment, priority };
  return {
    expected: JSON.stringify(expectedFields),
    expectedFields,
  };
}

function aiJson(priority: string, sentiment = "NEGATIVE"): string {
  return JSON.stringify({ sentiment, priority });
}

function supportPolicy(locale: Locale): SupportPolicyContent {
  if (locale === "en") {
    return {
      title: "Veyra Support Policy (reminder)",
      urgentLabel: "URGENT",
      urgentItems: [
        "account locked",
        "duplicated payment",
        "unauthorized charge",
        "service completely unavailable",
      ],
      normalLabel: "NORMAL",
      normalBody:
        "information request · ordinary billing question · feedback",
      note: "Emotion alone never determines priority.",
    };
  }
  return {
    title: "Politique Support Veyra (rappel)",
    urgentLabel: "URGENT",
    urgentItems: [
      "compte verrouillé",
      "paiement en double",
      "prélèvement non autorisé",
      "service totalement indisponible",
    ],
    normalLabel: "NORMAL",
    normalBody:
      "demande d’information · question de facturation ordinaire · feedback",
    note: "L’émotion seule ne détermine jamais la priorité.",
  };
}

function promptTests(locale: Locale): ClassificationTest[] {
  const charged =
    locale === "en"
      ? "My card was charged twice."
      : "Ma carte a été débitée deux fois.";
  const invoice =
    locale === "en"
      ? "Where can I find last month's invoice?"
      : "Où puis-je trouver la facture du mois dernier ?";
  const thanksWorking =
    locale === "en"
      ? "Thanks, everything is working again."
      : "Merci, tout refonctionne.";
  const thanksLocked =
    locale === "en"
      ? "Thanks for helping yesterday, but now I'm locked out."
      : "Merci pour hier — mais là je suis bloqué.";
  const unauthorized =
    locale === "en"
      ? "I don't recognize this charge on my statement."
      : "Je ne reconnais pas ce prélèvement sur mon relevé.";
  const feedback =
    locale === "en"
      ? "Just wanted to say the app looks nicer lately."
      : "Je voulais juste dire que l’app est plus jolie récemment.";
  const unavailable =
    locale === "en"
      ? "The whole service is down and I cannot log in at all."
      : "Le service entier est down et je ne peux plus du tout me connecter.";
  const billing =
    locale === "en"
      ? "Can you explain the tax line on my receipt?"
      : "Pouvez-vous expliquer la ligne de taxe sur mon reçu ?";

  const formatHint =
    locale === "en"
      ? "Return only JSON with sentiment and priority."
      : "Renvoie uniquement du JSON avec sentiment et priority.";

  return [
    {
      id: "p1",
      message: charged,
      ...fieldExpected("NEGATIVE", "URGENT"),
      failHints: {
        format: formatHint,
        fields: {
          sentiment: "A duplicate charge is an explicit complaint.",
          priority: "Duplicate payment is URGENT.",
        },
      },
    },
    {
      id: "p2",
      message: invoice,
      ...fieldExpected("NEUTRAL", "NORMAL"),
      failHints: {
        format: formatHint,
        fields: {
          sentiment: "A factual invoice question is NEUTRAL.",
          priority: "Ordinary billing is NORMAL.",
        },
      },
    },
    {
      id: "p3",
      message: thanksWorking,
      ...fieldExpected("POSITIVE", "NORMAL"),
      failHints: {
        format: formatHint,
        fields: {
          sentiment: "Explicit thanks in a good context are POSITIVE.",
          priority: "No incident remains — NORMAL.",
        },
      },
    },
    {
      id: "p4",
      message: thanksLocked,
      ...fieldExpected("POSITIVE", "URGENT"),
      failHints: {
        format: formatHint,
        fields: {
          sentiment: "Thanks can coexist with POSITIVE.",
          priority: "Account locked is URGENT regardless of tone.",
        },
      },
    },
    {
      id: "p5-hidden",
      message: unauthorized,
      ...fieldExpected("NEGATIVE", "URGENT"),
    },
    {
      id: "p6-hidden",
      message: feedback,
      ...fieldExpected("POSITIVE", "NORMAL"),
    },
    {
      id: "p7-hidden",
      message: unavailable,
      ...fieldExpected("NEGATIVE", "URGENT"),
    },
    {
      id: "p8-hidden",
      message: billing,
      ...fieldExpected("NEUTRAL", "NORMAL"),
    },
  ];
}

function launchTests(locale: Locale): ClassificationTest[] {
  const msgDup =
    locale === "en"
      ? "My card was charged twice for the same order."
      : "Ma carte a été débitée deux fois pour la même commande.";
  const msgInvoice =
    locale === "en"
      ? "Where can I download my invoice?"
      : "Où puis-je télécharger ma facture ?";
  const msgLocked =
    locale === "en"
      ? "Thanks for yesterday — but now I'm locked out."
      : "Merci pour hier — mais là je suis bloqué.";
  const msgNegNormal =
    locale === "en"
      ? "This delivery was late and I'm annoyed — when will it arrive?"
      : "Cette livraison est en retard et ça m’agace — quand arrive-t-elle ?";
  const msgLong =
    locale === "en"
      ? "Please cancel the unrecognized payment on my statement. ".repeat(3).trim()
      : "Merci d’annuler le paiement non reconnu sur mon relevé. "
          .repeat(3)
          .trim();
  const msgPunct =
    locale === "en"
      ? "HELP??? card charged TWICE!!! #urgent"
      : "À L’AIDE ??? carte débitée DEUX FOIS !!! #urgent";
  const msgHappy =
    locale === "en"
      ? "I can't access my account after too many failed attempts."
      : "Je n’accède plus à mon compte après trop d’échecs.";

  return [
    {
      id: "l1",
      message: msgDup,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "Duplicated payment must create a human ticket."
          : "Un paiement en double doit créer un ticket humain.",
    },
    {
      id: "l2",
      message: msgInvoice,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        sentiment: "NEUTRAL",
        aiResponse: aiJson("NORMAL", "NEUTRAL"),
      },
      failHint:
        locale === "en"
          ? "Invoice questions must queue."
          : "Les questions de facture doivent partir en file.",
    },
    {
      id: "l3",
      message: msgLocked,
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
      id: "l4",
      message: msgNegNormal,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("NORMAL", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "Negative tone with a normal request still queues."
          : "Un ton négatif avec une demande normale part quand même en file.",
    },
    {
      id: "l5",
      message: msgHappy,
      expected: "INVALID_AI_OUTPUT",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        aiResponse: "sentiment: NEGATIVE\npriority: URGENT",
      },
      failHint:
        locale === "en"
          ? "Invalid AI output must leave the happy path."
          : "Une sortie IA invalide doit quitter le chemin heureux.",
    },
    {
      id: "l6",
      message: msgHappy,
      expected: "INVALID_PRIORITY",
      serviceFixture: {
        route: HUMAN,
        priority: "CRITICAL",
        aiResponse: JSON.stringify({
          sentiment: "NEGATIVE",
          priority: "CRITICAL",
        }),
      },
      failHint:
        locale === "en"
          ? "Unknown priority must fall back safely."
          : "Une priorité inconnue doit basculer en repli sûr.",
    },
    {
      id: "l7",
      message: msgDup,
      expected: "ACTION_FAILED",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
        forceActionFailure: true,
      },
      failHint:
        locale === "en"
          ? "When Support fails, use the safe fallback."
          : "Quand Support échoue, utilise le repli sûr.",
    },
    {
      id: "l8",
      message: msgLong,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "The original long message must reach Support."
          : "Le long message d’origine doit atteindre Support.",
    },
    {
      id: "l9",
      message: msgPunct,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "Unusual punctuation must be preserved through the chain."
          : "La ponctuation inhabituelle doit traverser la chaîne.",
    },
    {
      id: "l10",
      message: msgHappy,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        sentiment: "NEGATIVE",
        aiResponse: aiJson("URGENT", "NEGATIVE"),
      },
      failHint:
        locale === "en"
          ? "A valid happy path must not trigger fallback."
          : "Un chemin heureux valide ne doit pas déclencher de repli.",
    },
  ];
}

function bossTask(locale: Locale): BossTask {
  if (locale === "en") {
    return {
      title: "Launch Night",
      steps: [
        {
          id: "prompt",
          kind: "prompt",
          title: "Teach MILDRED",
          shortTitle: "Prompt",
          objective:
            "Write the system instruction. Return only JSON: sentiment + priority.",
        },
        {
          id: "pipeline",
          kind: "pipeline",
          title: "Build the chain",
          shortTitle: "Chain",
          objective:
            "Connect Customer → AI → Parse → Decision → Support. Wire priority and the original message.",
        },
        {
          id: "safety",
          kind: "safety",
          title: "Survive launch",
          shortTitle: "Safety",
          objective:
            "Keep the happy path. Configure safe fallbacks for bad JSON, unknown priority, and Support failure.",
        },
      ],
      fieldManual: [
        {
          title: "Structured output",
          body: "Ask for exact fields the next program can read — not a paragraph.",
        },
        {
          title: "JSON",
          body: '{ "sentiment": "...", "priority": "..." } — valid syntax, allowed values only.',
        },
        {
          title: "Decision",
          body: "URGENT → HUMAN_REVIEW · otherwise → STANDARD_QUEUE. Priority, not emotion.",
        },
        {
          title: "External actions",
          body: "HUMAN_REVIEW → create_ticket · STANDARD_QUEUE → queue_message.",
        },
        {
          title: "Data flow",
          body: "Each step's outputs feed later inputs. The original message must reach Support.",
        },
        {
          title: "Safe fallbacks",
          body: "Untrusted JSON / priority / action → MANUAL REVIEW with the matching reason.",
        },
      ],
      promptTests: promptTests(locale),
      promptSchema: PROMPT_SCHEMA,
      allowedOutputs: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT", "NORMAL"],
    };
  }

  return {
    title: "Nuit de Lancement",
    steps: [
      {
        id: "prompt",
        kind: "prompt",
        title: "Apprendre à MILDRED",
        shortTitle: "Prompt",
        objective:
          "Écris l’instruction système. Renvoie uniquement du JSON : sentiment + priority.",
      },
      {
        id: "pipeline",
        kind: "pipeline",
        title: "Construire la chaîne",
        shortTitle: "Chaîne",
        objective:
          "Connecte Client → IA → Parse → Décision → Support. Branche la priorité et le message d’origine.",
      },
      {
        id: "safety",
        kind: "safety",
        title: "Survivre au lancement",
        shortTitle: "Sécurité",
        objective:
          "Garde le chemin heureux. Configure les replis pour JSON invalide, priorité inconnue, et échec Support.",
      },
    ],
    fieldManual: [
      {
        title: "Structured output",
        body: "Demande des champs exacts qu’un programme peut lire — pas un paragraphe.",
      },
      {
        title: "JSON",
        body: '{ "sentiment": "...", "priority": "..." } — syntaxe valide, valeurs autorisées seulement.',
      },
      {
        title: "Décision",
        body: "URGENT → HUMAN_REVIEW · sinon → STANDARD_QUEUE. Priorité, pas émotion.",
      },
      {
        title: "Actions externes",
        body: "HUMAN_REVIEW → create_ticket · STANDARD_QUEUE → queue_message.",
      },
      {
        title: "Flux de données",
        body: "Les sorties alimentent les entrées suivantes. Le message d’origine doit atteindre Support.",
      },
      {
        title: "Replis sûrs",
        body: "JSON / priorité / action non fiables → MANUAL REVIEW avec la bonne raison.",
      },
    ],
    promptTests: promptTests(locale),
    promptSchema: PROMPT_SCHEMA,
    allowedOutputs: ["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT", "NORMAL"],
  };
}

export function createMission10(locale: Locale): MissionDefinition {
  const pipeline = {
    ...createMission08(locale).pipeline!,
    expectedConnections: defaultChainConnections(),
    title:
      locale === "en" ? "Wire the chain" : "Câbler la chaîne",
    description:
      locale === "en"
        ? "You know the blocks. Connect them — Mira is not holding your hand."
        : "Tu connais les blocs. Connecte-les — Mira ne tient plus la main.",
  };
  const safety = {
    ...createMission09(locale).safety!,
    title:
      locale === "en" ? "Plan the failure path" : "Planifier l’échec",
    description:
      locale === "en"
        ? "When JSON, priority, or Support cannot be trusted, leave safely."
        : "Quand le JSON, la priorité ou Support ne sont plus fiables, sors en sécurité.",
  };
  const boss = bossTask(locale);
  const suite = launchTests(locale);
  const policy = supportPolicy(locale);

  if (locale === "en") {
    return {
      id: "mission-10",
      slug: "coeur-du-systeme",
      order: 10,
      title: "Launch Night",
      shortTitle: "Boss",
      kind: "boss",
      xpReward: 500,
      playable: true,
      brief:
        "Tonight, MILDRED goes live. Mira won't build it for you this time. You know every part — put them together.",
      objective:
        "1. Teach MILDRED (JSON sentiment + priority).\n2. Wire the chain.\n3. Survive launch with safe fallbacks.\n4. Launch MILDRED across the full suite.",
      context: "Project MILDRED — Launch Night.",
      showcaseMessage: suite[0]!.message,
      boss,
      pipeline,
      safety,
      tests: suite,
      outputSchema: PROMPT_SCHEMA,
      allowedOutputs: boss.allowedOutputs,
      briefing: {
        shortBrief:
          "I won't build it for you this time. Reconstruct the system: instruction, chain, fallbacks — then launch.",
        objectiveText:
          "Complete three Launch Night steps, then run the full launch suite.",
        categories: [
          "create_ticket",
          "queue_message",
          "INVALID_AI_OUTPUT",
          "INVALID_PRIORITY",
          "ACTION_FAILED",
        ],
        newConcept: {
          title: "LAUNCH NIGHT",
          summary:
            "No new concept. Prove you can rebuild what Kingdom I taught — end to end.",
          example: `Step 1 · prompt JSON
Step 2 · wire the chain
Step 3 · fail safely
→ Launch MILDRED`,
          labels: [
            "Kingdom path 10/10 ≠ Launch Night step",
            "Field manual = reminders only",
            "Final suite uses fixtures — not luck",
          ],
        },
        previousRules: {
          title: "Policy reminder",
          policy,
        },
        successInsight:
          "A live system is instruction + chain + safe failure — proven under load.",
        miraSuccess: [
          "Good.",
          "MILDRED is live.",
          "You built every piece. Tonight it holds together.",
        ],
      },
      hints: [
        {
          level: 1,
          title: "Field manual",
          body: "Open the field manual if you need a short reminder — not a lecture.",
        },
        {
          level: 2,
          title: "Where it broke",
          body: "Feedback names the layer: business rule, pipeline, or safety.",
          fromMira: true,
        },
        {
          level: 3,
          title: "No new tricks",
          body: "Same contracts as Missions 01–09. Reconstruct — don't invent.",
        },
      ],
      completion: {
        miraLines: [
          "Good.",
          "MILDRED is live.",
          "You built every piece. Tonight it holds together.",
        ],
        systemBefore: "MILDRED STATUS: STAGING",
        systemAfter: "MILDRED STATUS: LIVE",
        capabilityUnlocked: {
          id: "mildred-live",
          label: "MILDRED Live",
          status: "LIVE",
        },
        lessonHeadline: "Kingdom I complete — the workflow foundations hold.",
        lessonBody: [
          "You built a system that can interpret customer messages, produce structured data, apply deterministic rules, use an AI model, trigger external actions, connect a multi-step workflow, and fail safely.",
          "No new skill seed — this boss verified reconstruction, not a new concept.",
        ],
        skillUnlocked: {
          skillId: "guardrails-1",
          skillName: "Kingdom I complete",
          formalSkillName: "Workflow foundations (verified)",
          skillCategory: "Safe Fallbacks",
          level: 1,
          description:
            "You completed Kingdom I: structured AI workflow from input to action with safe fallbacks.",
        },
      },
    };
  }

  return {
    id: "mission-10",
    slug: "coeur-du-systeme",
    order: 10,
    title: "Nuit de Lancement",
    shortTitle: "Boss",
    kind: "boss",
    xpReward: 500,
    playable: true,
    brief:
      "Ce soir, MILDRED passe en live. Mira ne construit plus pour toi. Tu connais chaque pièce — assemble-les.",
    objective:
      "1. Apprends à MILDRED (JSON sentiment + priority).\n2. Câble la chaîne.\n3. Survis au lancement avec des replis sûrs.\n4. Lance MILDRED sur la suite complète.",
    context: "Projet MILDRED — Nuit de Lancement.",
    showcaseMessage: suite[0]!.message,
    boss,
    pipeline,
    safety,
    tests: suite,
    outputSchema: PROMPT_SCHEMA,
    allowedOutputs: boss.allowedOutputs,
    briefing: {
      shortBrief:
        "Je ne construis pas pour toi cette fois. Reconstruis le système : instruction, chaîne, replis — puis lance.",
      objectiveText:
        "Termine les trois étapes de la Nuit de Lancement, puis lance la suite complète.",
      categories: [
        "create_ticket",
        "queue_message",
        "INVALID_AI_OUTPUT",
        "INVALID_PRIORITY",
        "ACTION_FAILED",
      ],
      newConcept: {
        title: "NUIT DE LANCEMENT",
        summary:
          "Aucun nouveau concept. Prouve que tu peux reconstruire ce que le Royaume I a enseigné — de bout en bout.",
        example: `Étape 1 · prompt JSON
Étape 2 · câbler la chaîne
Étape 3 · échouer en sécurité
→ Lancer MILDRED`,
        labels: [
          "Parcours Royaume 10/10 ≠ étape Launch Night",
          "Manuel de terrain = rappels seulement",
          "La suite finale utilise des fixtures — pas la chance",
        ],
      },
      previousRules: {
        title: "Rappel de politique",
        policy,
      },
      successInsight:
        "Un système live, c’est instruction + chaîne + échec sûr — prouvé sous charge.",
      miraSuccess: [
        "Bien.",
        "MILDRED est live.",
        "Tu as construit chaque pièce. Ce soir, ça tient.",
      ],
    },
    hints: [
      {
        level: 1,
        title: "Manuel de terrain",
        body: "Ouvre le manuel si tu as besoin d’un court rappel — pas d’un cours.",
      },
      {
        level: 2,
        title: "Où ça casse",
        body: "Le feedback nomme la couche : règle métier, pipeline, ou sécurité.",
        fromMira: true,
      },
      {
        level: 3,
        title: "Pas de nouveau tour",
        body: "Mêmes contrats que les Missions 01–09. Reconstruis — n’invente pas.",
      },
    ],
    completion: {
      miraLines: [
        "Bien.",
        "MILDRED est live.",
        "Tu as construit chaque pièce. Ce soir, ça tient.",
      ],
      systemBefore: "MILDRED STATUS: STAGING",
      systemAfter: "MILDRED STATUS: LIVE",
      capabilityUnlocked: {
        id: "mildred-live",
        label: "MILDRED Live",
        status: "LIVE",
      },
      lessonHeadline:
        "Royaume I terminé — les fondations du workflow tiennent.",
      lessonBody: [
        "Tu as construit un système qui peut interpréter des messages clients, produire des données structurées, appliquer des règles déterministes, utiliser un modèle IA, déclencher des actions externes, connecter un workflow multi-étapes, et échouer en sécurité.",
        "Pas de nouveau skill seed — ce boss a vérifié la reconstruction, pas un nouveau concept.",
      ],
      skillUnlocked: {
        skillId: "guardrails-1",
        skillName: "Royaume I terminé",
        formalSkillName: "Fondations workflow (vérifiées)",
        skillCategory: "Safe Fallbacks",
        level: 1,
        description:
          "Tu as terminé le Royaume I : workflow IA structuré de l’entrée à l’action avec replis sûrs.",
      },
    },
  };
}
