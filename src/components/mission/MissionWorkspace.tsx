"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissionBriefing } from "@/components/mission/MissionBriefing";
import { MissionNavBar } from "@/components/mission/MissionNavBar";
import { MissionPlayground } from "@/components/mission/MissionPlayground";
import { SuccessOverlay } from "@/components/mission/SuccessOverlay";
import { useProgress } from "@/lib/progress-context";
import { getMissionStatus } from "@/lib/progression";
import { evaluateClassification, summarizeSuite } from "@/lib/validation";
import type { ClassificationResult, MissionDefinition } from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type MobileTab = "brief" | "workspace";

interface MissionWorkspaceProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
  nextMissionId: string | null;
}

export function MissionWorkspace({
  mission,
  missions,
  nextMissionId,
}: MissionWorkspaceProps) {
  const router = useRouter();
  const { progress, ready, completeMissionAndUnlock } = useProgress();

  const status = ready
    ? getMissionStatus(mission.id, progress, mission.order)
    : mission.order === 1
      ? "available"
      : "locked";

  const alreadyCleared = progress.completedMissions.includes(mission.id);
  const tests = useMemo(() => mission.tests ?? [], [mission.tests]);

  const [instruction, setInstruction] = useState("");
  const [activeMessage, setActiveMessage] = useState(
    mission.showcaseMessage ?? tests[0]?.message ?? ""
  );
  const [liveOutput, setLiveOutput] = useState<string | null>(null);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("brief");

  async function runClassify(message: string) {
    const res = await fetch("/api/ai/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, message }),
    });
    const data = (await res.json()) as { output?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error || "Erreur API");
    }
    return data.output ?? "";
  }

  async function handleRun() {
    if (!instruction.trim() || running || tests.length === 0) return;

    setMobileTab("workspace");
    setRunning(true);
    setError(null);
    setFeedback(null);
    setResults([]);
    setLiveOutput(null);
    setShowSuccess(false);

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

        const evaluated = evaluateClassification(
          output,
          test.expected,
          test.message,
          test.id
        );
        collected.push(evaluated);
        setResults([...collected]);
        await wait(450);
      }

      const summary = summarizeSuite(collected);
      setFeedback(summary.feedback);

      if (summary.allPassed) {
        if (!alreadyCleared) {
          completeMissionAndUnlock(
            mission.id,
            nextMissionId,
            mission.xpReward
          );
          setJustUnlocked(Boolean(nextMissionId));
        }
        setShowSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStage("idle");
    } finally {
      setRunning(false);
      setStage("idle");
    }
  }

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
                ? "Cette étape est encore verrouillée. Avance sur le chemin pour l’atteindre."
                : (mission.comingSoonMessage ?? "Mission en construction.")}
            </p>
            <Link href="/royaume" className="mt-6 inline-block">
              <Button variant="secondary">Retour au Royaume</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const briefing = mission.briefing ? (
    <MissionBriefing
      briefing={mission.briefing}
      missionTitle={mission.title}
      missionOrder={mission.order}
      alreadyCleared={alreadyCleared}
      hints={mission.hints ?? []}
      instruction={instruction}
      objective={mission.objective}
    />
  ) : null;

  const playground = (
    <MissionPlayground
      showcaseMessage={
        mission.showcaseMessage ?? tests[0]?.message ?? ""
      }
      activeMessage={activeMessage}
      instruction={instruction}
      onInstructionChange={setInstruction}
      onRun={handleRun}
      running={running}
      stage={stage}
      liveOutput={liveOutput}
      results={results}
      feedback={feedback}
      currentIndex={currentIndex}
      testCount={tests.length}
      error={error}
      justUnlocked={justUnlocked}
      showSuccess={showSuccess}
    />
  );

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
          Brief
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
          Workspace
        </button>
      </div>

      {/* Desktop split / mobile tab panels */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)]">
        <aside
          className={`min-h-0 min-w-0 overflow-y-auto border-r border-ml-border bg-ml-bg-1/50 px-5 py-5 sm:px-6 sm:py-6 ${
            mobileTab === "brief" ? "block" : "hidden lg:block"
          }`}
        >
          {briefing}
        </aside>

        <section
          className={`min-h-0 min-w-0 ${
            mobileTab === "workspace" ? "block" : "hidden lg:block"
          } ${mobileTab === "workspace" ? "overflow-y-auto lg:overflow-hidden" : "overflow-hidden"}`}
        >
          {playground}
        </section>
      </div>

      {showSuccess && mission.concepts && (
        <SuccessOverlay
          title={mission.title}
          xp={mission.xpReward}
          concepts={mission.concepts}
          insight={mission.briefing?.successInsight}
          onContinue={() => {
            setShowSuccess(false);
            router.push("/royaume");
          }}
        />
      )}
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
