import type { Locale } from "@/i18n/config";
import type { CodeFillTask, MissionDefinition } from "@/lib/types";

const TRUE_ROUTE = "HUMAN_REVIEW";
const FALSE_ROUTE = "STANDARD_QUEUE";
const COMPARE_VALUE = "URGENT";
const EXPECTED_KEY = "priority";

function codeFillTask(locale: Locale): CodeFillTask {
  const prefix = `result = {
    "sentiment": "NEGATIVE",
    "priority": "URGENT"
}

priority = result["`;
  const middle = `"]

if `;
  const suffix = `:
    route = "${TRUE_ROUTE}"
else:
    route = "${FALSE_ROUTE}"`;

  if (locale === "en") {
    return {
      title: "Decision code",
      description:
        "Two blanks. First read the priority from the JSON. Then compare it to choose the route.",
      prefix,
      middle,
      suffix,
      keyPlaceholder: "key",
      conditionPlaceholder: 'priority == "…"',
      expectedKey: EXPECTED_KEY,
      checkLabel: "Incomplete",
      passLabel: "Ready",
      trueRoute: TRUE_ROUTE,
      falseRoute: FALSE_ROUTE,
      compareVariable: "priority",
      compareValue: COMPARE_VALUE,
    };
  }

  return {
    title: "Code de décision",
    description:
      "Deux trous. D’abord récupère priority depuis le JSON. Puis compare-la pour choisir la route.",
    prefix,
    middle,
    suffix,
    keyPlaceholder: "clé",
    conditionPlaceholder: 'priority == "…"',
    expectedKey: EXPECTED_KEY,
    checkLabel: "Incomplet",
    passLabel: "Prêt",
    trueRoute: TRUE_ROUTE,
    falseRoute: FALSE_ROUTE,
    compareVariable: "priority",
    compareValue: COMPARE_VALUE,
  };
}

function miraSuccess(locale: Locale): string[] {
  if (locale === "en") {
    return [
      "Good.",
      "You read a value from JSON, then branched on it.",
      "That's how software uses structured data.",
    ];
  }
  return [
    "Bien.",
    "Tu as lu une valeur dans le JSON, puis bifurqué dessus.",
    "C’est comme ça qu’un programme utilise des données structurées.",
  ];
}

export function createMission05(locale: Locale): MissionDefinition {
  const codeFill = codeFillTask(locale);
  const tests = [
    {
      id: "urgent-negative",
      message: 'priority = "URGENT"',
      expected: TRUE_ROUTE,
      failHint:
        locale === "en"
          ? "URGENT must go to human review."
          : "URGENT doit aller en revue humaine.",
    },
    {
      id: "normal-positive",
      message: 'priority = "NORMAL"',
      expected: FALSE_ROUTE,
      failHint:
        locale === "en"
          ? "NORMAL stays on the standard queue."
          : "NORMAL reste sur la file standard.",
    },
    {
      id: "normal-negative",
      message:
        locale === "en"
          ? 'priority = "NORMAL" (complaint)'
          : 'priority = "NORMAL" (plainte)',
      expected: FALSE_ROUTE,
      failHint:
        locale === "en"
          ? "Emotion is not the fork — priority is."
          : "L’émotion n’est pas la bifurcation — la priorité l’est.",
    },
    {
      id: "urgent-neutral",
      message:
        locale === "en"
          ? 'priority = "URGENT" (locked account)'
          : 'priority = "URGENT" (compte verrouillé)',
      expected: TRUE_ROUTE,
      failHint:
        locale === "en"
          ? "If priority is URGENT, route must be HUMAN_REVIEW."
          : "Si priority vaut URGENT, la route doit être HUMAN_REVIEW.",
    },
  ];

  if (locale === "en") {
    return {
      id: "mission-05",
      slug: "the-fork",
      order: 5,
      title: "The Fork",
      shortTitle: "The Fork",
      kind: "standard",
      xpReward: 180,
      playable: true,
      brief:
        "MILDRED now produces clean data. Teach the program how to use it.",
      objective: `1. Read priority from the JSON.\n2. If it is "URGENT" → ${TRUE_ROUTE}.\n3. Otherwise → ${FALSE_ROUTE}.`,
      context: "Project MILDRED — decision layer.",
      showcaseMessage: 'priority = "URGENT"',
      codeFill,
      tests,
      briefing: {
        shortBrief:
          "MILDRED can now produce clean data. What's left is teaching the program how to use it. Start by reading the priority, then use it to pick the right route.",
        objectiveText: `1. Read the priority value from the data.\n2. If it is "URGENT", send to ${TRUE_ROUTE}.\n3. Otherwise, send to ${FALSE_ROUTE}.`,
        categories: [TRUE_ROUTE, FALSE_ROUTE],
        newConcept: {
          title: "From JSON to a decision",
          summary:
            "JSON data → read a value → store it → compare it → choose a route.",
          example: `{ "priority": "URGENT" }
  →  result["priority"]
  →  "URGENT"
  →  priority == "URGENT"
  →  TRUE  →  ${TRUE_ROUTE}`,
          labels: [
            'result["priority"] — reads the value for that key',
            "priority = … — stores it in a variable",
            'priority == "URGENT" — asks a yes/no question',
            "if / else — picks the branch",
          ],
        },
        optionalTheory: {
          title: "From Mission 04",
          body: [
            "MILDRED returns a JSON object with named values.",
            "This mission uses that object to make a program decision.",
          ],
        },
        successInsight:
          "Structured data matters because code can read it and branch on it.",
        miraSuccess: miraSuccess("en"),
      },
      hints: [
        {
          level: 1,
          title: "Read the key",
          body: 'The first blank is the key name inside the brackets — the same word that appears in the JSON: priority.',
        },
        {
          level: 2,
          title: "Then compare",
          body: 'After priority holds the value, check whether it equals the string URGENT with ==.',
          aiAssisted: true,
        },
        {
          level: 3,
          title: "Both blanks",
          body: 'Key blank: priority · Condition blank: priority == "URGENT"',
        },
      ],
      concepts: [
        {
          id: "access",
          label: 'result["key"]',
          explanation: "Reads one named value out of a JSON-like object.",
        },
        {
          id: "variable",
          label: "variable",
          explanation: "Stores that value so the rest of the code can use it.",
        },
        {
          id: "if",
          label: "if",
          explanation: "Runs a block when its condition is true.",
        },
        {
          id: "eq",
          label: "==",
          explanation: "Compares two values for equality.",
        },
        {
          id: "else",
          label: "else",
          explanation: "Runs when the if condition is false.",
        },
      ],
      completion: {
        miraLines: miraSuccess("en"),
        systemBefore:
          "MILDRED produced structured JSON — but nothing inspected it to choose a path.",
        systemAfter: `The program reads priority from JSON and forks: ${TRUE_ROUTE} vs ${FALSE_ROUTE}.`,
        capabilityUnlocked: {
          id: "decision-logic",
          label: "Decision Logic",
          status: "ONLINE",
        },
        lessonHeadline:
          "JSON becomes useful when code can read a value and branch on it.",
        lessonBody: [
          "result[\"priority\"] pulls one field out of the structured payload.",
          "Storing it in a variable, comparing it, then using if / else is how software turns data into a decision.",
        ],
        skillUnlocked: {
          skillId: "logic-1",
          skillName: "Making Decisions with Code",
          formalSkillName: "Logic I",
          skillCategory: "Program Logic",
          level: 1,
          description:
            "You can read a value from structured data and write a simple condition that routes work.",
        },
        technicalTerms: [
          {
            id: "key-access",
            label: "key access",
            explanation: 'result["priority"] reads the value bound to that key.',
          },
          {
            id: "variable",
            label: "variable",
            explanation: "A named value the program can reuse — here, priority.",
          },
          {
            id: "condition",
            label: "condition",
            explanation: "An expression that is true or false.",
          },
          {
            id: "branch",
            label: "branch",
            explanation: "A different path after the condition.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-05",
    slug: "the-fork",
    order: 5,
    title: "La Bifurcation",
    shortTitle: "Bifurcation",
    kind: "standard",
    xpReward: 180,
    playable: true,
    brief:
      "MILDRED produit maintenant des données propres. Il reste à apprendre au programme à les utiliser.",
    objective: `1. Récupère priority depuis les données.\n2. Si elle vaut "URGENT" → ${TRUE_ROUTE}.\n3. Sinon → ${FALSE_ROUTE}.`,
    context: "Projet MILDRED — couche de décision.",
    showcaseMessage: 'priority = "URGENT"',
    codeFill,
    tests,
    briefing: {
      shortBrief:
        "MILDRED sait maintenant produire des données propres. Il reste à apprendre au programme à les utiliser. Commence par récupérer la priorité, puis utilise-la pour choisir la bonne route.",
      objectiveText: `1. Récupère la valeur priority depuis les données.\n2. Si elle vaut "URGENT", envoie vers ${TRUE_ROUTE}.\n3. Sinon, envoie vers ${FALSE_ROUTE}.`,
      categories: [TRUE_ROUTE, FALSE_ROUTE],
      newConcept: {
        title: "Du JSON à une décision",
        summary:
          "Données JSON → lire une valeur → la stocker → la comparer → choisir une route.",
        example: `{ "priority": "URGENT" }
  →  result["priority"]
  →  "URGENT"
  →  priority == "URGENT"
  →  TRUE  →  ${TRUE_ROUTE}`,
        labels: [
          'result["priority"] — lit la valeur de cette clé',
          "priority = … — la stocke dans une variable",
          'priority == "URGENT" — pose une question oui/non',
          "if / else — choisit la branche",
        ],
      },
      optionalTheory: {
        title: "Depuis la Mission 04",
        body: [
          "MILDRED renvoie un objet JSON avec des valeurs nommées.",
          "Cette mission utilise cet objet pour prendre une décision programme.",
        ],
      },
      successInsight:
        "Des données structurées servent quand le code peut les lire et bifurquer dessus.",
      miraSuccess: miraSuccess("fr"),
    },
    hints: [
      {
        level: 1,
        title: "Lis la clé",
        body: "Le premier trou est le nom de la clé entre crochets — le même mot que dans le JSON : priority.",
      },
      {
        level: 2,
        title: "Puis compare",
        body: 'Une fois priority remplie, vérifie si elle vaut la chaîne URGENT avec ==.',
        aiAssisted: true,
      },
      {
        level: 3,
        title: "Les deux trous",
        body: 'Trou clé : priority · Trou condition : priority == "URGENT"',
      },
    ],
    concepts: [
      {
        id: "access",
        label: 'result["clé"]',
        explanation: "Lit une valeur nommée dans un objet de type JSON.",
      },
      {
        id: "variable",
        label: "variable",
        explanation: "Stocke cette valeur pour la suite du code.",
      },
      {
        id: "if",
        label: "if",
        explanation: "Exécute un bloc lorsque sa condition est vraie.",
      },
      {
        id: "eq",
        label: "==",
        explanation: "Compare deux valeurs.",
      },
      {
        id: "else",
        label: "else",
        explanation: "S’exécute lorsque la condition est fausse.",
      },
    ],
    completion: {
      miraLines: miraSuccess("fr"),
      systemBefore:
        "MILDRED produisait du JSON structuré — mais rien ne l’inspectait pour choisir un chemin.",
      systemAfter: `Le programme lit priority dans le JSON et bifurque : ${TRUE_ROUTE} vs ${FALSE_ROUTE}.`,
      capabilityUnlocked: {
        id: "decision-logic",
        label: "Decision Logic",
        status: "ONLINE",
      },
      lessonHeadline:
        "Le JSON devient utile quand le code peut lire une valeur et bifurquer dessus.",
      lessonBody: [
        'result["priority"] extrait un champ du payload structuré.',
        "Le stocker dans une variable, le comparer, puis utiliser if / else : c’est ainsi qu’un logiciel transforme des données en décision.",
      ],
      skillUnlocked: {
        skillId: "logic-1",
        skillName: "Prendre des décisions avec du code",
        formalSkillName: "Logic I",
        skillCategory: "Logique programme",
        level: 1,
        description:
          "Tu peux lire une valeur dans des données structurées et écrire une condition simple qui aiguille le travail.",
      },
      technicalTerms: [
        {
          id: "key-access",
          label: "accès par clé",
          explanation:
            'result["priority"] lit la valeur associée à cette clé.',
        },
        {
          id: "variable",
          label: "variable",
          explanation: "Une valeur nommée réutilisable — ici, priority.",
        },
        {
          id: "condition",
          label: "condition",
          explanation: "Une expression vraie ou fausse.",
        },
        {
          id: "branch",
          label: "branche",
          explanation: "Un chemin différent après la condition.",
        },
      ],
    },
  };
}
