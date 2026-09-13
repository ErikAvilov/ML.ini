"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissionIntro } from "@/components/mission/MissionIntro";
import { MissionBriefing } from "@/components/mission/MissionBriefing";
import { MissionNavBar } from "@/components/mission/MissionNavBar";
import { MissionPlayground } from "@/components/mission/MissionPlayground";
import {
  SuccessToast,
  type SuccessToastData,
} from "@/components/mission/SuccessToast";
import { ProgressionPopup } from "@/components/progression/ProgressionPopup";
import { useProgress } from "@/lib/progress-context";
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
  summarizeSuite,
} from "@/lib/validation";
import {
  readSessionSolution,
  requestCloudCompletion,
} from "@/lib/missions/cloud-completion-client";
import { useLocale } from "@/i18n/locale-context";
import { getMissionBySlug, getMissions } from "@/data/missions";
import { createKingdomConstruireAvecIA } from "@/data/kingdoms/construire-avec-ia";
import type {
  ClassificationResult,
  CodeFillMode,
  MissionDefinition,
} from "@/lib/types";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";
import type { AuthIdentity } from "@/lib/auth/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type MobileTab = "brief" | "workspace";

function resolveCodeFillMode(
  mission: MissionDefinition
): CodeFillMode | null {
  if (!mission.codeFill) return null;
  return mission.codeFill.mode;
}

interface MissionWorkspaceProps {
  missionSlug: string;
  isAuthenticated?: boolean;
  identity?: AuthIdentity | null;
}

export function MissionWorkspace({
  missionSlug,
  isAuthenticated = false,
  identity = null,
}: MissionWorkspaceProps) {
  const { progress, ready } = useProgress();
  const { locale, messages } = useLocale();

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
        <MissionNavBar
          mission={mission}
          missions={missions}
          identity={identity}
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
                <Link href={`/missions/${prior.slug}`}>
                  <Button variant="secondary">{messages.prevMission}</Button>
                </Link>
              )}
              <Link href="/royaume">
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
        isAuthenticated={isAuthenticated}
        identity={identity}
      />
    );
  }

  return (
    <MissionSession
      key={`${locale}-${mission.id}`}
      mission={mission}
      missions={missions}
      nextMissionId={nextMissionId}
      locale={locale}
      messages={messages}
      isAuthenticated={isAuthenticated}
      identity={identity}
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
  const {
    progress,
    completeMissionAndUnlock,
    markMissionPlayed,
    equipTitle,
    equipFrame,
  } = useProgress();
  const alreadyCleared = progress.completedMissions.includes(mission.id);
  const kingdom = useMemo(
    () => createKingdomConstruireAvecIA(locale),
    [locale]
  );
  const tests = mission.tests ?? [];
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
  const [codeFillPassed, setCodeFillPassed] = useState(() => {
    if (!mission.codeFill) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(`mlini-code-fill-v2:${mission.id}`) === "1";
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
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    markMissionPlayed(mission.id);
  }, [mission.id, markMissionPlayed]);

  useEffect(() => {
    if (mission.codeFill?.mode === "ai-integration") return;
    saveMissionDraft(mission.id, instruction);
  }, [mission.id, mission.codeFill, instruction]);

  const fillMode = resolveCodeFillMode(mission);
  const isLogic = fillMode === "logic";
  const isAiIntegration = fillMode === "ai-integration";

  async function runClassify(message: string) {
    const instructionForCall =
      isAiIntegration && mission.codeFill?.mode === "ai-integration"
        ? mission.codeFill.providedInstruction
        : instructionRef.current;
    const res = await fetch("/api/ai/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction: instructionForCall,
        message,
        locale,
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
      nextMissionHref: nextMission ? `/missions/${nextMission.slug}` : null,
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
      });

      if (result.ok) {
        router.refresh();
        return true;
      }

      if (result.kind === "anonymous") {
        return true;
      }

      // Validation already passed in the playground — treat server mismatch /
      // persist errors as infrastructure, not player failure.
      setCloudSaveError(
        result.kind === "validation"
          ? messages.cloudConfirmFailed
          : messages.cloudSaveFailed
      );
      return true;
    } finally {
      cloudSavingRef.current = false;
      setCloudSaving(false);
    }
  }

  async function tryGrantMissionSuccess() {
    if (mission.payloadRepair && !repairPassedRef.current) {
      setFeedback(messages.payloadRepairRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("brief");
      return;
    }
    if (mission.codeFill && !codeFillPassedRef.current) {
      setFeedback(messages.codeFillRequired);
      setFeedbackSpeaker("mira");
      setMobileTab("workspace");
      return;
    }
    await persistCloudAfterPass();
    grantMissionSuccess();
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

  function handleDevComplete() {
    if (process.env.NODE_ENV !== "development" || runningRef.current) return;
    setMobileTab("workspace");
    setSystemError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setRunning(false);
    setStage("idle");
    grantMissionSuccess();
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

  async function handleRun() {
    if (runningRef.current || tests.length === 0) return;
    if (isLogic || isAiIntegration) {
      if (!codeFillPassedRef.current) {
        setFeedback(messages.codeFillRequired);
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
    const fast = isLogic;

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
        } else if (isAiIntegration) {
          const output = await runClassify(test.message);
          setLiveOutput(output);
          evaluated = evaluateAiIntegrationTest(output, test);
        } else {
          const output = await runClassify(test.message);
          setLiveOutput(output);
          evaluated = evaluateMissionTest(
            output,
            test,
            mission.allowedOutputs ?? [],
            mission.outputSchema
          );
        }
        setLiveOutput(evaluated.normalized ?? evaluated.raw);
        setStage("output");
        collected.push(evaluated);
        setResults([...collected]);
        await wait(fast ? 280 : 450);
      }

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.allPassed) {
        void tryGrantMissionSuccess();
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
        router.push(`/missions/${prev.slug}`);
        return;
      }

      if (e.altKey && !e.metaKey && !e.ctrlKey && e.key === "ArrowRight") {
        const sorted = [...missions].sort((a, b) => a.order - b.order);
        const next = sorted.find((m) => m.order === mission.order + 1);
        if (!next) return;
        const st = getMissionStatus(next.id, progress, next.order);
        if (st === "locked") return;
        e.preventDefault();
        router.push(`/missions/${next.slug}`);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mission.order, missions, progress, router]);

  async function handleRunBatch() {
    if (running || tests.length === 0) return;
    if (isLogic || isAiIntegration) {
      if (!codeFillPassedRef.current) {
        setFeedback(messages.codeFillRequired);
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
            mission.outputSchema
          );
        });
      }

      const last =
        collected[collected.length - 1] ?? null;
      setLiveOutput(last?.normalized ?? last?.raw ?? null);
      setStage("output");
      setResults(collected);
      setCurrentIndex(Math.max(0, tests.length - 1));

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.allPassed) {
        void tryGrantMissionSuccess();
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
    if (!passed || !mission.payloadRepair) return;
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MissionNavBar
        mission={mission}
        missions={missions}
        identity={identity}
      />

      <div className="flex shrink-0 border-b border-ml-border lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("brief")}
          className={`flex-1 cursor-pointer py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "brief"
              ? "border-b-2 border-ml-accent text-ml-text"
              : "text-ml-text-muted hover:bg-ml-surface-hover hover:text-ml-text"
          }`}
        >
          {messages.briefTab}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("workspace")}
          className={`flex-1 cursor-pointer py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "workspace"
              ? "border-b-2 border-ml-accent text-ml-text"
              : "text-ml-text-muted hover:bg-ml-surface-hover hover:text-ml-text"
          }`}
        >
          {messages.workspaceTab}
        </button>
      </div>

      <div
        className={`grid min-h-0 flex-1 ${
          fillMode
            ? "lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)]"
            : "lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]"
        }`}
      >
        <aside
          className={`min-h-0 min-w-0 overflow-y-auto border-r border-ml-border bg-ml-bg-1 px-4 py-3.5 sm:px-5 sm:py-4 ${
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
              outputSchema={mission.outputSchema}
              repairPassed={repairPassed}
              onRepairPassedChange={onRepairPassedChange}
            />
          )}
        </aside>

        <section
          className={`min-h-0 min-w-0 ${
            mobileTab === "workspace" ? "block" : "hidden lg:block"
          } ${mobileTab === "workspace" ? "overflow-y-auto lg:overflow-hidden" : "overflow-hidden"}`}
        >
          <MissionPlayground
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
            exerciseMode={
              fillMode === "logic"
                ? "logic"
                : fillMode === "ai-integration"
                  ? "ai-integration"
                  : "prompt"
            }
            canRun={
              fillMode === "logic" || fillMode === "ai-integration"
                ? codeFillPassed
                : undefined
            }
            missionId={mission.id}
            codeFill={mission.codeFill}
            codeFillPassed={codeFillPassed}
            onCodeFillPassedChange={onCodeFillPassedChange}
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
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
