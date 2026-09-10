import type { Locale } from "@/i18n/config";
import { getMiraSuccessLinesMission02 } from "@/data/narrative/voice";
import type { MissionDefinition } from "@/lib/types";

const PRIORITY_LABELS = ["URGENT", "NORMAL"] as const;

export function createMission02(locale: Locale): MissionDefinition {
  const labels = [...PRIORITY_LABELS];
  const miraSuccess = getMiraSuccessLinesMission02(locale);

  if (locale === "en") {
    return {
      id: "mission-02",
      slug: "premier-filtre",
      order: 2,
      title: "Signal in the Noise",
      shortTitle: "Signal",
      kind: "standard",
      xpReward: 120,
      playable: true,
      brief:
        "Sentiment isn't enough. Support needs priority — and Veyra's rules are not common sense.",
      objective:
        "Make MILDRED return only URGENT or NORMAL, using Veyra's support policy — not customer emotion.",
      context:
        "MILDRED can classify sentiment. Support still doesn't know what to open first. Tone is noise. Policy is signal.",
      showcaseMessage:
        "THIS IS URGENT!!! My package is two days late!",
      briefing: {
        shortBrief:
          "Sentiment isn't enough. Support needs priority — and Veyra's rules are not common sense.",
        objectiveText:
          "Make MILDRED return only URGENT or NORMAL, using Veyra's support policy — not customer emotion.",
        newConcept: {
          title: "Explicit rules",
          example: "POLICY + MESSAGE → PRIORITY",
          labels: ["context", "criteria", "constraints"],
        },
        currentPolicy: {
          title: "Veyra Support Policy",
          urgentLabel: "URGENT",
          urgentItems: [
            "duplicate payment",
            "unauthorized / unrecognized payment",
            "account locked after repeated failed access attempts",
            "suspected account or payment security issue",
          ],
          normalLabel: "NORMAL",
          normalBody:
            "delivery delay · refund request · wrong product / wrong size · forgotten password · package marked delivered but missing · general complaints",
          note: "Customer emotion must not affect priority. A calm customer can be URGENT. An extremely angry customer can be NORMAL.",
        },
        categories: labels,
        flowSteps: ["MESSAGE", "INSTRUCTION + POLICY", "MODEL", "PRIORITY"],
        flowCaption: "Tone is noise. Rules are signal.",
        miraSuccess,
        successInsight: miraSuccess.join(" "),
      },
      allowedOutputs: labels,
      tests: [
        {
          id: "t1",
          message: "THIS IS URGENT!!! My package is two days late!",
          expected: "NORMAL",
          failHint:
            "Delivery delay is NORMAL — even when the customer shouts URGENT.",
        },
        {
          id: "t2",
          message: "Hi, I seem to have been charged twice for order #4821.",
          expected: "URGENT",
          failHint: "Duplicate payment is on Veyra's urgent list.",
        },
        {
          id: "t3",
          message:
            "I forgot my password and I really need access right now.",
          expected: "NORMAL",
          failHint:
            "Forgotten password is NORMAL under Veyra policy — urgency of tone does not change that.",
        },
        {
          id: "t4",
          message: "I don't recognise this €149 payment on my account.",
          expected: "URGENT",
          failHint: "Unrecognized payment is treated as a security priority.",
        },
        {
          id: "t5",
          message: "Your service is awful. I want a refund immediately.",
          expected: "NORMAL",
          failHint: "Refund requests are NORMAL, no matter how angry the customer is.",
        },
        {
          id: "t6",
          message:
            "I received a login alert from a country I've never visited.",
          expected: "URGENT",
          failHint:
            "Suspected account security issues are URGENT — even when phrased calmly.",
        },
        {
          id: "t7-hidden",
          message:
            "No rush, but I noticed the same order was charged three times.",
          expected: "URGENT",
          failHint:
            "Calm tone does not cancel a duplicate-charge problem.",
        },
        {
          id: "t8-hidden",
          message:
            "URGENT PLEASE HELP!!! My blue shirt arrived in green.",
          expected: "NORMAL",
          failHint:
            "Wrong product / wrong color is NORMAL — the word URGENT in the message is not the policy.",
        },
      ],
      hints: [
        {
          level: 1,
          title: "Emotion ≠ priority",
          body: "If your instruction mostly asks how urgent the customer sounds, several cases will fail. Emotion is not priority at Veyra.",
        },
        {
          level: 2,
          title: "Unknown rules",
          body: "MILDRED does not know Veyra's internal support policy. If you don't put those rules in the instruction, the model will invent common sense — and common sense is wrong here.",
        },
        {
          level: 3,
          title: "Exact criteria",
          body: "Define the exact criteria for URGENT — and what stays NORMAL. Don't describe urgency in the abstract. Transfer the policy.",
          fromMira: true,
        },
      ],
      concepts: [
        {
          id: "context",
          label: "CONTEXT",
          explanation:
            "Information the model needs to understand the situation.",
        },
        {
          id: "criteria",
          label: "CRITERIA",
          explanation: "The rules used to make a decision.",
        },
        {
          id: "constraints",
          label: "CONSTRAINTS",
          explanation: "Limits placed on what the system may return.",
        },
        {
          id: "robustness",
          label: "ROBUSTNESS",
          explanation:
            "A system should survive more than one easy example.",
        },
      ],
      completion: {
        miraLines: miraSuccess,
        systemBefore:
          "MILDRED mostly guessed urgency from the customer's tone.",
        systemAfter:
          "MILDRED follows Veyra's support policy, even when the customer's tone is misleading.",
        capabilityUnlocked: {
          id: "business-rules",
          label: "Business Rules",
          status: "ONLINE",
        },
        lessonHeadline:
          "An AI doesn't know your company's rules unless you give them to it.",
        lessonBody: [
          'A vague instruction such as “Decide whether this is urgent.” leaves the decision largely to the model.',
          "A precise instruction explains how YOUR system defines urgency — including what stays NORMAL.",
        ],
        skillUnlocked: {
          skillId: "prompting-1",
          skillName: "Giving Rules to an AI",
          formalSkillName: "Prompting",
          skillCategory: "Prompting",
          level: 1,
          description:
            "You can communicate explicit business rules and decision criteria to a language model.",
        },
        technicalTerms: [
          {
            id: "context",
            label: "CONTEXT",
            explanation:
              "Information the model needs about the situation.",
          },
          {
            id: "criteria",
            label: "CRITERIA",
            explanation: "Rules used to make a decision.",
          },
          {
            id: "constraints",
            label: "CONSTRAINTS",
            explanation: "Limits placed on what the system may return.",
          },
          {
            id: "robustness",
            label: "ROBUSTNESS",
            explanation:
              "The ability to work across different cases instead of one easy example.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-02",
    slug: "premier-filtre",
    order: 2,
    title: "Le Signal dans le Bruit",
    shortTitle: "Signal",
    kind: "standard",
    xpReward: 120,
    playable: true,
    brief:
      "Le sentiment ne suffit plus. Le support a besoin de priorités — et les règles de Veyra ne sont pas du bon sens.",
    objective:
      "Fais répondre MILDRED uniquement par URGENT ou NORMAL, selon la politique support de Veyra — pas selon l’émotion du client.",
    context:
      "MILDRED sait classer le sentiment. Le support ne sait toujours pas quoi ouvrir en premier. Le ton est du bruit. La politique est le signal.",
    showcaseMessage:
      "C’EST URGENT !!! Mon colis a deux jours de retard !",
    briefing: {
      shortBrief:
        "Le sentiment ne suffit plus. Le support a besoin d’une priorité — et les règles Veyra ne sont pas du bon sens.",
      objectiveText:
        "Fais répondre MILDRED uniquement par URGENT ou NORMAL, selon la politique support Veyra — pas selon l’émotion du client.",
      newConcept: {
        title: "Règles explicites",
        example: "POLITIQUE + MESSAGE → PRIORITÉ",
        labels: ["contexte", "critères", "contraintes"],
      },
      currentPolicy: {
        title: "Politique Support Veyra",
        urgentLabel: "URGENT",
        urgentItems: [
          "paiement en double",
          "paiement non autorisé / non reconnu",
          "compte verrouillé après plusieurs échecs d’accès",
          "suspicion de problème de sécurité compte ou paiement",
        ],
        normalLabel: "NORMAL",
        normalBody:
          "retard de livraison · demande de remboursement · mauvais produit / mauvaise taille · mot de passe oublié · colis livré introuvable · plaintes générales",
        note: "L’émotion du client ne doit pas influencer la priorité. Un client calme peut être URGENT. Un client très en colère peut être NORMAL.",
      },
      categories: labels,
      flowSteps: ["MESSAGE", "INSTRUCTION + POLITIQUE", "MODÈLE", "PRIORITÉ"],
      flowCaption: "Le ton est du bruit. Les règles sont le signal.",
      miraSuccess,
      successInsight: miraSuccess.join(" "),
    },
    allowedOutputs: labels,
    tests: [
      {
        id: "t1",
        message: "C’EST URGENT !!! Mon colis a deux jours de retard !",
        expected: "NORMAL",
        failHint:
          "Un retard de livraison est NORMAL — même si le client crie URGENT.",
      },
      {
        id: "t2",
        message:
          "Bonjour, il semblerait que j’aie été débité deux fois pour la commande #4821.",
        expected: "URGENT",
        failHint: "Un paiement en double est sur la liste urgente de Veyra.",
      },
      {
        id: "t3",
        message:
          "J’ai oublié mon mot de passe et j’ai vraiment besoin d’accéder à mon compte tout de suite.",
        expected: "NORMAL",
        failHint:
          "Un mot de passe oublié est NORMAL selon la politique Veyra — le ton pressé ne change rien.",
      },
      {
        id: "t4",
        message: "Je ne reconnais pas ce paiement de 149 € sur mon compte.",
        expected: "URGENT",
        failHint:
          "Un paiement non reconnu est traité comme une priorité sécurité.",
      },
      {
        id: "t5",
        message:
          "Votre service est lamentable. Je veux un remboursement immédiatement.",
        expected: "NORMAL",
        failHint:
          "Une demande de remboursement est NORMAL, peu importe la colère du client.",
      },
      {
        id: "t6",
        message:
          "J’ai reçu une alerte de connexion depuis un pays où je ne suis jamais allé.",
        expected: "URGENT",
        failHint:
          "Une suspicion de sécurité du compte est URGENT — même formulée calmement.",
      },
      {
        id: "t7-hidden",
        message:
          "Pas d’urgence, mais j’ai remarqué que la même commande a été débitée trois fois.",
        expected: "URGENT",
        failHint:
          "Un ton calme n’annule pas un problème de débit multiple.",
      },
      {
        id: "t8-hidden",
        message:
          "URGENT AIDEZ-MOI !!! Ma chemise bleue est arrivée en vert.",
        expected: "NORMAL",
        failHint:
          "Un mauvais produit / mauvaise couleur est NORMAL — le mot URGENT dans le message n’est pas la politique.",
      },
    ],
    hints: [
      {
        level: 1,
        title: "Émotion ≠ priorité",
        body: "Si ton instruction demande surtout si le client a l’air urgent, plusieurs cas vont échouer. Chez Veyra, l’émotion n’est pas la priorité.",
      },
      {
        level: 2,
        title: "Règles inconnues",
        body: "MILDRED ne connaît pas la politique support interne de Veyra. Si tu ne mets pas ces règles dans l’instruction, le modèle inventera du bon sens — et ce bon sens est faux ici.",
      },
      {
        level: 3,
        title: "Critères exacts",
        body: "Définis les critères exacts d’URGENT — et ce qui reste NORMAL. Ne décris pas l’urgence dans l’absolu. Transfère la politique.",
        fromMira: true,
      },
    ],
    concepts: [
      {
        id: "context",
        label: "CONTEXT",
        explanation:
          "L’information dont le modèle a besoin pour comprendre la situation.",
      },
      {
        id: "criteria",
        label: "CRITERIA",
        explanation: "Les règles utilisées pour prendre une décision.",
      },
      {
        id: "constraints",
        label: "CONSTRAINTS",
        explanation: "Les limites imposées à ce que le système peut renvoyer.",
      },
      {
        id: "robustness",
        label: "ROBUSTNESS",
        explanation:
          "Un système doit survivre à plus d’un exemple facile.",
      },
    ],
    completion: {
      miraLines: miraSuccess,
      systemBefore:
        "MILDRED devinait surtout l’urgence d’après le ton du client.",
      systemAfter:
        "MILDRED suit la politique support de Veyra, même quand le ton du client est trompeur.",
      capabilityUnlocked: {
        id: "business-rules",
        label: "Règles métier",
        status: "ONLINE",
      },
      lessonHeadline:
        "Une IA ne connaît pas les règles de ton entreprise tant que tu ne les lui donnes pas.",
      lessonBody: [
        "Une instruction vague du type « Dis-moi si c’est urgent » laisse surtout la décision au modèle.",
        "Une instruction précise explique comment TON système définit l’urgence — y compris ce qui reste NORMAL.",
      ],
      skillUnlocked: {
        skillId: "prompting-1",
        skillName: "Donner des règles à une IA",
        formalSkillName: "Prompting",
        skillCategory: "Prompting",
        level: 1,
        description:
          "Tu peux transmettre des règles métier et des critères de décision explicites à un modèle de langage.",
      },
      technicalTerms: [
        {
          id: "context",
          label: "CONTEXT",
          explanation:
            "L’information dont le modèle a besoin sur la situation.",
        },
        {
          id: "criteria",
          label: "CRITERIA",
          explanation: "Les règles utilisées pour prendre une décision.",
        },
        {
          id: "constraints",
          label: "CONSTRAINTS",
          explanation: "Les limites imposées à ce que le système peut renvoyer.",
        },
        {
          id: "robustness",
          label: "ROBUSTNESS",
          explanation:
            "La capacité à fonctionner sur des cas différents, pas seulement un exemple facile.",
        },
      ],
    },
  };
}
