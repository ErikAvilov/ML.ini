"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissionIntro } from "@/components/mission/MissionIntro";
import { MissionBriefing } from "@/components/mission/MissionBriefing";
import { MissionChromeBar } from "@/components/mission/MissionChromeBar";
import { MissionRouteProvider, useMissionRoutes } from "@/components/mission/MissionRouteProvider";
import { WorkspaceHost } from "@/components/mission/workspace/WorkspaceHost";
import type { SuccessToastData } from "@/components/mission/SuccessToast";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { useEffectiveProgress } from "@/lib/use-effective-progress";
import { getMissionStatus } from "@/lib/progression";
import {
  buildCelebrationsAfterMission,
  type ProgressionCelebration,
  type ProgressionReward,
} from "@/lib/progression-celebrations";
import {
  loadMissionDraft,
  saveMissionDraft,
} from "@/lib/persistence/mission-drafts";
import {
  evaluateMissionTest,
  evaluateLogicRoute,
  evaluateAiIntegrationRun,
  evaluateServiceActionRun,
  summarizeSuite,
} from "@/lib/validation";
import {
  emptyConnections,
  pipelineResultToClassification,
  simulatePipeline,
} from "@/lib/missions/pipeline";
import {
  readSessionSolution,
  requestCloudCompletion,
} from "@/lib/missions/cloud-completion-client";
import {
  resolveMissionRoutes,
  type MissionRouteInput,
} from "@/lib/missions/mission-routes";
import { resolveWorkspaceKind } from "@/lib/missions/resolve-workspace-kind";
import { useLocale } from "@/i18n/locale-context";
import { getMissionBySlug, getMissions } from "@/data/missions";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import type {
  ClassificationResult,
  ClassificationTest,
  MissionDefinition,
  PipelineConnections,
  SafetyReasonCode,
  SafetyRuleConfig,
  SafetyTask,
} from "@/lib/types";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";
import type { AuthIdentity } from "@/lib/auth/types";

const PIPELINE_CONN_PREFIX = "mlini-pipeline-conn-v1:";
const PIPELINE_PASS_PREFIX = "mlini-pipeline-pass-v1:";
const SAFETY_CFG_PREFIX = "mlini-safety-cfg-v1:";
const SAFETY_PASS_PREFIX = "mlini-safety-pass-v1:";
const BOSS_STEP_PREFIX = "mlini-boss-step-v1:";
const BOSS_PROMPT_PASS_PREFIX = "mlini-boss-prompt-v1:";

const SAFETY_REASON_CODES: ReadonlySet<string> = new Set([
  "INVALID_AI_OUTPUT",
  "INVALID_PRIORITY",
  "ACTION_FAILED",
]);

function defaultSafetyConfig(task: SafetyTask): SafetyRuleConfig {
  return {
    onParseFail: {
      target: "MANUAL_REVIEW",
      reason: task.parseFailReasons[0] ?? "INVALID_AI_OUTPUT",
    },
    onInvalidPriority: {
      target: "MANUAL_REVIEW",
      reason: task.invalidPriorityReasons[0] ?? "INVALID_PRIORITY",
    },
    onActionFail: {
      target: "MANUAL_REVIEW",
      reason: task.actionFailReasons[0] ?? "ACTION_FAILED",
    },
  };
}

function loadPipelineConnections(
  missionId: string,
  task: NonNullable<MissionDefinition["pipeline"]>
): PipelineConnections {
  const base = emptyConnections(task);
  if (typeof window === "undefined") return base;
  try {
    const raw = sessionStorage.getItem(PIPELINE_CONN_PREFIX + missionId);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as PipelineConnections;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

function loadSafetyConfig(
  missionId: string,
  task: SafetyTask
): SafetyRuleConfig {
  const base = defaultSafetyConfig(task);
  if (typeof window === "undefined") return base;
  try {
    const raw = sessionStorage.getItem(SAFETY_CFG_PREFIX + missionId);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as SafetyRuleConfig) };
  } catch {
    return base;
  }
}

const SuccessToast = dynamic(
  () =>
    import("@/components/mission/SuccessToast").then((m) => m.SuccessToast),
  { ssr: false }
);

const ProgressionPopup = dynamic(
  () =>
    import("@/components/progression/ProgressionPopup").then(
      (m) => m.ProgressionPopup
    ),
  { ssr: false }
);

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type MobileTab = "brief" | "workspace";

interface MissionWorkspaceProps {
  missionSlug: string;
  isAuthenticated?: boolean;
  identity?: AuthIdentity | null;
  /** Serializable routing — defaults to legacy `/missions` + `/royaume`. */
  routes?: MissionRouteInput;
}

export function MissionWorkspace({
  missionSlug,
  isAuthenticated = false,
  identity = null,
  routes: routesInput,
}: MissionWorkspaceProps) {
  const routes = useMemo(
    () => resolveMissionRoutes(routesInput),
    // routesInput is a small serializable plain object from the server page
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chrome + kingdomId are the identity
    [routesInput?.chrome, routesInput?.kingdomId]
  );

  return (
    <MissionRouteProvider value={routes}>
      <MissionWorkspaceInner
        missionSlug={missionSlug}
        isAuthenticated={isAuthenticated}
        identity={identity}
      />
    </MissionRouteProvider>
  );
}

function MissionWorkspaceInner({
  missionSlug,
  isAuthenticated = false,
  identity = null,
}: Omit<MissionWorkspaceProps, "routes">) {
  const { progress, ready, authStatus, identity: liveIdentity } =
    useEffectiveProgress();
  const { locale, messages } = useLocale();
  const routes = useMissionRoutes();
  const resolvedAuth =
    authStatus === "authenticated"
      ? true
      : authStatus === "anonymous"
        ? false
        : isAuthenticated;
  const resolvedIdentity =
    authStatus === "authenticated"
      ? liveIdentity ?? identity
      : authStatus === "anonymous"
        ? null
        : identity;

  const missions = useMemo(() => getMissions(locale), [locale]);
  const mission = useMemo(
    () => getMissionBySlug(missionSlug, locale),
    [missionSlug, locale]
  );

  const nextMissionId = useMemo(() => {
    if (!mission) return null;
    return missions.find((m) => m.order === mission.order + 1)?.id ?? null;
  }, [mission, missions]);

  if (!mission) {
    return null;
  }

  const status = ready
    ? getMissionStatus(mission.id, progress, mission.order)
    : mission.order === 0
      ? "available"
      : "locked";

  if (status === "locked" || !mission.playable) {
    const sorted = [...missions].sort((a, b) => a.order - b.order);
    const prior = sorted.find((m) => m.order === mission.order - 1);
    const lockedCopy =
      status === "locked" && prior
        ? messages.missionLockedCompletePrev.replace(
            "{order}",
            String(prior.order).padStart(2, "0")
          )
        : status === "locked"
          ? messages.missionLocked
          : (mission.comingSoonMessage ?? messages.missionComingSoon);

    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <MissionChromeBar
          mission={mission}
          missions={missions}
          identity={resolvedIdentity}
        />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="max-w-md text-center">
            {status === "locked" && (
              <Lock className="mx-auto mb-3 h-7 w-7 text-mist" />
            )}
            <p className="font-mono text-[10px] tracking-[0.2em] text-mist uppercase">
              Mission {mission.order}
            </p>
            <h1 className="mt-2 font-display text-2xl text-fog">
              {mission.title}
            </h1>
            <p className="mt-3 text-sm text-mist">{lockedCopy}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {prior && (
                <Link href={routes.missionHref(prior.slug)}>
                  <Button variant="secondary">{messages.prevMission}</Button>
                </Link>
              )}
              <Link href={routes.kingdomHref}>
                <Button variant="primary">{messages.backToKingdom}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mission.kind === "intro") {
    return (
      <MissionIntro
        key={`${locale}-${mission.id}`}
        mission={mission}
        missions={missions}
        nextMissionId={nextMissionId}
        isAuthenticated={resolvedAuth}
        identity={resolvedIdentity}
      />
    );
  }

  const workspaceKind = resolveWorkspaceKind(mission).kind;
  if (workspaceKind === "unsupported") {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[MissionWorkspace] unsupported workspace kind",
        mission.id
      );
    }
  }

  return (
    <MissionSession
      key={`${locale}-${mission.id}`}
      mission={mission}
      missions={missions}
      nextMissionId={nextMissionId}
      locale={locale}
      messages={messages}
      isAuthenticated={resolvedAuth}
      identity={resolvedIdentity}
    />
  );
}

interface MissionSessionProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  nextMissionId: string | null;
  locale: Locale;
  messages: CommonMessages;
  isAuthenticated: boolean;
  identity?: AuthIdentity | null;
}

function MissionSession({
  mission,
  missions,
  nextMissionId,
  locale,
  messages,
  isAuthenticated,
  identity = null,
}: MissionSessionProps) {
  const router = useRouter();
  const routes = useMissionRoutes();
  const {
    progress,
    completeMissionAndUnlock,
    markMissionPlayed,
    equipTitle,
    equipFrame,
  } = useEffectiveProgress();
  const alreadyCleared = progress.completedMissions.includes(mission.id);
  const kingdom = useMemo(
    () => createKingdomConstruireAvecIA(locale),
    [locale]
  );
  const [bossStep, setBossStep] = useState(() => {
    if (!mission.boss) return 0;
    if (typeof window === "undefined") return 0;
    try {
      const raw = sessionStorage.getItem(BOSS_STEP_PREFIX + mission.id);
      const n = raw ? Number(raw) : 0;
      return Number.isFinite(n)
        ? Math.max(0, Math.min(n, mission.boss.steps.length - 1))
        : 0;
    } catch {
      return 0;
    }
  });
  const [promptStepPassed, setPromptStepPassed] = useState(() => {
    if (!mission.boss) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(BOSS_PROMPT_PASS_PREFIX + mission.id) === "1";
    } catch {
      return false;
    }
  });

  const tests = useMemo(() => {
    if (mission.boss && bossStep === 0) {
      return mission.boss.promptTests;
    }
    // Step 1: connection check only — no run suite.
    if (mission.boss && bossStep === 1) {
      return [];
    }
    return mission.tests ?? [];
  }, [mission.boss, mission.tests, bossStep]);

  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const cloudSavingRef = useRef(false);
  const showcase =
    mission.showcaseMessage ?? tests[0]?.message ?? "";
  const nextMission = nextMissionId
    ? missions.find((m) => m.id === nextMissionId) ?? null
    : null;

  const [instruction, setInstruction] = useState(() => {
    if (typeof window === "undefined") return "";
    const fill = mission.codeFill;
    if (fill?.mode === "ai-integration") return fill.providedInstruction;
    return loadMissionDraft(mission.id);
  });
  const [repairPassed, setRepairPassed] = useState(() => {
    if (!mission.payloadRepair) return true;
    if (typeof window === "undefined") return false;
    try {
      return (
        sessionStorage.getItem(`mlini-payload-repair-v1:${mission.id}`) === "1"
      );
    } catch {
      return false;
    }
  });
  const [repairGateActive, setRepairGateActive] = useState(false);
  const [codeFillPassed, setCodeFillPassed] = useState(() => {
    if (!mission.codeFill) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(`mlini-code-fill-v2:${mission.id}`) === "1";
    } catch {
      return false;
    }
  });
  const [pipelineConnections, setPipelineConnections] =
    useState<PipelineConnections>(() =>
      mission.pipeline
        ? loadPipelineConnections(mission.id, mission.pipeline)
        : {}
    );
  const [pipelinePassed, setPipelinePassed] = useState(() => {
    if (!mission.pipeline) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(PIPELINE_PASS_PREFIX + mission.id) === "1";
    } catch {
      return false;
    }
  });
  const [safetyConfig, setSafetyConfig] = useState<SafetyRuleConfig | undefined>(
    () =>
      mission.safety ? loadSafetyConfig(mission.id, mission.safety) : undefined
  );
  const [safetyPassed, setSafetyPassed] = useState(() => {
    if (!mission.safety) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SAFETY_PASS_PREFIX + mission.id) === "1";
    } catch {
      return false;
    }
  });
  const [activeMessage, setActiveMessage] = useState(showcase);
  const [liveOutput, setLiveOutput] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSpeaker, setFeedbackSpeaker] = useState<"mira" | null>(null);
  const [running, setRunning] = useState(false);
  const [runMode, setRunMode] = useState<"idle" | "sequential" | "batch">(
    "idle"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [systemError, setSystemError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<SuccessToastData | null>(
    null
  );
  const [celebrationQueue, setCelebrationQueue] = useState<
    ProgressionCelebration[]
  >([]);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("brief");

  const activeCelebration = celebrationQueue[0] ?? null;

  const runningRef = useRef(running);
  const instructionRef = useRef(instruction);
  const repairPassedRef = useRef(repairPassed);
  const codeFillPassedRef = useRef(codeFillPassed);
  const pipelinePassedRef = useRef(pipelinePassed);
  const safetyPassedRef = useRef(safetyPassed);
  const pipelineConnectionsRef = useRef(pipelineConnections);
  const safetyConfigRef = useRef(safetyConfig);
  const resultsRef = useRef(results);
  const handleRunRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    runningRef.current = running;
    instructionRef.current = instruction;
  }, [running, instruction]);

  useEffect(() => {
    repairPassedRef.current = repairPassed;
  }, [repairPassed]);

  useEffect(() => {
    codeFillPassedRef.current = codeFillPassed;
  }, [codeFillPassed]);

  useEffect(() => {
    pipelinePassedRef.current = pipelinePassed;
  }, [pipelinePassed]);

  useEffect(() => {
    safetyPassedRef.current = safetyPassed;
  }, [safetyPassed]);

  useEffect(() => {
    pipelineConnectionsRef.current = pipelineConnections;
  }, [pipelineConnections]);

  useEffect(() => {
    safetyConfigRef.current = safetyConfig;
  }, [safetyConfig]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    markMissionPlayed(mission.id);
  }, [mission.id, markMissionPlayed]);

  useEffect(() => {
    if (
      mission.codeFill?.mode === "ai-integration" ||
      mission.codeFill?.mode === "service-action" ||
      (mission.pipeline && !mission.boss)
    ) {
      return;
    }
    saveMissionDraft(mission.id, instruction);
  }, [mission.id, mission.codeFill, mission.pipeline, mission.boss, instruction]);

  const workspace = resolveWorkspaceKind(mission);
  const fillMode =
    workspace.kind === "code-fill" ? workspace.codeFillMode ?? null : null;
  const isLogic = fillMode === "logic";
  const isAiIntegration = fillMode === "ai-integration";
  const isServiceAction = fillMode === "service-action";
  const isPipeline = workspace.kind === "pipeline";
  const isBoss = workspace.kind === "boss";
  const isBossPrompt = isBoss && bossStep === 0;
  const isBossPipeline = isBoss && bossStep >= 1;
  const isPipelineRun = isPipeline || isBossPipeline;
  const isDeterministicFill = isLogic || isServiceAction || isPipelineRun;
  const outputSchema =
    isBossPrompt && mission.boss
      ? mission.boss.promptSchema
      : mission.outputSchema;

  async function runClassify(message: string, opts?: { retry?: boolean }) {
    const instructionForCall =
      isAiIntegration && mission.codeFill?.mode === "ai-integration"
        ? mission.codeFill.providedInstruction
        : instructionRef.current;
    const instruction =
      opts?.retry && isAiIntegration
        ? `${instructionForCall}\n\nCRITICAL RETRY — previous response was not valid JSON.\nReturn ONLY one JSON object. Start with { and end with }.\nNo Markdown. No code fences. No prose.`
        : instructionForCall;
    const res = await fetch("/api/ai/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction,
        message,
        locale,
        expectJson: isAiIntegration,
      }),
    });
    const data = (await res.json()) as { output?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error || messages.apiError);
    }
    return data.output ?? "";
  }

  function handleCelebrationContinue() {
    const rest = celebrationQueue.slice(1);
    setCelebrationQueue(rest);
  }

  function handleEquipReward(reward: ProgressionReward) {
    if (reward.type === "title") equipTitle(reward.id);
    if (reward.type === "profile-frame") equipFrame(reward.id);
  }

  function grantMissionSuccess() {
    const before = progress;
    const wasCleared = alreadyCleared;
    // Always run completeMission so the next mission is unlocked even if a
    // legacy save marked this mission completed without unlocking the next.
    const skill = mission.completion?.skillUnlocked;
    const after = completeMissionAndUnlock(
      mission.id,
      nextMissionId,
      mission.xpReward,
      {
        skillId: skill?.skillId,
        capabilityId: mission.completion?.capabilityUnlocked?.id,
      }
    );
    const xpGained = wasCleared ? 0 : mission.xpReward;
    if (!wasCleared) {
      setJustUnlocked(Boolean(nextMissionId));
    }

    const celebrations = buildCelebrationsAfterMission({
      wasCleared,
      before,
      after,
      xpGained,
      mission,
      locale,
      kingdom: {
        id: kingdom.id,
        name: kingdom.name,
        missionIds: kingdom.missionIds,
      },
    });
    setCelebrationQueue(celebrations);

    const leveledUp = !wasCleared && after.level > before.level;
    setSuccessToast({
      missionTitle: mission.title,
      xpGained,
      leveledUp,
      newLevel: leveledUp ? after.level : null,
      replay: wasCleared,
      nextMissionHref: nextMission
        ? routes.missionHref(nextMission.slug)
        : null,
      nextMissionTitle: nextMission?.shortTitle ?? nextMission?.title ?? null,
    });
  }

  async function persistCloudAfterPass(): Promise<boolean> {
    if (!isAuthenticated) return true;
    if (cloudSavingRef.current) return false;

    cloudSavingRef.current = true;
    setCloudSaving(true);
    setCloudSaveError(null);

    const sessionBits = readSessionSolution(mission.id);
    const instructionForCall =
      mission.codeFill?.mode === "ai-integration"
        ? undefined
        : instructionRef.current;

    try {
      const result = await requestCloudCompletion({
        missionId: mission.id,
        locale,
        instruction: instructionForCall,
        codeSource: sessionBits.codeSource,
        payloadRepairText: sessionBits.payloadRepairText,
        pipelineConnectionsJson: sessionBits.pipelineConnectionsJson,
        safetyConfigJson: sessionBits.safetyConfigJson,
      });

      if (result.ok) {
        return true;
      }

      if (result.kind === "anonymous") {
        return true;
      }

      // Do not unlock the next mission until cloud persistence succeeds —
      // optimistic unlock was wiped on remount and left Mission 05 locked.
      setCloudSaveError(
        result.kind === "validation"
          ? messages.cloudConfirmFailed
          : messages.cloudSaveFailed
      );
      return false;
    } finally {
      cloudSavingRef.current = false;
      setCloudSaving(false);
    }
  }

  async function tryGrantMissionSuccess() {
    if (mission.boss && bossStep !== mission.boss.steps.length - 1) {
      return;
    }
    if (mission.payloadRepair && !repairPassedRef.current) {
      setRepairGateActive(true);
      setFeedback(messages.payloadRepairRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("brief");
      queueMicrotask(() => {
        document
          .getElementById("ml-payload-repair")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setRepairGateActive(false);
    if (mission.codeFill && !codeFillPassedRef.current) {
      setFeedback(messages.codeFillRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("workspace");
      return;
    }
    if (mission.pipeline && !pipelinePassedRef.current) {
      setFeedback(messages.pipelineRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("workspace");
      return;
    }
    if (mission.safety && !safetyPassedRef.current) {
      setFeedback(messages.safetyRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("workspace");
      return;
    }
    const persisted = await persistCloudAfterPass();
    if (!persisted) return;
    grantMissionSuccess();
    // After toast/celebration state is committed — stable provider key keeps them mounted.
    router.refresh();
  }

  function persistBossStep(next: number) {
    if (!mission.boss) return;
    const clamped = Math.max(
      0,
      Math.min(next, mission.boss.steps.length - 1)
    );
    setBossStep(clamped);
    try {
      sessionStorage.setItem(BOSS_STEP_PREFIX + mission.id, String(clamped));
    } catch {
      /* ignore */
    }
    setResults([]);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setLiveOutput(null);
    setCurrentIndex(0);
    setActiveMessage(
      clamped === 0
        ? (mission.boss.promptTests[0]?.message ?? showcase)
        : (mission.tests?.[0]?.message ?? showcase)
    );
  }

  function markPromptStepPassed() {
    setPromptStepPassed(true);
    try {
      sessionStorage.setItem(BOSS_PROMPT_PASS_PREFIX + mission.id, "1");
    } catch {
      /* ignore */
    }
  }

  async function retryCloudSave() {
    if (!isAuthenticated || cloudSavingRef.current) return;
    cloudSavingRef.current = true;
    setCloudSaving(true);
    setCloudSaveError(null);
    const sessionBits = readSessionSolution(mission.id);
    const instructionForCall =
      mission.codeFill?.mode === "ai-integration"
        ? undefined
        : instructionRef.current;
    try {
      const result = await requestCloudCompletion({
        missionId: mission.id,
        locale,
        instruction: instructionForCall,
        codeSource: sessionBits.codeSource,
        payloadRepairText: sessionBits.payloadRepairText,
        pipelineConnectionsJson: sessionBits.pipelineConnectionsJson,
        safetyConfigJson: sessionBits.safetyConfigJson,
      });
      if (result.ok || result.kind === "anonymous") {
        setCloudSaveError(null);
        router.refresh();
        return;
      }
      setCloudSaveError(
        result.kind === "validation"
          ? messages.cloudConfirmFailed
          : messages.cloudSaveFailed
      );
    } finally {
      cloudSavingRef.current = false;
      setCloudSaving(false);
    }
  }

  async function handleDevComplete() {
    if (process.env.NODE_ENV !== "development" || runningRef.current) return;
    setMobileTab("workspace");
    setSystemError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setRunning(false);
    setStage("idle");
    // Seed a valid repair payload so cloud persist can succeed for M04.
    if (mission.payloadRepair) {
      const valid = `{\n  "sentiment": "NEGATIVE",\n  "priority": "URGENT"\n}`;
      try {
        sessionStorage.setItem(`mlini-payload-repair-v1:${mission.id}`, "1");
        sessionStorage.setItem(
          `mlini-payload-repair-text-v1:${mission.id}`,
          valid
        );
      } catch {
        /* ignore */
      }
      repairPassedRef.current = true;
      setRepairPassed(true);
      setRepairGateActive(false);
    }
    const persisted = await persistCloudAfterPass();
    if (!persisted) return;
    grantMissionSuccess();
    router.refresh();
  }

  function priorityFromLogicFixture(message: string): string {
    const match = message.match(/"([A-Z_]+)"/);
    return match?.[1] ?? "";
  }

  function evaluateLogicTest(
    test: (typeof tests)[number]
  ): ClassificationResult {
    const fill = mission.codeFill;
    if (!fill || fill.mode !== "logic") {
      throw new Error("logic fill required");
    }
    const priority = priorityFromLogicFixture(test.message);
    const route = evaluateLogicRoute(
      priority,
      fill.compareValue,
      fill.trueRoute,
      fill.falseRoute
    );
    const matches = route === test.expected;
    return {
      raw: route,
      normalized: route,
      isValidCategory: true,
      matchesExpected: matches,
      expected: test.expected,
      message: test.message,
      testId: test.id,
      failHint: matches ? undefined : test.failHint,
    };
  }

  function evaluateAiIntegrationTest(
    raw: string,
    test: (typeof tests)[number]
  ): ClassificationResult {
    const fill = mission.codeFill;
    if (!fill || fill.mode !== "ai-integration") {
      throw new Error("ai-integration fill required");
    }
    return evaluateAiIntegrationRun(raw, test, {
      compareValue: fill.compareValue,
      trueRoute: fill.trueRoute,
      falseRoute: fill.falseRoute,
    });
  }

  function evaluateServiceActionTest(
    test: (typeof tests)[number]
  ): ClassificationResult {
    const fill = mission.codeFill;
    if (!fill || fill.mode !== "service-action") {
      throw new Error("service-action fill required");
    }
    return evaluateServiceActionRun(test, { humanRoute: fill.humanRoute });
  }

  function evaluatePipelineTest(test: ClassificationTest): ClassificationResult {
    const pipe = mission.pipeline;
    if (!pipe) throw new Error("pipeline required");
    const fixture = test.serviceFixture;
    const expectedIsFallback = SAFETY_REASON_CODES.has(test.expected);
    const sim = simulatePipeline({
      connections: pipelineConnectionsRef.current,
      message: test.message,
      aiResponse: fixture?.aiResponse ?? "",
      urgentPriority: pipe.urgentPriority,
      humanRoute: pipe.humanRoute,
      queueRoute: pipe.queueRoute,
      safety:
        mission.safety && (!isBoss || bossStep >= 2)
          ? safetyConfigRef.current ?? null
          : null,
      forceActionFailure: fixture?.forceActionFailure,
      expectedAction: expectedIsFallback ? undefined : test.expected,
      expectedFallback: expectedIsFallback
        ? (test.expected as SafetyReasonCode)
        : null,
    });
    return pipelineResultToClassification(test, sim);
  }

  async function handleRun() {
    if (runningRef.current || tests.length === 0) return;
    if (isLogic || isAiIntegration || isServiceAction) {
      if (!codeFillPassedRef.current) {
        setFeedback(messages.codeFillRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
    } else if (isPipelineRun) {
      if (!pipelinePassedRef.current) {
        setFeedback(messages.pipelineRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
      if (
        (isPipeline && mission.safety && !safetyPassedRef.current) ||
        (isBoss && bossStep >= 2 && !safetyPassedRef.current)
      ) {
        setFeedback(messages.safetyRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
    } else if (!instructionRef.current.trim()) {
      return;
    }

    setMobileTab("workspace");
    setRunning(true);
    setRunMode("sequential");
    setSystemError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setResults([]);
    setLiveOutput(null);
    setSuccessToast(null);

    const collected: ClassificationResult[] = [];
    const fast = isDeterministicFill;

    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        setCurrentIndex(i);
        setActiveMessage(test.message);
        setStage("input");
        await wait(fast ? 180 : 280);
        setStage("instruction");
        await wait(fast ? 160 : 320);
        setStage("model");

        let evaluated: ClassificationResult;
        if (isLogic) {
          await wait(120);
          evaluated = evaluateLogicTest(test);
        } else if (isServiceAction) {
          await wait(120);
          evaluated = evaluateServiceActionTest(test);
        } else if (isPipelineRun) {
          await wait(120);
          evaluated = evaluatePipelineTest(test);
        } else if (isAiIntegration) {
          // One model call; one controlled retry if JSON is malformed.
          let output = await runClassify(test.message);
          setLiveOutput(output);
          evaluated = evaluateAiIntegrationTest(output, test);
          if (evaluated.errorKind === "system") {
            output = await runClassify(test.message, { retry: true });
            setLiveOutput(output);
            evaluated = evaluateAiIntegrationTest(output, test);
          }
        } else {
          const output = await runClassify(test.message);
          setLiveOutput(output);
          evaluated = evaluateMissionTest(
            output,
            test,
            mission.allowedOutputs ?? [],
            outputSchema
          );
        }
        setLiveOutput(
          isServiceAction || isPipelineRun
            ? evaluated.raw
            : (evaluated.normalized ?? evaluated.raw)
        );
        setStage("output");
        collected.push(evaluated);
        setResults([...collected]);
        await wait(fast ? 280 : 450);
      }

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.hasSystemError) {
        setSystemError(messages.systemErrorInvalidAiJson);
      }

      if (summary.allPassed) {
        if (isBossPrompt) {
          markPromptStepPassed();
          setFeedback(messages.bossPromptPassed);
          setFeedbackSpeaker("mira");
        } else if (!isBoss || bossStep >= 2) {
          void tryGrantMissionSuccess();
        }
      }
    } catch (err) {
      setSystemError(
        err instanceof Error ? err.message : messages.genericError
      );
      setStage("idle");
    } finally {
      setRunning(false);
      setRunMode("idle");
      setStage("idle");
    }
  }

  useEffect(() => {
    handleRunRef.current = handleRun;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const metaEnter =
        (e.metaKey || e.ctrlKey) && e.key === "Enter" && !e.altKey;
      if (metaEnter) {
        e.preventDefault();
        void handleRunRef.current();
        return;
      }

      if (e.altKey && !e.metaKey && !e.ctrlKey && e.key === "ArrowLeft") {
        const sorted = [...missions].sort((a, b) => a.order - b.order);
        const prev = sorted.find((m) => m.order === mission.order - 1);
        if (!prev) return;
        const st = getMissionStatus(prev.id, progress, prev.order);
        if (st === "locked") return;
        e.preventDefault();
        router.push(routes.missionHref(prev.slug));
        return;
      }

      if (e.altKey && !e.metaKey && !e.ctrlKey && e.key === "ArrowRight") {
        const sorted = [...missions].sort((a, b) => a.order - b.order);
        const next = sorted.find((m) => m.order === mission.order + 1);
        if (!next) return;
        const st = getMissionStatus(next.id, progress, next.order);
        if (st === "locked") return;
        e.preventDefault();
        router.push(routes.missionHref(next.slug));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mission.order, missions, progress, router, routes]);

  async function handleRunBatch() {
    if (running || tests.length === 0) return;
    if (isLogic || isAiIntegration || isServiceAction) {
      if (!codeFillPassedRef.current) {
        setFeedback(messages.codeFillRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
    } else if (isPipelineRun) {
      if (!pipelinePassedRef.current) {
        setFeedback(messages.pipelineRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
      if (
        (isPipeline && mission.safety && !safetyPassedRef.current) ||
        (isBoss && bossStep >= 2 && !safetyPassedRef.current)
      ) {
        setFeedback(messages.safetyRequired);
        setFeedbackSpeaker("mira");
        setMobileTab("workspace");
        return;
      }
    } else if (!instruction.trim()) {
      return;
    }

    setMobileTab("workspace");
    setRunning(true);
    setRunMode("batch");
    setSystemError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setResults([]);
    setLiveOutput(null);
    setSuccessToast(null);
    setCurrentIndex(0);
    setActiveMessage(showcase);
    setStage("model");

    try {
      let collected: ClassificationResult[];

      if (isLogic) {
        await wait(280);
        collected = tests.map((test) => evaluateLogicTest(test));
      } else if (isServiceAction) {
        await wait(280);
        collected = tests.map((test) => evaluateServiceActionTest(test));
      } else if (isPipelineRun) {
        await wait(280);
        collected = tests.map((test) => evaluatePipelineTest(test));
      } else {
        const instructionForCall =
          isAiIntegration && mission.codeFill?.mode === "ai-integration"
            ? mission.codeFill.providedInstruction
            : instruction;
        const res = await fetch("/api/ai/classify-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction: instructionForCall,
            locale,
            tests: tests.map((t) => ({ id: t.id, message: t.message })),
          }),
        });
        const data = (await res.json()) as {
          results?: Array<{ testId: string; rawOutput: string }>;
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || messages.apiError);
        }

        const byId = new Map(
          (data.results ?? []).map((r) => [r.testId, r.rawOutput] as const)
        );

        collected = tests.map((test) => {
          const output = byId.get(test.id) ?? "";
          if (isAiIntegration) {
            return evaluateAiIntegrationTest(output, test);
          }
          return evaluateMissionTest(
            output,
            test,
            mission.allowedOutputs ?? [],
            outputSchema
          );
        });

        // One controlled retry for malformed model JSON (Mission 06 only).
        if (isAiIntegration) {
          const malformed = collected.filter((r) => r.errorKind === "system");
          for (const result of malformed) {
            const test = tests.find((t) => t.id === result.testId);
            if (!test) continue;
            const output = await runClassify(test.message, { retry: true });
            byId.set(test.id, output);
          }
          if (malformed.length > 0) {
            collected = tests.map((test) =>
              evaluateAiIntegrationTest(byId.get(test.id) ?? "", test)
            );
          }
        }
      }

      const last =
        collected[collected.length - 1] ?? null;
      setLiveOutput(
        isPipelineRun ? (last?.raw ?? null) : (last?.normalized ?? last?.raw ?? null)
      );
      setStage("output");
      setResults(collected);
      setCurrentIndex(Math.max(0, tests.length - 1));

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.hasSystemError) {
        setSystemError(messages.systemErrorInvalidAiJson);
      }

      if (summary.allPassed) {
        if (isBossPrompt) {
          markPromptStepPassed();
          setFeedback(messages.bossPromptPassed);
          setFeedbackSpeaker("mira");
        } else if (!isBoss || bossStep >= 2) {
          void tryGrantMissionSuccess();
        }
      }
    } catch (err) {
      setSystemError(
        err instanceof Error ? err.message : messages.genericError
      );
      setStage("idle");
    } finally {
      setRunning(false);
      setRunMode("idle");
      setStage("idle");
    }
  }

  const dismissSuccessToast = useCallback(() => {
    setSuccessToast(null);
  }, []);

  function onRepairPassedChange(passed: boolean) {
    setRepairPassed(passed);
    repairPassedRef.current = passed;
    if (!passed || !mission.payloadRepair) {
      if (!passed) setRepairGateActive(true);
      return;
    }
    setRepairGateActive(false);
    const latest = resultsRef.current;
    if (
      latest.length !== tests.length ||
      tests.length === 0 ||
      !latest.every((r) => r.matchesExpected)
    ) {
      return;
    }
    queueMicrotask(() => void tryGrantMissionSuccess());
  }

  function onCodeFillPassedChange(passed: boolean) {
    setCodeFillPassed(passed);
    codeFillPassedRef.current = passed;
    if (!passed || !mission.codeFill) return;
    const latest = resultsRef.current;
    if (
      latest.length !== tests.length ||
      tests.length === 0 ||
      !latest.every((r) => r.matchesExpected)
    ) {
      return;
    }
    queueMicrotask(() => void tryGrantMissionSuccess());
  }

  function onPipelinePassedChange(passed: boolean) {
    setPipelinePassed(passed);
    pipelinePassedRef.current = passed;
    if (!passed || !mission.pipeline) return;
    if (isBoss) return;
    if (mission.safety && !safetyPassedRef.current) return;
    const latest = resultsRef.current;
    if (
      latest.length !== tests.length ||
      tests.length === 0 ||
      !latest.every((r) => r.matchesExpected)
    ) {
      return;
    }
    queueMicrotask(() => void tryGrantMissionSuccess());
  }

  function onSafetyPassedChange(passed: boolean) {
    setSafetyPassed(passed);
    safetyPassedRef.current = passed;
    if (!passed || !mission.safety) return;
    if (isBoss) return;
    if (!pipelinePassedRef.current) return;
    const latest = resultsRef.current;
    if (
      latest.length !== tests.length ||
      tests.length === 0 ||
      !latest.every((r) => r.matchesExpected)
    ) {
      return;
    }
    queueMicrotask(() => void tryGrantMissionSuccess());
  }

  function onPipelineConnectionsChange(next: PipelineConnections) {
    setPipelineConnections(next);
    pipelineConnectionsRef.current = next;
  }

  function onSafetyConfigChange(next: SafetyRuleConfig) {
    setSafetyConfig(next);
    safetyConfigRef.current = next;
  }

  return (
    <MotionProvider>
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MissionChromeBar
        mission={mission}
        missions={missions}
        identity={identity}
      />

      <div className="flex shrink-0 border-b border-ml-border bg-ml-surface-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("brief")}
          className={`flex-1 cursor-pointer py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "brief"
              ? "border-b-2 border-ml-state-active text-ml-text-primary"
              : "text-ml-text-muted hover:bg-ml-surface-hover hover:text-ml-text-primary"
          }`}
        >
          {messages.briefTab}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("workspace")}
          className={`flex-1 cursor-pointer py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "workspace"
              ? "border-b-2 border-ml-state-active text-ml-text-primary"
              : "text-ml-text-muted hover:bg-ml-surface-hover hover:text-ml-text-primary"
          }`}
        >
          {messages.workspaceTab}
        </button>
      </div>

      <div
        className={`grid min-h-0 flex-1 ${
          fillMode || isPipeline || isBoss
            ? "lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]"
            : "lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]"
        }`}
      >
        <aside
          className={`ml-mission-learn min-h-0 min-w-0 overflow-y-auto border-r border-ml-border px-4 py-4 sm:px-5 sm:py-5 ${
            mobileTab === "brief" ? "block" : "hidden lg:block"
          }`}
        >
          {mission.briefing && (
            <MissionBriefing
              briefing={mission.briefing}
              missionTitle={mission.title}
              missionOrder={mission.order}
              alreadyCleared={alreadyCleared}
              hints={mission.hints ?? []}
              instruction={instruction}
              objective={mission.objective}
              missionId={mission.id}
              payloadRepair={mission.payloadRepair}
              outputSchema={outputSchema}
              repairPassed={repairPassed}
              onRepairPassedChange={onRepairPassedChange}
              repairGateActive={repairGateActive}
            />
          )}
        </aside>

        <section
          className={`min-h-0 min-w-0 ${
            mobileTab === "workspace" ? "block" : "hidden lg:block"
          } ${mobileTab === "workspace" ? "overflow-y-auto lg:overflow-hidden" : "overflow-hidden"}`}
        >
          <WorkspaceHost
            mission={mission}
            showcaseMessage={showcase}
            activeMessage={activeMessage}
            instruction={instruction}
            onInstructionChange={setInstruction}
            onRun={handleRun}
            onRunBatch={handleRunBatch}
            onDevComplete={
              process.env.NODE_ENV === "development"
                ? handleDevComplete
                : undefined
            }
            running={running}
            runMode={runMode}
            stage={stage}
            liveOutput={liveOutput}
            results={results}
            feedback={feedback}
            feedbackSpeaker={feedbackSpeaker}
            currentIndex={currentIndex}
            testCount={tests.length}
            error={systemError}
            justUnlocked={justUnlocked}
            showSuccess={
              Boolean(successToast) || Boolean(activeCelebration)
            }
            codeFillPassed={codeFillPassed}
            onCodeFillPassedChange={onCodeFillPassedChange}
            pipelineConnections={pipelineConnections}
            onPipelineConnectionsChange={onPipelineConnectionsChange}
            pipelinePassed={pipelinePassed}
            onPipelinePassedChange={onPipelinePassedChange}
            safetyConfig={safetyConfig}
            onSafetyConfigChange={
              mission.safety ? onSafetyConfigChange : undefined
            }
            safetyPassed={safetyPassed}
            onSafetyPassedChange={
              mission.safety ? onSafetyPassedChange : undefined
            }
            bossStep={bossStep}
            onBossStepChange={persistBossStep}
            promptStepPassed={promptStepPassed}
          />
        </section>
      </div>

      {activeCelebration && (
        <ProgressionPopup
          celebration={activeCelebration}
          onContinue={handleCelebrationContinue}
          onEquipReward={handleEquipReward}
          equippedRewardId={
            activeCelebration.reward?.type === "title"
              ? progress.equippedTitleId
              : activeCelebration.reward?.type === "profile-frame"
                ? progress.equippedFrameId
                : null
          }
        />
      )}

      {cloudSaveError && (
        <div className="pointer-events-auto fixed bottom-4 left-1/2 z-50 w-[min(28rem,calc(100%-1.5rem))] -translate-x-1/2 border border-ml-danger/50 bg-ml-surface-1 px-4 py-3 shadow-lg"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="text-[length:var(--ml-text-sm)] text-ml-danger">
            {cloudSaveError}
          </p>
          <button
            type="button"
            disabled={cloudSaving}
            onClick={() => void retryCloudSave()}
            className="mt-2 font-mono text-[11px] tracking-[0.08em] text-ml-accent uppercase hover:text-ml-accent-bright disabled:opacity-50"
          >
            {cloudSaving ? messages.cloudSaving : messages.cloudRetrySave}
          </button>
        </div>
      )}

      <SuccessToast
        data={successToast}
        onDismiss={dismissSuccessToast}
      />
    </div>
    </MotionProvider>
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
