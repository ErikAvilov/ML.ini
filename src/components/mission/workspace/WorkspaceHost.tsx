"use client";

import { MissionPlayground } from "@/components/mission/MissionPlayground";
import { CodeFillWorkspace } from "@/components/mission/workspace/CodeFillWorkspace";
import {
  isSessionWorkspace,
  resolveWorkspaceKind,
} from "@/lib/missions/resolve-workspace-kind";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition, ClassificationResult } from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

/**
 * Props from MissionSession — host only routes by workspace kind.
 * Does not own grading, drafts, completion, or navigation.
 */
export interface WorkspaceHostProps {
  mission: MissionDefinition;
  showcaseMessage: string;
  activeMessage: string;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onRun: () => void;
  onRunBatch: () => void;
  onDevComplete?: () => void;
  running: boolean;
  runMode: RunMode;
  stage: Stage;
  liveOutput: string | null;
  results: ClassificationResult[];
  feedback: string | null;
  feedbackSpeaker?: "mira" | null;
  currentIndex: number;
  testCount: number;
  error: string | null;
  justUnlocked: boolean;
  showSuccess: boolean;
  codeFillPassed: boolean;
  onCodeFillPassedChange: (passed: boolean) => void;
}

function UnsupportedWorkspace({ detail }: { detail: string }) {
  const { messages } = useLocale();
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-ml-bg-0 px-6">
      <p className="max-w-sm text-center text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {messages.workspaceUnsupported}
        {process.env.NODE_ENV === "development" ? (
          <span className="mt-2 block font-mono text-[11px] text-ml-text-muted">
            {detail}
          </span>
        ) : null}
      </p>
    </div>
  );
}

/**
 * Routes:
 * - code-fill → CodeFillWorkspace
 * - prompt / payload-repair → MissionPlayground
 */
export function WorkspaceHost({
  mission,
  codeFillPassed,
  onCodeFillPassedChange,
  showcaseMessage,
  activeMessage,
  instruction,
  onInstructionChange,
  onRun,
  onRunBatch,
  onDevComplete,
  running,
  runMode,
  stage,
  liveOutput,
  results,
  feedback,
  feedbackSpeaker,
  currentIndex,
  testCount,
  error,
  justUnlocked,
  showSuccess,
}: WorkspaceHostProps) {
  const resolution = resolveWorkspaceKind(mission);

  if (!isSessionWorkspace(resolution.kind)) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[WorkspaceHost] unexpected kind in session pane",
        resolution.kind,
        mission.id
      );
    }
    return (
      <UnsupportedWorkspace detail={`${mission.id} → ${resolution.kind}`} />
    );
  }

  if (resolution.kind === "code-fill") {
    const codeFill = mission.codeFill;
    if (!codeFill) {
      return (
        <UnsupportedWorkspace
          detail={`${mission.id} → code-fill without codeFill data`}
        />
      );
    }
    return (
      <CodeFillWorkspace
        missionId={mission.id}
        codeFill={codeFill}
        codeFillMode={resolution.codeFillMode}
        codeFillPassed={codeFillPassed}
        onCodeFillPassedChange={onCodeFillPassedChange}
        showcaseMessage={showcaseMessage}
        activeMessage={activeMessage}
        onRun={onRun}
        onRunBatch={onRunBatch}
        onDevComplete={onDevComplete}
        running={running}
        runMode={runMode}
        stage={stage}
        liveOutput={liveOutput}
        results={results}
        feedback={feedback}
        feedbackSpeaker={feedbackSpeaker}
        currentIndex={currentIndex}
        testCount={testCount}
        error={error}
        justUnlocked={justUnlocked}
        showSuccess={showSuccess}
        canRun={codeFillPassed}
      />
    );
  }

  // prompt + payload-repair share MissionPlayground (repair UI stays in Briefing)
  return (
    <MissionPlayground
      showcaseMessage={showcaseMessage}
      activeMessage={activeMessage}
      instruction={instruction}
      onInstructionChange={onInstructionChange}
      onRun={onRun}
      onRunBatch={onRunBatch}
      onDevComplete={onDevComplete}
      running={running}
      runMode={runMode}
      stage={stage}
      liveOutput={liveOutput}
      results={results}
      feedback={feedback}
      feedbackSpeaker={feedbackSpeaker}
      currentIndex={currentIndex}
      testCount={testCount}
      error={error}
      justUnlocked={justUnlocked}
      showSuccess={showSuccess}
    />
  );
}
