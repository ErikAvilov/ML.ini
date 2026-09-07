"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissionBriefing } from "@/components/mission/MissionBriefing";
import { MissionNavBar } from "@/components/mission/MissionNavBar";
import { MissionPlayground } from "@/components/mission/MissionPlayground";
import {
  SuccessToast,
  type SuccessToastData,
} from "@/components/mission/SuccessToast";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";
import { evaluateMissionTest, summarizeSuite } from "@/lib/validation";
import { useLocale } from "@/i18n/locale-context";
import { getMissionBySlug, getMissions } from "@/data/missions";
import type { ClassificationResult, MissionDefinition } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import type { CommonMessages } from "@/i18n/messages/common";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type MobileTab = "brief" | "workspace";

interface MissionWorkspaceProps {
  missionSlug: string;
}

export function MissionWorkspace({ missionSlug }: MissionWorkspaceProps) {
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
    : mission.order === 1
      ? "available"
      : "locked";

  if (status === "locked" || !mission.playable) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <MissionNavBar mission={mission} missions={missions} />
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
            <p className="mt-3 text-sm text-mist">
              {status === "locked"
                ? messages.missionLocked
                : (mission.comingSoonMessage ?? messages.missionComingSoon)}
            </p>
            <Link href="/royaume" className="mt-6 inline-block">
              <Button variant="secondary">{messages.backToKingdom}</Button>
            </Link>
          </div>
        </div>
      </div>
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
    />
  );
}

interface MissionSessionProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  nextMissionId: string | null;
  locale: Locale;
  messages: CommonMessages;
}

function MissionSession({
  mission,
  missions,
  nextMissionId,
  locale,
  messages,
}: MissionSessionProps) {
  const { progress, completeMissionAndUnlock } = useProgress();
  const alreadyCleared = progress.completedMissions.includes(mission.id);
  const tests = mission.tests ?? [];
  const showcase =
    mission.showcaseMessage ?? tests[0]?.message ?? "";
  const nextMission = nextMissionId
    ? missions.find((m) => m.id === nextMissionId) ?? null
    : null;

  const [instruction, setInstruction] = useState("");
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
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<SuccessToastData | null>(
    null
  );
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("brief");

  async function runClassify(message: string) {
    const res = await fetch("/api/ai/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, message, locale }),
    });
    const data = (await res.json()) as { output?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error || messages.apiError);
    }
    return data.output ?? "";
  }

  function grantMissionSuccess() {
    const levelBefore = progress.level;
    const wasCleared = alreadyCleared;
    let xpGained = 0;
    let leveledUp = false;
    let newLevel: number | null = null;

    if (!wasCleared) {
      const skill = mission.completion?.skillUnlocked;
      const skillId = skill
        ? `${skill.formalSkillName}-${skill.level}`
            .toLowerCase()
            .replace(/\s+/g, "-")
        : undefined;
      const next = completeMissionAndUnlock(
        mission.id,
        nextMissionId,
        mission.xpReward,
        {
          skillId,
          capabilityId: mission.completion?.capabilityUnlocked.id,
        }
      );
      xpGained = mission.xpReward;
      leveledUp = next.level > levelBefore;
      newLevel = leveledUp ? next.level : null;
      setJustUnlocked(Boolean(nextMissionId));
    }

    setSuccessToast({
      missionTitle: mission.title,
      xpGained,
      leveledUp,
      newLevel,
      replay: wasCleared,
      nextMissionHref: nextMission ? `/missions/${nextMission.slug}` : null,
      nextMissionTitle: nextMission?.shortTitle ?? nextMission?.title ?? null,
    });
  }

  function handleDevComplete() {
    if (process.env.NODE_ENV !== "development" || running) return;
    setMobileTab("workspace");
    setError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setRunning(false);
    setStage("idle");
    grantMissionSuccess();
  }

  async function handleRun() {
    if (!instruction.trim() || running || tests.length === 0) return;

    setMobileTab("workspace");
    setRunning(true);
    setRunMode("sequential");
    setError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setResults([]);
    setLiveOutput(null);
    setSuccessToast(null);

    const collected: ClassificationResult[] = [];

    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        setCurrentIndex(i);
        setActiveMessage(test.message);
        setStage("input");
        await wait(280);
        setStage("instruction");
        await wait(320);
        setStage("model");

        const output = await runClassify(test.message);
        setLiveOutput(output);
        setStage("output");

        const evaluated = evaluateMissionTest(
          output,
          test,
          mission.allowedOutputs ?? [],
          mission.outputSchema
        );
        collected.push(evaluated);
        setResults([...collected]);
        await wait(450);
      }

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.allPassed) {
        grantMissionSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : messages.genericError
      );
      setStage("idle");
    } finally {
      setRunning(false);
      setRunMode("idle");
      setStage("idle");
    }
  }

  async function handleRunBatch() {
    if (!instruction.trim() || running || tests.length === 0) return;

    setMobileTab("workspace");
    setRunning(true);
    setRunMode("batch");
    setError(null);
    setFeedback(null);
    setFeedbackSpeaker(null);
    setResults([]);
    setLiveOutput(null);
    setSuccessToast(null);
    setCurrentIndex(0);
    setActiveMessage(showcase);
    setStage("model");

    try {
      const res = await fetch("/api/ai/classify-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
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

      const collected: ClassificationResult[] = tests.map((test) => {
        const output = byId.get(test.id) ?? "";
        return evaluateMissionTest(
          output,
          test,
          mission.allowedOutputs ?? [],
          mission.outputSchema
        );
      });

      const lastRaw =
        collected[collected.length - 1]?.raw ??
        collected[collected.length - 1]?.normalized ??
        null;
      setLiveOutput(lastRaw);
      setStage("output");
      setResults(collected);
      setCurrentIndex(Math.max(0, tests.length - 1));

      const summary = summarizeSuite(collected, locale);
      setFeedback(summary.feedback);
      setFeedbackSpeaker(summary.feedbackSpeaker);

      if (summary.allPassed) {
        grantMissionSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : messages.genericError
      );
      setStage("idle");
    } finally {
      setRunning(false);
      setRunMode("idle");
      setStage("idle");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <MissionNavBar mission={mission} missions={missions} />

      <div className="flex shrink-0 border-b border-ml-border lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("brief")}
          className={`flex-1 py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "brief"
              ? "border-b-2 border-ml-accent text-ml-text"
              : "text-ml-text-muted"
          }`}
        >
          {messages.briefTab}
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("workspace")}
          className={`flex-1 py-2.5 text-[length:var(--ml-text-sm)] font-medium transition ${
            mobileTab === "workspace"
              ? "border-b-2 border-ml-accent text-ml-text"
              : "text-ml-text-muted"
          }`}
        >
          {messages.workspaceTab}
        </button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        <aside
          className={`min-h-0 min-w-0 overflow-y-auto border-r border-ml-border bg-ml-bg-1/50 px-5 py-5 sm:px-6 sm:py-6 ${
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
            error={error}
            justUnlocked={justUnlocked}
            showSuccess={Boolean(successToast)}
          />
        </section>
      </div>

      <SuccessToast
        data={successToast}
        onDismiss={() => setSuccessToast(null)}
      />
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
