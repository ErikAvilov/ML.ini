import type { Locale } from "@/i18n/config";
import type {
  ClassificationTest,
  MissionDefinition,
  PipelineTask,
  SafetyTask,
} from "@/lib/types";
import { defaultChainConnections } from "@/lib/missions/pipeline";
import { createMission08 } from "./mission-08";

const HUMAN = "HUMAN_REVIEW";
const QUEUE = "STANDARD_QUEUE";

/** Reuse Mission 08 block contracts — add no free canvas. */
function pipelineFrom08(locale: Locale): PipelineTask {
  const base = createMission08(locale).pipeline!;
  return {
    ...base,
    title:
      locale === "en" ? "Keep the chain — add safety" : "Garde la chaîne — ajoute la sécurité",
    description:
      locale === "en"
        ? "The happy path still runs. When a step cannot be trusted, leave it safely."
        : "Le chemin heureux tourne toujours. Quand une étape n’est plus fiable, sors-en en sécurité.",
  };
}

function safetyTask(locale: Locale): SafetyTask {
  if (locale === "en") {
    return {
      title: "Plan the failure path",
      description:
        "When JSON, priority, or Support cannot be trusted, route to MANUAL REVIEW with the right reason.",
      parseFailReasons: ["INVALID_AI_OUTPUT", "INVALID_PRIORITY", "ACTION_FAILED"],
      invalidPriorityReasons: [
        "INVALID_AI_OUTPUT",
        "INVALID_PRIORITY",
        "ACTION_FAILED",
      ],
      actionFailReasons: ["INVALID_AI_OUTPUT", "INVALID_PRIORITY", "ACTION_FAILED"],
      expected: {
        onParseFail: { target: "MANUAL_REVIEW", reason: "INVALID_AI_OUTPUT" },
        onInvalidPriority: {
          target: "MANUAL_REVIEW",
          reason: "INVALID_PRIORITY",
        },
        onActionFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
      },
      checkLabel: "Incomplete",
      passLabel: "Guarded",
    };
  }
  return {
    title: "Planifier l’échec",
    description:
      "Quand le JSON, la priorité ou Support ne sont plus fiables, envoie vers MANUAL REVIEW avec la bonne raison.",
    parseFailReasons: ["INVALID_AI_OUTPUT", "INVALID_PRIORITY", "ACTION_FAILED"],
    invalidPriorityReasons: [
      "INVALID_AI_OUTPUT",
      "INVALID_PRIORITY",
      "ACTION_FAILED",
    ],
    actionFailReasons: ["INVALID_AI_OUTPUT", "INVALID_PRIORITY", "ACTION_FAILED"],
    expected: {
      onParseFail: { target: "MANUAL_REVIEW", reason: "INVALID_AI_OUTPUT" },
      onInvalidPriority: {
        target: "MANUAL_REVIEW",
        reason: "INVALID_PRIORITY",
      },
      onActionFail: { target: "MANUAL_REVIEW", reason: "ACTION_FAILED" },
    },
    checkLabel: "Incomplet",
    passLabel: "Protégé",
  };
}

function tests(locale: Locale): ClassificationTest[] {
  const msg =
    locale === "en"
      ? "I can't access my account."
      : "Je n’arrive pas à accéder à mon compte.";
  const msgInvoice =
    locale === "en"
      ? "Where can I download my invoice?"
      : "Où puis-je télécharger ma facture ?";
  const msgUrgent =
    locale === "en"
      ? "My card was charged twice."
      : "Ma carte a été débitée deux fois.";
  const msgWeirdSentiment =
    locale === "en"
      ? "lol everything is on fire but also fine??"
      : "lol tout brûle mais ça va ??";

  return [
    {
      id: "t1",
      message: msg,
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
      id: "t2",
      message: msg,
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
          ? "Valid JSON is not always valid business data."
          : "Un JSON valide n’est pas toujours une donnée métier valide.",
    },
    {
      id: "t3",
      message: msgUrgent,
      expected: "ACTION_FAILED",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        aiResponse: JSON.stringify({
          sentiment: "NEGATIVE",
          priority: "URGENT",
        }),
        forceActionFailure: true,
      },
      failHint:
        locale === "en"
          ? "When Support fails, use the safe fallback."
          : "Quand Support échoue, utilise le repli sûr.",
    },
    {
      id: "t4-hidden",
      message: msgInvoice,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        aiResponse: JSON.stringify({
          sentiment: "NEUTRAL",
          priority: "NORMAL",
        }),
      },
      failHint:
        locale === "en"
          ? "Don't invent missing data — but happy paths must still succeed."
          : "N’invente pas les données manquantes — mais les chemins heureux doivent encore réussir.",
    },
    {
      id: "t5-hidden",
      message: msgUrgent,
      expected: "create_ticket",
      serviceFixture: {
        route: HUMAN,
        priority: "URGENT",
        aiResponse: JSON.stringify({
          sentiment: "NEGATIVE",
          priority: "URGENT",
        }),
      },
      failHint:
        locale === "en"
          ? "Don't always route to manual review."
          : "Ne renvoie pas toujours vers la revue manuelle.",
    },
    {
      id: "t6-hidden",
      message: msgWeirdSentiment,
      expected: "queue_message",
      serviceFixture: {
        route: QUEUE,
        priority: "NORMAL",
        sentiment: "WEIRD",
        aiResponse: JSON.stringify({
          sentiment: "WEIRD",
          priority: "NORMAL",
        }),
      },
      failHint:
        locale === "en"
          ? "Validate what the next step actually depends on."
          : "Valide ce dont l’étape suivante dépend vraiment.",
    },
  ];
}

export function createMission09(locale: Locale): MissionDefinition {
  const pipeline = pipelineFrom08(locale);
  // Ensure expected connections stay canonical
  pipeline.expectedConnections = defaultChainConnections();
  const safety = safetyTask(locale);
  const suite = tests(locale);

  if (locale === "en") {
    return {
      id: "mission-09",
      slug: "derniere-ligne",
      order: 9,
      title: "Red Alert",
      shortTitle: "Alert",
      kind: "standard",
      xpReward: 280,
      playable: true,
      brief:
        "The chain works — until it doesn't. A system that only works when everything goes right isn't reliable.",
      objective:
        "1. Keep the happy path.\n2. On bad JSON → MANUAL REVIEW / INVALID_AI_OUTPUT.\n3. On unknown priority → INVALID_PRIORITY.\n4. On Support failure → ACTION_FAILED.",
      context: "Project MILDRED — safe failure.",
      showcaseMessage: suite[0]!.message,
      pipeline,
      safety,
      tests: suite,
      briefing: {
        shortBrief:
          "Mira injects failures on purpose. Make MILDRED fail safely — happy path, failure path, fail safe.",
        objectiveText:
          "Configure fallbacks for invalid JSON, unknown priority, and Support action failure. Do not invent missing data as NORMAL.",
        categories: [
          "INVALID_AI_OUTPUT",
          "INVALID_PRIORITY",
          "ACTION_FAILED",
          "create_ticket",
          "queue_message",
        ],
        newConcept: {
          title: "Happy path · Failure path · Fail safe",
          summary:
            "When the next step cannot safely continue, leave the happy path and call MANUAL REVIEW.",
          example: `PARSE ✕ invalid JSON
  →  MANUAL REVIEW
  →  reason: INVALID_AI_OUTPUT`,
          labels: [
            "Valid JSON ≠ valid business data",
            "Don't default unknown priority to NORMAL",
            "Happy paths must still succeed",
          ],
        },
        optionalTheory: {
          title: "Not try/catch class",
          body: [
            "This is failure planning, not Python exception syntax.",
            "Unlimited retries are not the answer here.",
          ],
        },
        successInsight:
          "Reliability means detecting when you can no longer trust the state.",
        miraSuccess: [
          "Good.",
          "It failed — safely.",
          "That's what reliable looks like.",
        ],
      },
      hints: [
        {
          level: 1,
          title: "Can it continue?",
          body: "Ask yourself: can the next step safely continue with the data it received?",
        },
        {
          level: 2,
          title: "Leave the path",
          body: "If the answer is no, leave the happy path.",
          fromMira: true,
        },
        {
          level: 3,
          title: "Reasons",
          body: "Invalid AI output → INVALID_AI_OUTPUT · Unknown priority → INVALID_PRIORITY · Failed action → ACTION_FAILED",
        },
      ],
      completion: {
        miraLines: [
          "Good.",
          "It failed — safely.",
          "That's what reliable looks like.",
        ],
        systemBefore: "The chain only survived the happy path.",
        systemAfter:
          "Untrusted states leave the happy path into MANUAL REVIEW with a clear reason.",
        capabilityUnlocked: {
          id: "guardrails",
          label: "Guardrails",
          status: "ONLINE",
        },
        lessonHeadline:
          "A reliable automation detects when it can no longer trust its state.",
        lessonBody: [
          "Valid JSON is not enough — business values must also be allowed.",
          "Don't invent missing data. Prefer a safe fallback.",
        ],
        skillUnlocked: {
          skillId: "guardrails-1",
          skillName: "Fail safely",
          formalSkillName: "Guardrails I",
          skillCategory: "Safe Fallbacks",
          level: 1,
          description:
            "You can detect unreliable states and route them to a safe fallback.",
        },
      },
    };
  }

  return {
    id: "mission-09",
    slug: "derniere-ligne",
    order: 9,
    title: "Alerte Rouge",
    shortTitle: "Alerte",
    kind: "standard",
    xpReward: 280,
    playable: true,
    brief:
      "La chaîne marche — jusqu’au moment où elle ne marche plus. Un système qui ne marche que quand tout va bien n’est pas fiable.",
    objective:
      "1. Garde le chemin heureux.\n2. JSON invalide → MANUAL REVIEW / INVALID_AI_OUTPUT.\n3. Priorité inconnue → INVALID_PRIORITY.\n4. Échec Support → ACTION_FAILED.",
    context: "Projet MILDRED — échec sûr.",
    showcaseMessage: suite[0]!.message,
    pipeline,
    safety,
    tests: suite,
    briefing: {
      shortBrief:
        "Mira injecte des pannes exprès. Fais échouer MILDRED en sécurité — chemin heureux, chemin d’échec, fail safe.",
      objectiveText:
        "Configure les replis pour JSON invalide, priorité inconnue, et échec d’action Support. N’invente pas les données manquantes en NORMAL.",
      categories: [
        "INVALID_AI_OUTPUT",
        "INVALID_PRIORITY",
        "ACTION_FAILED",
        "create_ticket",
        "queue_message",
      ],
      newConcept: {
        title: "Chemin heureux · Chemin d’échec · Fail safe",
        summary:
          "Quand l’étape suivante ne peut pas continuer en sécurité, quitte le chemin heureux et appelle MANUAL REVIEW.",
        example: `PARSE ✕ JSON invalide
  →  MANUAL REVIEW
  →  reason: INVALID_AI_OUTPUT`,
        labels: [
          "JSON valide ≠ donnée métier valide",
          "Ne mets pas une priorité inconnue à NORMAL",
          "Les chemins heureux doivent encore réussir",
        ],
      },
      optionalTheory: {
        title: "Pas un cours try/catch",
        body: [
          "C’est de la planification d’échec, pas de la syntaxe d’exceptions Python.",
          "Les retries illimités ne sont pas la réponse ici.",
        ],
      },
      successInsight:
        "La fiabilité, c’est détecter le moment où on ne peut plus faire confiance à l’état.",
      miraSuccess: [
        "Bien.",
        "Ça a échoué — en sécurité.",
        "Voilà à quoi ressemble le fiable.",
      ],
    },
    hints: [
      {
        level: 1,
        title: "Peut-elle continuer ?",
        body: "Demande-toi : l’étape suivante peut-elle continuer en sécurité avec les données reçues ?",
      },
      {
        level: 2,
        title: "Quitte le chemin",
        body: "Si la réponse est non, quitte le chemin heureux.",
        fromMira: true,
      },
      {
        level: 3,
        title: "Raisons",
        body: "Sortie IA invalide → INVALID_AI_OUTPUT · Priorité inconnue → INVALID_PRIORITY · Action échouée → ACTION_FAILED",
      },
    ],
    completion: {
      miraLines: [
        "Bien.",
        "Ça a échoué — en sécurité.",
        "Voilà à quoi ressemble le fiable.",
      ],
      systemBefore: "La chaîne ne survivait qu’au chemin heureux.",
      systemAfter:
        "Les états non fiables quittent le chemin heureux vers MANUAL REVIEW avec une raison claire.",
      capabilityUnlocked: {
        id: "guardrails",
        label: "Guardrails",
        status: "ONLINE",
      },
      lessonHeadline:
        "Une automatisation fiable détecte quand elle ne peut plus faire confiance à son état.",
      lessonBody: [
        "Un JSON valide ne suffit pas — les valeurs métier doivent aussi être autorisées.",
        "N’invente pas les données manquantes. Préfère un repli sûr.",
      ],
      skillUnlocked: {
        skillId: "guardrails-1",
        skillName: "Échouer en sécurité",
        formalSkillName: "Guardrails I",
        skillCategory: "Safe Fallbacks",
        level: 1,
        description:
          "Tu peux détecter des états non fiables et les aiguiller vers un repli sûr.",
      },
    },
  };
}
