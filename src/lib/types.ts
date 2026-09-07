import type { Locale } from "@/i18n/config";
import type { SentimentKey } from "@/i18n/sentiment";

export type MissionStatus = "locked" | "available" | "completed";

export type MissionKind = "standard" | "boss" | "coming-soon";

export interface ClassificationTest {
  id: string;
  message: string;
  /**
   * Expected output for single-label missions,
   * or canonical multi-line string for structured missions.
   */
  expected: string;
  /** Structured missions: expected field values keyed by field name */
  expectedFields?: Record<string, string>;
  /** Indice ciblé si ce test échoue (sans révéler la solution) */
  failHint?: string;
  failHints?: {
    format?: string;
    /** Per-field semantic hints, e.g. SENTIMENT / PRIORITY */
    fields?: Record<string, string>;
  };
}

export interface OutputFieldSpec {
  name: string;
  allowedValues: string[];
}

/** Schema for multi-field machine-readable output (pre-JSON) */
export interface StructuredOutputSchema {
  fields: OutputFieldSpec[];
}

export type MissionTestErrorKind =
  | "format"
  | "sentiment"
  | "priority"
  | "value"
  | null;

export interface MissionHint {
  level: number;
  title: string;
  body: string;
  /** Si true, le contenu peut être enrichi par l'IA */
  aiAssisted?: boolean;
  /** Affiche l’attribution Mira */
  fromMira?: boolean;
}

export interface DiscoveredConcept {
  id: string;
  label: string;
  explanation: string;
}

/** Skill unlock shown on mission completion (proto skill system) */
export interface MissionSkillUnlock {
  skillName: string;
  /** Formal / tree name, e.g. Prompting */
  formalSkillName: string;
  skillCategory: string;
  level: number;
  description: string;
}

/** Capability added to Project MILDRED */
export interface MildredCapabilityUnlock {
  id: string;
  label: string;
  /** Display status, e.g. ONLINE */
  status: string;
}

/**
 * Debrief pédagogique post-mission.
 * Ordre UX : Mira → complete → XP → MILDRED → lesson → skill → terms → continue
 */
export interface MissionCompletionContent {
  miraLines?: string[];
  systemBefore: string;
  systemAfter: string;
  capabilityUnlocked: MildredCapabilityUnlock;
  lessonHeadline: string;
  /** 2–4 short plain-language sentences/paragraphs */
  lessonBody: string[];
  skillUnlocked: MissionSkillUnlock;
  technicalTerms?: DiscoveredConcept[];
}

export interface OutputContractContent {
  title: string;
  humanReadableExample: string;
  requiredFormat: string;
  fieldLabels?: string[];
}

export interface NarrativeHeaderContent {
  company: string;
  division: string;
  project: string;
  assignmentLabel: string;
  fromLabel: string;
  fromName: string;
  fromTitle: string;
}

export interface SupportPolicyContent {
  title: string;
  urgentLabel: string;
  urgentItems: string[];
  normalLabel: string;
  normalBody: string;
  note: string;
}

/** Deterministic sentiment rules (Mission 3+) — avoids subjective grading */
export interface SentimentPolicyContent {
  title: string;
  positiveLabel: string;
  positiveItems: string[];
  negativeLabel: string;
  negativeItems: string[];
  neutralLabel: string;
  neutralItems: string[];
  note: string;
}

export interface MissionBriefingContent {
  narrativeHeader?: NarrativeHeaderContent;
  welcomeTitle: string;
  welcomeParagraphs: string[];
  /** Ligne d’accent (ex. mauvaise nouvelle) */
  roleHighlight: string;
  /** Paragraphes de clôture du contexte (pas une liste à puces) */
  roleDetails: string[];
  /** Dernière phrase forte du contexte */
  systemNote: string;
  /** Politique métier optionnelle (Mission 2+) */
  policy?: SupportPolicyContent;
  /** Règles sentiment déterministes (Mission 3+) */
  sentimentPolicy?: SentimentPolicyContent;
  /** Contrat de sortie machine (Mission 3+) */
  outputContract?: OutputContractContent;
  flowSteps: string[];
  flowCaption: string;
  /** Titre section assignment (EN Assignment / FR Mission) */
  assignmentTitle: string;
  assignmentIntro: string;
  categories: string[];
  assignmentNote: string;
  taskSteps: string[];
  taskReminder: string;
  /** Réplique Mira à la réussite (lignes courtes) */
  miraSuccess?: string[];
  successInsight: string;
}

export interface MissionDefinition {
  id: string;
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  kind: MissionKind;
  xpReward: number;
  brief: string;
  objective: string;
  context: string;
  /** Contenu disponible pour cette itération */
  playable: boolean;
  comingSoonMessage?: string;
  showcaseMessage?: string;
  briefing?: MissionBriefingContent;
  allowedOutputs?: string[];
  /** When set, tests use structured multi-field validation */
  outputSchema?: StructuredOutputSchema;
  tests?: ClassificationTest[];
  hints?: MissionHint[];
  /** Debrief pédagogique (écran de réussite) */
  completion?: MissionCompletionContent;
  /** @deprecated Prefer completion.technicalTerms */
  concepts?: DiscoveredConcept[];
}

export type MissionDefinitionFactory = (locale: Locale) => MissionDefinition;

export interface KingdomDefinition {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  missionIds: string[];
}

export type KingdomDefinitionFactory = (locale: Locale) => KingdomDefinition;

export interface PlayerProgress {
  xp: number;
  level: number;
  streak: number;
  completedMissions: string[];
  unlockedMissions: string[];
  /** Proto skill ids (e.g. structured-output-1) */
  unlockedSkills: string[];
  /** Project MILDRED capability ids now ONLINE */
  unlockedCapabilities: string[];
  lastPlayedAt: string | null;
}

export interface ClassificationResult {
  raw: string;
  /** Label autorisé normalisé / forme canonique, ou null si format invalide */
  normalized: string | null;
  isValidCategory: boolean;
  matchesExpected: boolean;
  expected: string;
  message: string;
  testId: string;
  failHint?: string;
  errorKind?: MissionTestErrorKind;
  parsedFields?: Record<string, string> | null;
  /**
   * Structured missions only.
   * true = semantic fields match expected; false = wrong; null = unclear (e.g. free prose).
   */
  contentOk?: boolean | null;
  /** Structured missions: machine output contract respected */
  contractOk?: boolean;
  /** Field names wrong when the contract parsed successfully */
  fieldMismatches?: string[];
}

export interface TestSuiteSummary {
  passed: number;
  total: number;
  results: ClassificationResult[];
  feedback: string;
  /** Affiché comme réplique Mira lorsque le feedback humain apporte quelque chose */
  feedbackSpeaker: "mira" | null;
  allPassed: boolean;
}

/** @deprecated Prefer string labels on ClassificationTest */
export type { SentimentKey };
