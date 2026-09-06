export type SentimentLabel = "POSITIF" | "NEUTRE" | "NEGATIF";

export type MissionStatus = "locked" | "available" | "completed";

export type MissionKind = "standard" | "boss" | "coming-soon";

export interface ClassificationTest {
  id: string;
  message: string;
  expected: SentimentLabel;
}

export interface MissionHint {
  level: number;
  title: string;
  body: string;
  /** Si true, le contenu peut être enrichi par l'IA */
  aiAssisted?: boolean;
}

export interface DiscoveredConcept {
  id: string;
  label: string;
  explanation: string;
}

export interface MissionBriefingContent {
  welcomeTitle: string;
  welcomeParagraphs: string[];
  roleHighlight: string;
  roleDetails: string[];
  systemNote: string;
  flowSteps: string[];
  flowCaption: string;
  assignmentIntro: string;
  categories: string[];
  assignmentNote: string;
  taskSteps: string[];
  taskReminder: string;
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
  allowedOutputs?: SentimentLabel[];
  tests?: ClassificationTest[];
  hints?: MissionHint[];
  concepts?: DiscoveredConcept[];
}

export interface KingdomDefinition {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  missionIds: string[];
}

export interface PlayerProgress {
  xp: number;
  level: number;
  streak: number;
  completedMissions: string[];
  unlockedMissions: string[];
  lastPlayedAt: string | null;
}

export interface ClassificationResult {
  raw: string;
  normalized: string | null;
  isValidCategory: boolean;
  matchesExpected: boolean;
  expected: SentimentLabel;
  message: string;
  testId: string;
}

export interface TestSuiteSummary {
  passed: number;
  total: number;
  results: ClassificationResult[];
  feedback: string;
  allPassed: boolean;
}
