"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MissionPlayground } from "@/components/mission/MissionPlayground";
import { PipelineBuilderWorkspace } from "@/components/mission/workspace/PipelineBuilderWorkspace";
import { useLocale } from "@/i18n/locale-context";
import type {
  ClassificationResult,
  MissionDefinition,
  PipelineConnections,
  SafetyRuleConfig,
} from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

export interface BossWorkspaceProps {
  mission: MissionDefinition;
  bossStep: number;
  onBossStepChange: (step: number) => void;
  promptStepPassed: boolean;
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
  pipelineConnections: PipelineConnections;
  onPipelineConnectionsChange: (next: PipelineConnections) => void;
  pipelinePassed: boolean;
  onPipelinePassedChange: (passed: boolean) => void;
  safetyConfig: SafetyRuleConfig;
  onSafetyConfigChange: (next: SafetyRuleConfig) => void;
  safetyPassed: boolean;
  onSafetyPassedChange: (passed: boolean) => void;
}

/**
 * Composes prompt + pipeline workspaces for Mission 10 Launch Night.
 * Does not own grading — MissionSession gates steps and completion.
 */
export function BossWorkspace({
  mission,
  bossStep,
  onBossStepChange,
  promptStepPassed,
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
  pipelinePassed,
  onPipelinePassedChange,
  safetyConfig,
  onSafetyConfigChange,
  safetyPassed,
  onSafetyPassedChange,
}: BossWorkspaceProps) {
  const { messages, t } = useLocale();
  const boss = mission.boss;
  const [manualOpen, setManualOpen] = useState(false);

  if (!boss || !mission.pipeline) {
    return (
      <div className="flex h-full items-center justify-center bg-ml-bg-0 px-6">
        <p className="text-center text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {messages.workspaceUnsupported}
        </p>
      </div>
    );
  }

  const stepCount = boss.steps.length;
  const stepIndex = Math.min(Math.max(bossStep, 0), stepCount - 1);
  const step = boss.steps[stepIndex]!;
  const isFinal = stepIndex >= stepCount - 1;
  const canAdvance =
    !isFinal &&
    ((stepIndex === 0 && promptStepPassed) ||
      (stepIndex === 1 && pipelinePassed));

  function advance() {
    if (!canAdvance) return;
    onBossStepChange(stepIndex + 1);
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-ml-border bg-ml-surface-raised/80 px-3 py-2 sm:px-4">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-text-muted uppercase">
          {t(messages.bossStepLabel, {
            current: stepIndex + 1,
            total: stepCount,
          })}
        </p>
        <p className="min-w-0 font-mono text-[11px] tracking-[0.08em] text-ml-text-primary uppercase">
          {step.shortTitle}
          <span className="ml-2 font-sans text-[length:var(--ml-text-xs)] font-normal normal-case tracking-normal text-ml-text-secondary">
            {step.objective}
          </span>
        </p>
      </div>

      <div className="shrink-0 border-b border-ml-border bg-ml-surface-1 px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={() => setManualOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center gap-2 text-left"
          aria-expanded={manualOpen}
        >
          <span className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
            {messages.fieldManual}
          </span>
          <ChevronDown
            className={`ml-auto h-3.5 w-3.5 text-ml-text-muted transition ${
              manualOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {manualOpen ? (
          <ul className="mt-2 flex flex-col gap-2 border-t border-ml-border pt-2">
            {boss.fieldManual.map((entry) => (
              <li key={entry.title}>
                <p className="font-mono text-[11px] tracking-[0.08em] text-ml-text-primary uppercase">
                  {entry.title}
                </p>
                <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
                  {entry.body}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="min-h-0 flex-1">
        {stepIndex === 0 ? (
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
        ) : (
          <PipelineBuilderWorkspace
            missionId={mission.id}
            pipeline={mission.pipeline}
            safety={stepIndex === 2 ? mission.safety : undefined}
            connections={pipelineConnections}
            onConnectionsChange={onPipelineConnectionsChange}
            pipelinePassed={pipelinePassed}
            onPipelinePassedChange={onPipelinePassedChange}
            safetyConfig={stepIndex === 2 ? safetyConfig : undefined}
            onSafetyConfigChange={
              stepIndex === 2 ? onSafetyConfigChange : undefined
            }
            safetyPassed={safetyPassed}
            onSafetyPassedChange={
              stepIndex === 2 ? onSafetyPassedChange : undefined
            }
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
              stepIndex === 2
                ? pipelinePassed && (!mission.safety || safetyPassed)
                : false
            }
            runLabel={stepIndex === 2 ? messages.launchMildred : undefined}
          />
        )}
      </div>

      {canAdvance ? (
        <div className="flex shrink-0 justify-end border-t border-ml-border bg-ml-surface-raised/80 px-3 py-2.5 sm:px-4">
          <Button
            variant="primary"
            size="md"
            onClick={advance}
            disabled={running}
          >
            {messages.progressionContinue}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
