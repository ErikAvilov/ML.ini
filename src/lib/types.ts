import type { Locale } from "@/i18n/config";
import type { SentimentKey } from "@/i18n/sentiment";

export type MissionStatus = "locked" | "available" | "completed";

export type MissionKind = "standard" | "boss" | "coming-soon" | "intro";

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
  /** Default: KEY: VALUE lines. Mission 04+ may use `"json"`. */
  format?: "key-value" | "json";
}

export type MissionTestErrorKind =
  | "format"
  | "sentiment"
  | "priority"
  | "value"
  | "json"
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
  /** Stable id matching the global skill tree registry */
  skillId: string;
  skillName: string;
  /** Formal / tree name, e.g. Prompting */
  formalSkillName: string;
  skillCategory: string;
  level: number;
  description: string;
}

export type SkillNodeState = "locked" | "available" | "unlocked" | "mastered";
export type SkillNodeType = "minor" | "normal" | "major" | "keystone";

/** Global skill-tree node (locale-resolved display fields) */
export interface SkillDefinition {
  id: string;
  /** Canonical formal name, e.g. "LLM Fundamentals I" */
  name: string;
  /** Player-facing title */
  displayName: string;
  description: string;
  category: string;
  level: number;
  type: SkillNodeType;
  prerequisites: string[];
  /** Mission that proves this skill */
  unlockedByMissionId: string;
  /** Kingdom id for detail copy */
  kingdomId: string;
  /** Layout position on the skill canvas (logical units) */
  position: { x: number; y: number };
}

export interface SkillEdge {
  from: string;
  to: string;
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

/** Compact “new knowledge” block (dominant in the brief) */
export interface MissionConceptBlock {
  title: string;
  /** One-line plain-language definition (shown before the example). */
  summary?: string;
  example?: string;
  labels?: string[];
}

/** Side-by-side rejected vs expected format */
export interface FormatCompareContent {
  currentLabel: string;
  currentExample: string;
  currentStatusLabel: string;
  expectedLabel: string;
  expectedExample: string;
  expectedStatusLabel: string;
}

export interface ContractLine {
  name: string;
  values: string;
}

export interface CollapsibleContent {
  title: string;
  body: string[];
}

/** Previously learned rules — accessible, collapsed by default */
export interface PreviousRulesContent {
  title: string;
  sentimentPolicy?: SentimentPolicyContent;
  policy?: SupportPolicyContent;
}

/** Lightweight onboarding sections (Mission 0) */
export interface MissionIntroSection {
  title: string;
  body: string[];
}

export interface MissionIntroContent {
  sections: MissionIntroSection[];
  ctaLabel: string;
  /** Next mission slug after completing intro */
  nextSlug: string;
}

export interface MissionBriefingContent {
  /**
   * Compact Mira problem statement (2–4 lines).
   * When set, the brief uses the compact workspace layout.
   */
  shortBrief?: string;
  /** Prominent objective; falls back to mission.objective */
  objectiveText?: string;
  newConcept?: MissionConceptBlock;
  formatCompare?: FormatCompareContent;
  expectedFormat?: string;
  contractLines?: ContractLine[];
  optionalTheory?: CollapsibleContent;
  previousRules?: PreviousRulesContent;
  /**
   * Current-mission rules shown prominently (e.g. M02 policy).
   * Prefer this over legacy `policy` when using compact layout.
   */
  currentPolicy?: SupportPolicyContent;
  currentSentimentPolicy?: SentimentPolicyContent;

  /** @deprecated Prefer shortBrief — still accepted for legacy data */
  narrativeHeader?: NarrativeHeaderContent;
  welcomeTitle?: string;
  welcomeParagraphs?: string[];
  roleHighlight?: string;
  roleDetails?: string[];
  systemNote?: string;
  /** Legacy policy slot — rendered as current unless moved to previousRules */
  policy?: SupportPolicyContent;
  sentimentPolicy?: SentimentPolicyContent;
  outputContract?: OutputContractContent;
  flowSteps?: string[];
  flowCaption?: string;
  assignmentTitle?: string;
  assignmentIntro?: string;
  categories?: string[];
  assignmentNote?: string;
  taskSteps?: string[];
  taskReminder?: string;
  miraSuccess?: string[];
  successInsight: string;
}

/** Deterministic JSON syntax drill — graded on player edit, not the AI prompt. */
export interface PayloadRepairTask {
  title: string;
  description: string;
  brokenPayload: string;
  expectedFields: Record<string, string>;
  checkLabel: string;
  passLabel: string;
}

/** Code-fill execution mode — do not overload `logic` with AI calls. */
export type CodeFillMode = "logic" | "ai-integration";

export interface CodeFillBlank {
  id: string;
  placeholder: string;
  /** Expected identifier after normalize (and optional quote strip). */
  expected: string;
  /** Dict-key style: accept `"priority"` or `priority`. */
  stripQuotes?: boolean;
}

interface CodeFillTaskBase {
  mode: CodeFillMode;
  title: string;
  description: string;
  checkLabel: string;
  passLabel: string;
}

/**
 * Mission 05: deterministic if/else fill — no AI on RUN.
 * Player completes blanks in a mostly-written snippet — no sandbox.
 */
export interface LogicCodeFillTask extends CodeFillTaskBase {
  mode: "logic";
  /** Code before the dict-key blank (ends with `result["`). */
  prefix: string;
  /** Code between the key blank and the condition blank. */
  middle: string;
  /** Code after the condition blank (starts with `:`). */
  suffix: string;
  keyPlaceholder: string;
  conditionPlaceholder: string;
  /** Expected dict key (e.g. priority) — quotes optional in the blank. */
  expectedKey: string;
  trueRoute: string;
  falseRoute: string;
  compareVariable: string;
  compareValue: string;
}

/**
 * Mission 06: wire `ai.ask` + parse + read key — then real Gemini on RUN.
 * `segments.length === blanks.length + 1` (code around each blank).
 */
export interface AiIntegrationCodeFillTask extends CodeFillTaskBase {
  mode: "ai-integration";
  segments: string[];
  blanks: CodeFillBlank[];
  /** Fixed instruction sent to the model (not a prompting exercise). */
  providedInstruction: string;
  trueRoute: string;
  falseRoute: string;
  compareValue: string;
}

export type CodeFillTask = LogicCodeFillTask | AiIntegrationCodeFillTask;

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
  /** Mission 0 style onboarding (no playground) */
  intro?: MissionIntroContent;
  allowedOutputs?: string[];
  /** When set, tests use structured multi-field validation */
  outputSchema?: StructuredOutputSchema;
  /**
   * Optional deterministic micro-task (e.g. Mission 04 JSON repair).
   * Graded separately from the AI instruction — no prompt-template matching.
   */
  payloadRepair?: PayloadRepairTask;
  /**
   * Optional code fill-in (Mission 05 logic / Mission 06 ai-integration).
   * Mode is on `codeFill.mode` — do not infer AI vs logic from presence alone.
   */
  codeFill?: CodeFillTask;
  /**
   * Tests: prompt missions use messages + expected labels/fields;
   * `logic` fill uses priority fixtures → route;
   * `ai-integration` uses customer messages → route after real model JSON.
   */
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
  bestStreak: number;
  completedMissions: string[];
  unlockedMissions: string[];
  /** Proto skill ids (e.g. structured-output-1) */
  unlockedSkills: string[];
  /** Project MILDRED capability ids now ONLINE */
  unlockedCapabilities: string[];
  lastPlayedAt: string | null;
  /** Last mission the player opened (QoL / Continue) */
  lastPlayedMissionId: string | null;
  equippedTitleId: string | null;
  unlockedTitleIds: string[];
  equippedFrameId: string;
  unlockedFrameIds: string[];
  unlockedAchievementIds: string[];
  /** Local learning activity, stored as YYYY-MM-DD entries. */
  activityDates: string[];
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
  /** JSON missions: raw output parsed as a JSON object */
  jsonOk?: boolean;
  /** JSON missions: exact required keys, no extras, values in allow-list */
  fieldsOk?: boolean;
  /** Beginner-friendly JSON parse failure code for i18n */
  jsonErrorCode?:
    | "trailing_comma"
    | "unquoted_keys"
    | "single_quotes"
    | "prose_wrapper"
    | "unclosed"
    | "not_object"
    | "extra_fields"
    | "wrong_keys"
    | "invalid_values"
    | "generic";
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
