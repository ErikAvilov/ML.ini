"use client";

import { Play, Layers } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import { useLocale } from "@/i18n/locale-context";
import type {
  ClassificationResult,
  CodeFillMode,
  CodeFillTask,
} from "@/lib/types";

const CodeFillPanel = dynamic(
  () =>
    import("@/components/mission/CodeFillPanel").then((m) => m.CodeFillPanel),
  { ssr: false }
);

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

/**
 * Presentation boundary for canonical code-fill missions (logic + ai-integration).
 * Run/results/completion stay owned by MissionSession — passed as props.
 */
export interface CodeFillWorkspaceProps {
  missionId: string;
  codeFill: CodeFillTask;
  codeFillMode: CodeFillMode;
  codeFillPassed: boolean;
  onCodeFillPassedChange: (passed: boolean) => void;
  showcaseMessage: string;
  activeMessage: string;
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
  /** Gate Run until local fill validation passes. */
  canRun: boolean;
}

export function CodeFillWorkspace({
  missionId,
  codeFill,
  codeFillMode,
  codeFillPassed,
  onCodeFillPassedChange,
  showcaseMessage,
  activeMessage,
  onRun,
  onRunBatch,
  onDevComplete,
  running,
  runMode,
  stage,
  liveOutput,
  results,
  feedback,
  feedbackSpeaker = null,
  currentIndex,
  testCount,
  error,
  justUnlocked,
  showSuccess,
  canRun,
}: CodeFillWorkspaceProps) {
  const { messages, t } = useLocale();
  const isLogic = codeFillMode === "logic";
  const isServiceAction = codeFillMode === "service-action";
  const runEnabled = canRun;
  const displayedMessage =
    running && runMode === "sequential" ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";
  const messageLabel = isLogic
    ? messages.logicFixtureLabel
    : isServiceAction
      ? messages.clientMessage
      : messages.clientMessage;

  return (
    <div className="ml-mission-workspace-grid flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-ml-border bg-ml-surface-raised/80 px-3 py-2 sm:px-4">
        <p className="min-w-0 flex-1 truncate font-mono text-[length:var(--ml-text-sm)] text-ml-text-primary">
          <span className="mr-2 text-ml-text-muted">
            {messageLabel}
          </span>
          {displayedMessage}
        </p>
        {running && (
          <span className="shrink-0 font-mono text-[11px] text-ml-state-active uppercase">
            {runMode === "batch"
              ? messages.runBatchProgress
              : t(messages.runTestProgress, {
                  current: currentIndex + 1,
                  total: testCount,
                })}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-[4] overflow-hidden border-b border-ml-border bg-ml-surface-inset/40">
        <CodeFillPanel
          key={missionId}
          missionId={missionId}
          task={codeFill}
          passed={codeFillPassed}
          onPassedChange={onCodeFillPassedChange}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ml-border bg-ml-surface-raised/80 px-3 py-2.5 sm:px-4">
        <Button
          variant="primary"
          size="md"
          onClick={onRun}
          disabled={Boolean(running || !runEnabled)}
          aria-busy={running && runMode === "sequential"}
          title={messages.runShortcutHint}
        >
          <Play className="h-3.5 w-3.5" />
          {messages.run}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onRunBatch}
          disabled={Boolean(running || !runEnabled)}
          title={messages.runBatch}
        >
          <Layers className="h-3.5 w-3.5" />
          {messages.runBatch}
        </Button>
        {onDevComplete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onDevComplete}
            disabled={running}
            title="Mode développement — réussit la mission sans lancer les tests"
          >
            DEV · Réussir
          </Button>
        )}
        {error && (
          <p className="min-w-0 flex-1 truncate text-[length:var(--ml-text-sm)] text-ml-state-error">
            {error}
          </p>
        )}
        {(running || liveOutput) && (
          <div className="ml-auto min-w-0 max-w-[min(100%,20rem)]">
            <PipelineVisual
              compact
              output={liveOutput}
              activeStage={stage}
              running={running}
              outcome={outcome}
              testLabel={null}
            />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2.5 sm:px-4">
        <p className="ml-mission-section-label mb-1.5 shrink-0">{messages.tests}</p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          <TestResults
            results={results}
            total={testCount}
            feedback={feedback}
            feedbackSpeaker={feedbackSpeaker}
            running={running}
            runMode={runMode}
            currentIndex={currentIndex}
          />
          {justUnlocked && !showSuccess && (
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-state-completed">
              {messages.nextMissionUnlockedMap}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
