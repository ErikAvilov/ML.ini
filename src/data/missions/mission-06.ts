import type { Locale } from "@/i18n/config";
import type {
  AiIntegrationCodeFillTask,
  MissionDefinition,
} from "@/lib/types";

const TRUE_ROUTE = "HUMAN_REVIEW";
const FALSE_ROUTE = "STANDARD_QUEUE";
const COMPARE_VALUE = "URGENT";

const INSTRUCTION_EN = `Classify the customer message using the Veyra support policy.

Return only valid JSON with exactly:
- sentiment: POSITIVE, NEUTRAL or NEGATIVE
- priority: URGENT or NORMAL

URGENT:
- duplicate payment
- unauthorized or unrecognized payment
- account locked after repeated failed attempts
- suspected account or payment security issue

NORMAL:
- delivery delay
- refund request
- wrong product or wrong size
- forgotten password
- package marked delivered but missing
- general complaints

Emotion alone never determines priority.`;

const INSTRUCTION_FR = `Classe le message client selon la politique support Veyra.

Renvoie uniquement du JSON valide avec exactement :
- sentiment : POSITIVE, NEUTRAL ou NEGATIVE
- priority : URGENT ou NORMAL

URGENT :
- paiement en double
- paiement non autorisé ou non reconnu
- compte verrouillé après plusieurs échecs d’accès
- suspicion de problème de sécurité compte ou paiement

NORMAL :
- retard de livraison
- demande de remboursement
- mauvais produit ou mauvaise taille
- mot de passe oublié
- colis marqué livré mais introuvable
- plaintes générales

L’émotion seule ne détermine jamais la priorité.`;

function providedInstruction(locale: Locale): string {
  return locale === "en" ? INSTRUCTION_EN : INSTRUCTION_FR;
}

function codeFillTask(locale: Locale): AiIntegrationCodeFillTask {
  const instruction = providedInstruction(locale);
  const segment0 = `import json

instruction = """
${instruction}
"""

message = customer_message

response = ai.ask(`;
  const segment1 = `, `;
  const segment2 = `)

result = json.loads(response)

priority = result["`;
  const segment3 = `"]

if priority == "URGENT":
    route = "${TRUE_ROUTE}"
else:
    route = "${FALSE_ROUTE}"`;

  if (locale === "en") {
    return {
      mode: "ai-integration",
      title: "Wire the AI call",
      description:
        "Three blanks. Call the model with instruction and message, then read priority from the JSON response.",
      segments: [segment0, segment1, segment2, segment3],
      blanks: [
        { id: "instruction", placeholder: "instruction", expected: "instruction" },
        { id: "message", placeholder: "message", expected: "message" },
        {
          id: "priority",
          placeholder: "key",
          expected: "priority",
          stripQuotes: true,
        },
      ],
      providedInstruction: instruction,
      checkLabel: "Incomplete",
      passLabel: "Wired",
      trueRoute: TRUE_ROUTE,
      falseRoute: FALSE_ROUTE,
      compareValue: COMPARE_VALUE,
    };
  }

  return {
    mode: "ai-integration",
    title: "Brancher l’appel IA",
    description:
      "Trois trous. Appelle le modèle avec instruction et message, puis lis priority dans la réponse JSON.",
    segments: [segment0, segment1, segment2, segment3],
    blanks: [
      { id: "instruction", placeholder: "instruction", expected: "instruction" },
      { id: "message", placeholder: "message", expected: "message" },
      {
        id: "priority",
        placeholder: "clé",
        expected: "priority",
        stripQuotes: true,
      },
    ],
    providedInstruction: instruction,
    checkLabel: "Incomplet",
    passLabel: "Branché",
    trueRoute: TRUE_ROUTE,
    falseRoute: FALSE_ROUTE,
    compareValue: COMPARE_VALUE,
  };
}

function miraSuccess(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "You called the model from code, read the JSON, and let the program decide.",
      "That's the real pipeline.",
    ];
  }
  return [
    "Bien.",
    "Tu as appelé le modèle depuis le code, lu le JSON, et laissé le programme décider.",
    "C’est le vrai pipeline.",
  ];
}

function routeExpected(priority: "URGENT" | "NORMAL") {
  return priority === "URGENT" ? TRUE_ROUTE : FALSE_ROUTE;
}

export function createMission06(locale: Locale): MissionDefinition {
  const codeFill = codeFillTask(locale);
  const mira = miraSuccess(locale);

  const tests =
    locale === "en"
      ? [
          {
            id: "t1",
            message: "My card was charged twice for the same order.",
            expected: routeExpected("URGENT"),
            failHint: "Duplicate payment must end as HUMAN_REVIEW.",
            failHints: {
              format: "The model must return valid JSON the program can parse.",
              fields: {
                priority: "A duplicate payment is URGENT → HUMAN_REVIEW.",
              },
            },
          },
          {
            id: "t2",
            message:
              "Thanks, the replacement arrived today and everything works perfectly.",
            expected: routeExpected("NORMAL"),
            failHint: "A resolved replacement stays on STANDARD_QUEUE.",
            failHints: {
              format: "The model must return valid JSON the program can parse.",
              fields: {
                priority: "No payment/security incident → NORMAL → STANDARD_QUEUE.",
              },
            },
          },
          {
            id: "t3",
            message: "I forgot my password. How can I reset it?",
            expected: routeExpected("NORMAL"),
            failHint: "Forgotten password is NORMAL → STANDARD_QUEUE.",
            failHints: {
              format: "The model must return valid JSON the program can parse.",
              fields: {
                priority: "Forgotten password is NORMAL under Veyra policy.",
              },
            },
          },
          {
            id: "t4",
            message: "I don't recognize this payment on my account.",
            expected: routeExpected("URGENT"),
            failHint: "Unrecognized payment must go to HUMAN_REVIEW.",
            failHints: {
              format: "The model must return valid JSON the program can parse.",
              fields: {
                priority:
                  "Unrecognized / unauthorized payment is URGENT → HUMAN_REVIEW.",
              },
            },
          },
          {
            id: "t5-hidden",
            message: "Can you tell me when order #4812 should arrive?",
            expected: routeExpected("NORMAL"),
            failHint: "A delivery timing question stays on STANDARD_QUEUE.",
            failHints: {
              format: "The model must return valid JSON the program can parse.",
              fields: {
                priority: "Delivery timing is NORMAL → STANDARD_QUEUE.",
              },
            },
          },
        ]
      : [
          {
            id: "t1",
            message: "Ma carte a été débitée deux fois pour la même commande.",
            expected: routeExpected("URGENT"),
            failHint: "Un paiement en double doit finir en HUMAN_REVIEW.",
            failHints: {
              format: "Le modèle doit renvoyer du JSON valide que le programme peut parser.",
              fields: {
                priority: "Un paiement en double est URGENT → HUMAN_REVIEW.",
              },
            },
          },
          {
            id: "t2",
            message:
              "Merci, le remplacement est arrivé aujourd’hui et tout fonctionne parfaitement.",
            expected: routeExpected("NORMAL"),
            failHint: "Un remplacement résolu reste sur STANDARD_QUEUE.",
            failHints: {
              format: "Le modèle doit renvoyer du JSON valide que le programme peut parser.",
              fields: {
                priority:
                  "Pas d’incident paiement/sécurité → NORMAL → STANDARD_QUEUE.",
              },
            },
          },
          {
            id: "t3",
            message: "J’ai oublié mon mot de passe. Comment le réinitialiser ?",
            expected: routeExpected("NORMAL"),
            failHint: "Mot de passe oublié = NORMAL → STANDARD_QUEUE.",
            failHints: {
              format: "Le modèle doit renvoyer du JSON valide que le programme peut parser.",
              fields: {
                priority: "Mot de passe oublié = NORMAL selon la politique Veyra.",
              },
            },
          },
          {
            id: "t4",
            message: "Je ne reconnais pas ce paiement sur mon compte.",
            expected: routeExpected("URGENT"),
            failHint: "Paiement non reconnu → HUMAN_REVIEW.",
            failHints: {
              format: "Le modèle doit renvoyer du JSON valide que le programme peut parser.",
              fields: {
                priority:
                  "Paiement non reconnu / non autorisé = URGENT → HUMAN_REVIEW.",
              },
            },
          },
          {
            id: "t5-hidden",
            message: "Vous pouvez me dire quand la commande #4812 devrait arriver ?",
            expected: routeExpected("NORMAL"),
            failHint: "Une question de délai reste sur STANDARD_QUEUE.",
            failHints: {
              format: "Le modèle doit renvoyer du JSON valide que le programme peut parser.",
              fields: {
                priority: "Délai de livraison = NORMAL → STANDARD_QUEUE.",
              },
            },
          },
        ];

  if (locale === "en") {
    return {
      id: "mission-06",
      slug: "bring-it-to-life",
      order: 6,
      title: "Bring It to Life",
      shortTitle: "Bring Alive",
      kind: "standard",
      xpReward: 220,
      playable: true,
      brief:
        "Until now, MILDRED's result was already in your program. This time, call the model for real.",
      objective: `1. Call the model with instruction and message.\n2. Turn its JSON response into usable data.\n3. Read priority.\n4. Let the program choose the route.`,
      context: "Project MILDRED — live model call.",
      showcaseMessage: "My card was charged twice for the same order.",
      codeFill,
      tests,
      briefing: {
        shortBrief:
          "Until now, MILDRED's result was already in your program. This time, call the model for real. Send it the instruction and the message, then use its response.",
        objectiveText: `1. Call the model with \`instruction\` and \`message\`.\n2. Turn its JSON response into usable data.\n3. Read \`priority\`.\n4. Let the program choose the right route.`,
        categories: [TRUE_ROUTE, FALSE_ROUTE],
        newConcept: {
          title: "Call → parse → decide",
          summary:
            "Code calls the model → receives a response → parses JSON → reads a value → branches.",
          example: `ai.ask(instruction, message)
  →  '{"priority":"URGENT",...}'
  →  result["priority"]
  →  HUMAN_REVIEW`,
          labels: [
            "ai.ask(…) — calls the model from code",
            "json.loads — turns text into data",
            'result["priority"] — reads one field',
            "if / else — chooses the route",
          ],
        },
        optionalTheory: {
          title: "Not another prompting drill",
          body: [
            "The instruction is already provided — you already know what MILDRED should do.",
            "This mission is about wiring the call and using the structured response.",
          ],
        },
        successInsight:
          "An AI call only matters when code can parse the answer and act on it.",
        miraSuccess: mira,
      },
      hints: [
        {
          level: 1,
          title: "Pass the variables",
          body: "ai.ask needs the instruction variable, then the message variable — in that order.",
        },
        {
          level: 2,
          title: "Read the key",
          body: 'After json.loads, pull priority with result["priority"].',
          aiAssisted: true,
        },
        {
          level: 3,
          title: "All three blanks",
          body: 'ai.ask(instruction, message) · result["priority"]',
        },
      ],
      concepts: [
        {
          id: "ai-ask",
          label: "ai.ask",
          explanation: "A beginner-friendly helper that calls the model with an instruction and a message.",
        },
        {
          id: "response",
          label: "response",
          explanation: "The raw text returned by the model.",
        },
        {
          id: "json-loads",
          label: "json.loads",
          explanation: "Parses a JSON string into a usable object.",
        },
      ],
      completion: {
        miraLines: mira,
        systemBefore:
          "MILDRED could classify and decide — but only when the result was already injected into the program.",
        systemAfter:
          "The program calls the model, parses JSON, reads priority, and routes the work.",
        capabilityUnlocked: {
          id: "ai-integration",
          label: "AI Integration",
          status: "ONLINE",
        },
        lessonHeadline:
          "Calling a model from code only matters if you can use the answer.",
        lessonBody: [
          "ai.ask(instruction, message) sends work to the model.",
          "json.loads turns the response into data; reading priority lets if/else choose HUMAN_REVIEW or STANDARD_QUEUE.",
        ],
        skillUnlocked: {
          skillId: "ai-integration-i",
          skillName: "Calling an AI from Code",
          formalSkillName: "AI Integration I",
          skillCategory: "AI Integration",
          level: 1,
          description:
            "You can call a model from a program and use its structured response in the rest of the pipeline.",
        },
        technicalTerms: [
          {
            id: "function-call",
            label: "function call",
            explanation: "Running a named operation with arguments — here, ai.ask.",
          },
          {
            id: "argument",
            label: "argument",
            explanation: "A value passed into a function — instruction and message.",
          },
          {
            id: "parse",
            label: "parse",
            explanation: "Turn a text response into structured data.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-06",
    slug: "bring-it-to-life",
    order: 6,
    title: "Lui Donner Vie",
    shortTitle: "Vie",
    kind: "standard",
    xpReward: 220,
    playable: true,
    brief:
      "Jusqu’ici, le résultat de MILDRED était déjà présent dans ton programme. Cette fois, fais réellement appel au modèle.",
    objective: `1. Appelle le modèle avec instruction et message.\n2. Transforme sa réponse JSON en données utilisables.\n3. Récupère priority.\n4. Laisse le programme choisir la bonne route.`,
    context: "Projet MILDRED — appel modèle en direct.",
    showcaseMessage: "Ma carte a été débitée deux fois pour la même commande.",
    codeFill,
    tests,
    briefing: {
      shortBrief:
        "Jusqu’ici, le résultat de MILDRED était déjà présent dans ton programme. Cette fois, fais réellement appel au modèle. Envoie-lui l’instruction et le message, puis utilise sa réponse.",
      objectiveText: `1. Appelle le modèle avec \`instruction\` et \`message\`.\n2. Transforme sa réponse JSON en données utilisables.\n3. Récupère \`priority\`.\n4. Laisse le programme choisir la bonne route.`,
      categories: [TRUE_ROUTE, FALSE_ROUTE],
      newConcept: {
        title: "Appeler → parser → décider",
        summary:
          "Le code appelle le modèle → reçoit une réponse → parse le JSON → lit une valeur → bifurque.",
        example: `ai.ask(instruction, message)
  →  '{"priority":"URGENT",...}'
  →  result["priority"]
  →  HUMAN_REVIEW`,
        labels: [
          "ai.ask(…) — appelle le modèle depuis le code",
          "json.loads — transforme le texte en données",
          'result["priority"] — lit un champ',
          "if / else — choisit la route",
        ],
      },
      optionalTheory: {
        title: "Pas un nouvel exercice de prompt",
        body: [
          "L’instruction est déjà fournie — tu sais déjà ce que MILDRED doit faire.",
          "Ici, l’enjeu est de brancher l’appel et d’utiliser la réponse structurée.",
        ],
      },
      successInsight:
        "Un appel IA ne compte que si le code peut parser la réponse et agir.",
      miraSuccess: mira,
    },
    hints: [
      {
        level: 1,
        title: "Passe les variables",
        body: "ai.ask attend la variable instruction, puis la variable message — dans cet ordre.",
      },
      {
        level: 2,
        title: "Lis la clé",
        body: 'Après json.loads, récupère priority avec result["priority"].',
        aiAssisted: true,
      },
      {
        level: 3,
        title: "Les trois trous",
        body: 'ai.ask(instruction, message) · result["priority"]',
      },
    ],
    concepts: [
      {
        id: "ai-ask",
        label: "ai.ask",
        explanation:
          "Un helper débutant qui appelle le modèle avec une instruction et un message.",
      },
      {
        id: "response",
        label: "response",
        explanation: "Le texte brut renvoyé par le modèle.",
      },
      {
        id: "json-loads",
        label: "json.loads",
        explanation: "Transforme une chaîne JSON en objet utilisable.",
      },
    ],
    completion: {
      miraLines: mira,
      systemBefore:
        "MILDRED savait classer et décider — mais seulement quand le résultat était déjà injecté dans le programme.",
      systemAfter:
        "Le programme appelle le modèle, parse le JSON, lit priority, et aiguille le travail.",
      capabilityUnlocked: {
        id: "ai-integration",
        label: "AI Integration",
        status: "ONLINE",
      },
      lessonHeadline:
        "Appeler un modèle depuis du code ne compte que si tu utilises la réponse.",
      lessonBody: [
        "ai.ask(instruction, message) envoie le travail au modèle.",
        "json.loads transforme la réponse en données ; lire priority laisse if/else choisir HUMAN_REVIEW ou STANDARD_QUEUE.",
      ],
      skillUnlocked: {
        skillId: "ai-integration-i",
        skillName: "Appeler une IA depuis du code",
        formalSkillName: "AI Integration I",
        skillCategory: "AI Integration",
        level: 1,
        description:
          "Tu sais appeler un modèle depuis un programme et utiliser sa réponse structurée dans la suite du traitement.",
      },
      technicalTerms: [
        {
          id: "function-call",
          label: "appel de fonction",
          explanation: "Exécuter une opération nommée avec des arguments — ici, ai.ask.",
        },
        {
          id: "argument",
          label: "argument",
          explanation: "Une valeur passée à une fonction — instruction et message.",
        },
        {
          id: "parse",
          label: "parser",
          explanation: "Transformer une réponse texte en données structurées.",
        },
      ],
    },
  };
}
