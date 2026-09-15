"use client";

import { MissionPlayground } from "@/components/mission/MissionPlayground";
import { CodeFillWorkspace } from "@/components/mission/workspace/CodeFillWorkspace";
import { PipelineBuilderWorkspace } from "@/components/mission/workspace/PipelineBuilderWorkspace";
import { BossWorkspace } from "@/components/mission/workspace/BossWorkspace";
import {
  isSessionWorkspace,
  resolveWorkspaceKind,
} from "@/lib/missions/resolve-workspace-kind";
import { useLocale } from "@/i18n/locale-context";
import type {
  ClassificationResult,
  MissionDefinition,
  PipelineConnections,
  SafetyRuleConfig,
} from "@/lib/types";

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
  /** Pipeline missions (08+). Optional so older call sites stay type-safe until wired. */
  pipelineConnections?: PipelineConnections;
  onPipelineConnectionsChange?: (next: PipelineConnections) => void;
  pipelinePassed?: boolean;
  onPipelinePassedChange?: (passed: boolean) => void;
  safetyConfig?: SafetyRuleConfig;
  onSafetyConfigChange?: (next: SafetyRuleConfig) => void;
  safetyPassed?: boolean;
  onSafetyPassedChange?: (passed: boolean) => void;
  /** Boss (Mission 10) */
  bossStep?: number;
  onBossStepChange?: (step: number) => void;
  promptStepPassed?: boolean;
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
 * - pipeline → PipelineBuilderWorkspace
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
  pipelineConnections,
  onPipelineConnectionsChange,
  pipelinePassed = false,
  onPipelinePassedChange,
  safetyConfig,
  onSafetyConfigChange,
  safetyPassed = false,
  onSafetyPassedChange,
  bossStep = 0,
  onBossStepChange,
  promptStepPassed = false,
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

  if (resolution.kind === "pipeline") {
    const pipeline = mission.pipeline;
    if (!pipeline) {
      return (
        <UnsupportedWorkspace
          detail={`${mission.id} → pipeline without pipeline data`}
        />
      );
    }
    // TODO(pipeline): MissionSession must pass connections + passed flags.
    if (
      !pipelineConnections ||
      !onPipelineConnectionsChange ||
      !onPipelinePassedChange
    ) {
      return (
        <UnsupportedWorkspace
          detail={`${mission.id} → pipeline props missing from MissionSession`}
        />
      );
    }
    const safetyReady =
      !mission.safety || (Boolean(safetyConfig) && Boolean(onSafetyConfigChange));
    if (mission.safety && !safetyReady) {
      return (
        <UnsupportedWorkspace
          detail={`${mission.id} → safety props missing from MissionSession`}
        />
      );
    }
    return (
      <PipelineBuilderWorkspace
        missionId={mission.id}
        pipeline={pipeline}
        safety={mission.safety}
        connections={pipelineConnections}
        onConnectionsChange={onPipelineConnectionsChange}
        pipelinePassed={pipelinePassed}
        onPipelinePassedChange={onPipelinePassedChange}
        safetyConfig={safetyConfig}
        onSafetyConfigChange={onSafetyConfigChange}
        safetyPassed={safetyPassed}
        onSafetyPassedChange={onSafetyPassedChange}
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
        canRun={
          pipelinePassed && (!mission.safety || safetyPassed)
        }
      />
    );
  }

  if (resolution.kind === "boss") {
    if (
      !mission.boss ||
      !mission.pipeline ||
      !pipelineConnections ||
      !onPipelineConnectionsChange ||
      !onPipelinePassedChange ||
      !onBossStepChange ||
      !safetyConfig ||
      !onSafetyConfigChange
    ) {
      return (
        <UnsupportedWorkspace
          detail={`${mission.id} → boss props missing from MissionSession`}
        />
      );
    }
    return (
      <BossWorkspace
        mission={mission}
        bossStep={bossStep}
        onBossStepChange={onBossStepChange}
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
        pipelineConnections={pipelineConnections}
        onPipelineConnectionsChange={onPipelineConnectionsChange}
        pipelinePassed={pipelinePassed}
        onPipelinePassedChange={onPipelinePassedChange}
        safetyConfig={safetyConfig}
        onSafetyConfigChange={onSafetyConfigChange}
        safetyPassed={safetyPassed}
        onSafetyPassedChange={onSafetyPassedChange ?? (() => {})}
        promptStepPassed={promptStepPassed}
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
