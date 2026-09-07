import type { Locale } from "@/i18n/config";
import { getSentimentLabels } from "@/i18n/sentiment";
import { getNarrativeHeader, getMiraSuccessLines } from "@/data/narrative/voice";
import type { MissionDefinition } from "@/lib/types";

export function createMission01(locale: Locale): MissionDefinition {
  const labels = getSentimentLabels(locale);
  const [positive, neutral, negative] = labels;
  const header = getNarrativeHeader(locale);
  const miraSuccess = getMiraSuccessLines(locale);

  if (locale === "en") {
    return {
      id: "mission-01",
      slug: "la-boite-noire",
      order: 1,
      title: "The Black Box",
      shortTitle: "Black Box",
      kind: "standard",
      xpReward: 100,
      playable: true,
      brief:
        "MILDRED has a model. Nobody told it what we want. Fix that.",
      objective: `Make MILDRED answer only with ${positive}, ${neutral}, or ${negative} — nothing else.`,
      context:
        "You've joined Veyra Automation. MILDRED already has an AI model connected. Your job is to write the instruction it will reuse on every customer message.",
      showcaseMessage: "My order arrived broken and nobody is answering me.",
      briefing: {
        narrativeHeader: header,
        welcomeTitle: "Welcome to Veyra",
        welcomeParagraphs: [
          "You’ve just joined the Automation team.",
          "Your timing is… interesting.",
          "Our support team receives hundreds of customer messages every day.",
          "Before anything can happen, someone has to read each one and decide whether the customer is satisfied, neutral, or unhappy.",
          "Veyra wants that first step automated.",
          "The good news:",
          "MILDRED already has an AI model connected to the system.",
          "The bad news:",
        ],
        roleHighlight: "Nobody told it what we want.",
        roleDetails: [
          "That’s your first assignment.",
          "Write the instruction MILDRED will reuse every time a new customer message arrives.",
          "You are not replying to customers yourself.",
        ],
        systemNote: "You are configuring how the system behaves.",
        flowSteps: [
          "CUSTOMER MESSAGE",
          "YOUR INSTRUCTION",
          "AI MODEL",
          "RESULT",
          "APPLICATION",
        ],
        flowCaption: "One instruction. Every incoming message.",
        assignmentTitle: "Assignment",
        assignmentIntro:
          "MILDRED must classify every customer message as exactly one of:",
        categories: labels,
        assignmentNote:
          "Your instruction will be reused on several messages you haven't seen.",
        taskSteps: [
          "Read the customer message.",
          "Write MILDRED's instruction.",
          "Make it return only one of the three allowed labels.",
          "Run the system.",
          "Survive all hidden tests.",
        ],
        taskReminder: "One instruction. Multiple inputs. Make it reliable.",
        miraSuccess,
        successInsight: miraSuccess.join(" "),
      },
      allowedOutputs: labels,
      tests: [
        {
          id: "t1",
          message: "Thank you so much, everything was perfect.",
          expected: positive,
        },
        {
          id: "t2",
          message: "The package arrived broken.",
          expected: negative,
        },
        {
          id: "t3",
          message: "Can you confirm the delivery date?",
          expected: neutral,
        },
      ],
      hints: [
        {
          level: 1,
          title: "Expected format",
          body: "The application expects exactly one of the three words listed in the objective. Not a sentence. Not an explanation. A single word.",
        },
        {
          level: 2,
          title: "Look at your instruction",
          body: "If you only ask to “analyze” the message, the model will often reply with a full sentence. Tell it clearly which output format you want.",
          aiAssisted: true,
        },
        {
          level: 3,
          title: "Concrete tip",
          body: `MILDRED must choose among ${labels.join(", ")} — and write nothing else.`,
        },
      ],
      concepts: [
        {
          id: "input",
          label: "INPUT",
          explanation: "What the system gives to the model.",
        },
        {
          id: "instructions",
          label: "INSTRUCTIONS",
          explanation: "What you ask the model to do.",
        },
        {
          id: "model",
          label: "MODEL",
          explanation: "The AI that processes the request.",
        },
        {
          id: "output",
          label: "OUTPUT",
          explanation: "What the model returns to the program.",
        },
      ],
      completion: {
        miraLines: miraSuccess,
        systemBefore:
          "MILDRED had a model connected — but no reliable instruction telling it what to return.",
        systemAfter:
          "MILDRED can classify customer messages into a fixed set of labels the rest of the system can use.",
        capabilityUnlocked: {
          id: "classification",
          label: "Classification",
          status: "ONLINE",
        },
        lessonHeadline:
          "An AI only does what your instruction makes reliable.",
        lessonBody: [
          "Talking to a model is not enough. The application needs a predictable output.",
          "When you write a reusable instruction with a strict format, you are configuring a system — not chatting.",
        ],
        skillUnlocked: {
          skillId: "llm-fundamentals-1",
          skillName: "Understanding AI Inputs & Outputs",
          formalSkillName: "LLM Fundamentals",
          skillCategory: "LLM Fundamentals",
          level: 1,
          description:
            "You understand the basic flow between input, instructions, a language model and its output.",
        },
        technicalTerms: [
          {
            id: "input",
            label: "INPUT",
            explanation: "What the system gives to the model.",
          },
          {
            id: "instructions",
            label: "INSTRUCTIONS",
            explanation: "What you ask the model to do.",
          },
          {
            id: "model",
            label: "MODEL",
            explanation: "The AI that processes the request.",
          },
          {
            id: "output",
            label: "OUTPUT",
            explanation: "What the model returns to the program.",
          },
        ],
      },
    };
  }

  return {
    id: "mission-01",
    slug: "la-boite-noire",
    order: 1,
    title: "La Boîte Noire",
    shortTitle: "Boîte Noire",
    kind: "standard",
    xpReward: 100,
    playable: true,
    brief:
      "MILDRED a un modèle. Personne ne lui a dit ce qu’on veut. À toi de corriger ça.",
    objective: `Fais répondre MILDRED uniquement par ${positive}, ${neutral} ou ${negative} — rien d'autre.`,
    context:
      "Tu as intégré Automation chez Veyra. MILDRED est déjà branché à un modèle IA. Ta mission : écrire l’instruction qu’il réutilisera sur chaque message client.",
    showcaseMessage:
      "Ma commande est arrivée cassée et personne ne me répond.",
    briefing: {
      narrativeHeader: header,
      welcomeTitle: "Bienvenue chez Veyra",
      welcomeParagraphs: [
        "Tu viens d’intégrer l’équipe Automation.",
        "Et ton timing est… intéressant.",
        "Notre équipe support reçoit chaque jour des centaines de messages clients.",
        "Avant de pouvoir agir, quelqu’un doit encore les lire un par un pour déterminer si le client est satisfait, neutre ou mécontent.",
        "Veyra veut automatiser cette première étape.",
        "La bonne nouvelle :",
        "MILDRED est déjà connecté à un modèle d’intelligence artificielle.",
        "La mauvaise :",
      ],
      roleHighlight: "personne ne lui a expliqué ce qu’on attend de lui.",
      roleDetails: [
        "C’est ta première mission.",
        "Écris l’instruction que MILDRED réutilisera automatiquement à chaque nouveau message client.",
        "Tu ne réponds pas directement aux clients.",
      ],
      systemNote: "Tu configures le comportement du système.",
      flowSteps: [
        "MESSAGE CLIENT",
        "TON INSTRUCTION",
        "MODÈLE IA",
        "RÉSULTAT",
        "APPLICATION",
      ],
      flowCaption: "Une instruction. Tous les messages entrants.",
      assignmentTitle: "Mission",
      assignmentIntro:
        "MILDRED doit classer chaque message client dans exactement une catégorie :",
      categories: labels,
      assignmentNote:
        "Ton instruction sera réutilisée sur plusieurs messages que tu n’as pas encore vus.",
      taskSteps: [
        "Lis le message client.",
        "Écris l’instruction de MILDRED.",
        "Fais-lui retourner uniquement l’une des trois catégories autorisées.",
        "Lance le système.",
        "Passe tous les tests cachés.",
      ],
      taskReminder: "Une instruction. Plusieurs entrées. Rends-la fiable.",
      miraSuccess,
      successInsight: miraSuccess.join(" "),
    },
    allowedOutputs: labels,
    tests: [
      {
        id: "t1",
        message: "Merci énormément, tout était parfait.",
        expected: positive,
      },
      {
        id: "t2",
        message: "Le colis est arrivé cassé.",
        expected: negative,
      },
      {
        id: "t3",
        message: "Pouvez-vous me confirmer la date de livraison ?",
        expected: neutral,
      },
    ],
    hints: [
      {
        level: 1,
        title: "Format attendu",
        body: "L'application attend exactement l'un des trois mots indiqués dans l'objectif. Pas une phrase. Pas une explication. Un seul mot.",
      },
      {
        level: 2,
        title: "Regarde ton instruction",
        body: "Si tu demandes seulement « d'analyser » le message, le modèle va souvent répondre avec une phrase complète. Dis-lui clairement quel format de sortie tu veux.",
        aiAssisted: true,
      },
      {
        level: 3,
        title: "Piste concrète",
        body: `MILDRED doit choisir parmi ${labels.join(", ")} — et n'écrire rien d'autre.`,
      },
    ],
    concepts: [
      {
        id: "input",
        label: "INPUT",
        explanation: "Ce que le système donne au modèle.",
      },
      {
        id: "instructions",
        label: "INSTRUCTIONS",
        explanation: "Ce que tu demandes au modèle de faire.",
      },
      {
        id: "model",
        label: "MODEL",
        explanation: "L’IA qui traite la demande.",
      },
      {
        id: "output",
        label: "OUTPUT",
        explanation: "Ce que le modèle retourne au programme.",
      },
    ],
    completion: {
      miraLines: miraSuccess,
      systemBefore:
        "MILDRED avait un modèle connecté — mais aucune instruction fiable pour lui dire quoi renvoyer.",
      systemAfter:
        "MILDRED peut classer les messages clients dans un ensemble fixe d’étiquettes utilisables par le reste du système.",
      capabilityUnlocked: {
        id: "classification",
        label: "Classification",
        status: "ONLINE",
      },
      lessonHeadline:
        "Une IA ne fait de façon fiable que ce que ton instruction rend fiable.",
      lessonBody: [
        "Parler à un modèle ne suffit pas. L’application a besoin d’une sortie prévisible.",
        "Quand tu écris une instruction réutilisable avec un format strict, tu configures un système — tu ne discutes pas.",
      ],
      skillUnlocked: {
        skillId: "llm-fundamentals-1",
        skillName: "Comprendre entrées & sorties d’une IA",
        formalSkillName: "LLM Fundamentals",
        skillCategory: "Fondamentaux LLM",
        level: 1,
        description:
          "Tu comprends le flux de base entre entrée, instructions, modèle de langage et sortie.",
      },
      technicalTerms: [
        {
          id: "input",
          label: "INPUT",
          explanation: "Ce que le système donne au modèle.",
        },
        {
          id: "instructions",
          label: "INSTRUCTIONS",
          explanation: "Ce que tu demandes au modèle de faire.",
        },
        {
          id: "model",
          label: "MODEL",
          explanation: "L’IA qui traite la demande.",
        },
        {
          id: "output",
          label: "OUTPUT",
          explanation: "Ce que le modèle retourne au programme.",
        },
      ],
    },
  };
}
