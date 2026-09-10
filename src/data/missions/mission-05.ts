import type { Locale } from "@/i18n/config";
import type { CodeFillTask, MissionDefinition } from "@/lib/types";

const TRUE_ROUTE = "HUMAN_REVIEW";
const FALSE_ROUTE = "STANDARD_QUEUE";
const COMPARE_VALUE = "URGENT";

function codeFillTask(locale: Locale): CodeFillTask {
  const prefix = `result = {
    "sentiment": "NEGATIVE",
    "priority": "URGENT"
}

priority = result["priority"]

if `;
  const suffix = `:
    route = "${TRUE_ROUTE}"
else:
    route = "${FALSE_ROUTE}"`;

  if (locale === "en") {
    return {
      title: "Decision code",
      description:
        "Complete the condition. The rest of the program is already written.",
      prefix,
      suffix,
      blankPlaceholder: "priority == …",
      checkLabel: "Condition incomplete",
      passLabel: "Condition ready",
      trueRoute: TRUE_ROUTE,
      falseRoute: FALSE_ROUTE,
      compareVariable: "priority",
      compareValue: COMPARE_VALUE,
    };
  }

  return {
    title: "Code de décision",
    description:
      "Complète la condition. Le reste du programme est déjà écrit.",
    prefix,
    suffix,
    blankPlaceholder: "priority == …",
    checkLabel: "Condition incomplète",
    passLabel: "Condition prête",
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
      "MILDRED's data finally branches the pipeline.",
      "That's a decision — not another label.",
    ];
  }
  return [
    "Bien.",
    "Les données de MILDRED font enfin bifurquer le pipeline.",
    "Ça, c’est une décision — pas une autre étiquette.",
  ];
}

export function createMission05(locale: Locale): MissionDefinition {
  const codeFill = codeFillTask(locale);
  const tests = [
    {
      id: "urgent-negative",
      message:
        locale === "en"
          ? 'priority = "URGENT"'
          : 'priority = "URGENT"',
      expected: TRUE_ROUTE,
      failHint:
        locale === "en"
          ? "URGENT must go to human review."
          : "URGENT doit aller en revue humaine.",
    },
    {
      id: "normal-positive",
      message:
        locale === "en"
          ? 'priority = "NORMAL"'
          : 'priority = "NORMAL"',
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
        "MILDRED can flag urgent requests. Useless if they land in the same queue as everything else. Make the system decide.",
      objective: `If priority is "URGENT" → ${TRUE_ROUTE}. Otherwise → ${FALSE_ROUTE}.`,
      context: "Project MILDRED — decision layer.",
      showcaseMessage: 'priority = "URGENT"',
      codeFill,
      tests,
      briefing: {
        shortBrief:
          "MILDRED can now spot an urgent request. That helps nobody if it still lands in the same queue. Make the system take a decision.",
        objectiveText: `If priority is "URGENT":\n→ ${TRUE_ROUTE}\n\nOtherwise:\n→ ${FALSE_ROUTE}`,
        categories: [TRUE_ROUTE, FALSE_ROUTE],
        newConcept: {
          title: "New tools",
          labels: [
            'if — runs a block when the condition is true',
            '== — compares two values',
            "else — runs when the condition is false",
          ],
        },
        optionalTheory: {
          title: "Already online",
          body: [
            "MILDRED returns sentiment + priority as JSON",
            "Valid structured data is available to the next layer",
          ],
        },
        successInsight:
          "Software reacts differently depending on data — that is a decision.",
        miraSuccess: miraSuccess("en"),
      },
      hints: [
        {
          level: 1,
          title: "Look at the objective",
          body: "You need to check whether priority equals the string URGENT.",
        },
        {
          level: 2,
          title: "Comparison",
          body: 'In Python, equality uses ==. Strings need quotes: "URGENT".',
          aiAssisted: true,
        },
        {
          level: 3,
          title: "Concrete blank",
          body: 'Fill: priority == "URGENT"',
        },
      ],
      concepts: [
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
        {
          id: "boolean",
          label: "True / False",
          explanation: "The condition evaluates to true or false — that drives the branch.",
        },
      ],
      completion: {
        miraLines: miraSuccess("en"),
        systemBefore:
          "MILDRED could label urgency — but every ticket still followed the same path.",
        systemAfter: `MILDRED's priority now forks the pipeline: ${TRUE_ROUTE} vs ${FALSE_ROUTE}.`,
        capabilityUnlocked: {
          id: "decision-logic",
          label: "Decision Logic",
          status: "ONLINE",
        },
        lessonHeadline: "Data only matters if the program can branch on it.",
        lessonBody: [
          "A variable holds a value. A condition asks a yes/no question about that value.",
          "if / else is how software chooses a different action from the same kind of input.",
        ],
        skillUnlocked: {
          skillId: "logic-1",
          skillName: "Making Decisions with Code",
          formalSkillName: "Logic I",
          skillCategory: "Program Logic",
          level: 1,
          description:
            "You can write a simple condition that routes work based on structured data.",
        },
        technicalTerms: [
          {
            id: "variable",
            label: "variable",
            explanation: "A named value the program can read — here, priority.",
          },
          {
            id: "condition",
            label: "condition",
            explanation: "An expression that is true or false.",
          },
          {
            id: "branch",
            label: "branch",
            explanation: "A different path the program takes after the condition.",
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
      "MILDRED sait reconnaître une demande urgente. Ça ne sert à rien si elle finit dans la même file. Fais prendre une décision au système.",
    objective: `Si priority vaut "URGENT" → ${TRUE_ROUTE}. Sinon → ${FALSE_ROUTE}.`,
    context: "Projet MILDRED — couche de décision.",
    showcaseMessage: 'priority = "URGENT"',
    codeFill,
    tests,
    briefing: {
      shortBrief:
        "MILDRED sait maintenant reconnaître une demande urgente. Ça ne sert à rien si elle finit dans la même file que les autres. Fais prendre une décision au système.",
      objectiveText: `Si priority vaut "URGENT" :\n→ ${TRUE_ROUTE}\n\nSinon :\n→ ${FALSE_ROUTE}`,
      categories: [TRUE_ROUTE, FALSE_ROUTE],
      newConcept: {
        title: "Nouveaux outils",
        labels: [
          "if — exécute un bloc lorsque la condition est vraie",
          "== — compare deux valeurs",
          "else — s’exécute lorsque la condition est fausse",
        ],
      },
      optionalTheory: {
        title: "Déjà en ligne",
        body: [
          "MILDRED renvoie sentiment + priority en JSON",
          "Des données structurées valides sont dispo pour la couche suivante",
        ],
      },
      successInsight:
        "Un programme peut réagir différemment selon les données — c’est une décision.",
      miraSuccess: miraSuccess("fr"),
    },
    hints: [
      {
        level: 1,
        title: "Regarde l’objectif",
        body: "Tu dois vérifier si priority est égal à la chaîne URGENT.",
      },
      {
        level: 2,
        title: "Comparaison",
        body: 'En Python, l’égalité s’écrit ==. Les chaînes ont des guillemets : "URGENT".',
        aiAssisted: true,
      },
      {
        level: 3,
        title: "Trou concret",
        body: 'Complète avec : priority == "URGENT"',
      },
    ],
    concepts: [
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
      {
        id: "boolean",
        label: "True / False",
        explanation:
          "La condition vaut vrai ou faux — c’est ce qui choisit la branche.",
      },
    ],
    completion: {
      miraLines: miraSuccess("fr"),
      systemBefore:
        "MILDRED pouvait étiqueter l’urgence — mais chaque ticket suivait encore le même chemin.",
      systemAfter: `La priorité de MILDRED fait bifurquer le pipeline : ${TRUE_ROUTE} vs ${FALSE_ROUTE}.`,
      capabilityUnlocked: {
        id: "decision-logic",
        label: "Decision Logic",
        status: "ONLINE",
      },
      lessonHeadline:
        "Des données ne servent que si le programme peut bifurquer dessus.",
      lessonBody: [
        "Une variable porte une valeur. Une condition pose une question oui/non sur cette valeur.",
        "if / else, c’est la façon dont un logiciel choisit une action différente à partir du même type d’entrée.",
      ],
      skillUnlocked: {
        skillId: "logic-1",
        skillName: "Prendre des décisions avec du code",
        formalSkillName: "Logic I",
        skillCategory: "Logique programme",
        level: 1,
        description:
          "Tu peux écrire une condition simple qui aiguille le travail à partir de données structurées.",
      },
      technicalTerms: [
        {
          id: "variable",
          label: "variable",
          explanation: "Une valeur nommée que le programme peut lire — ici, priority.",
        },
        {
          id: "condition",
          label: "condition",
          explanation: "Une expression qui est vraie ou fausse.",
        },
        {
          id: "branch",
          label: "branche",
          explanation: "Un chemin différent pris après la condition.",
        },
      ],
    },
  };
}
