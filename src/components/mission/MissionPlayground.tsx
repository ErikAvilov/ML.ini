"use client";

import { Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeFillPanel } from "@/components/mission/CodeFillPanel";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import { useLocale } from "@/i18n/locale-context";
import type { ClassificationResult, CodeFillTask } from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

interface MissionPlaygroundProps {
  showcaseMessage: string;
  activeMessage: string;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onRun: () => void;
  onRunBatch: () => void;
  /** Visible only in development — force mission clear without running tests */
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
  /**
   * prompt = editable instruction + AI
   * logic = fill gate, deterministic routes (no AI)
   * ai-integration = fill gate + fixed instruction + real AI
   */
  exerciseMode?: "prompt" | "logic" | "ai-integration";
  canRun?: boolean;
  /** Code exercise lives in the RIGHT workspace — never in the brief. */
  codeFill?: CodeFillTask;
  codeFillPassed?: boolean;
  onCodeFillPassedChange?: (passed: boolean) => void;
  missionId?: string;
}

export function MissionPlayground({
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
  feedbackSpeaker = null,
  currentIndex,
  testCount,
  error,
  justUnlocked,
  showSuccess,
  exerciseMode = "prompt",
  canRun,
  codeFill,
  codeFillPassed = false,
  onCodeFillPassedChange,
  missionId,
}: MissionPlaygroundProps) {
  const { messages, t } = useLocale();
  const isLogic = exerciseMode === "logic";
  const isAiIntegration = exerciseMode === "ai-integration";
  const isCodeWorkspace = isLogic || isAiIntegration;
  const showCodeFill =
    Boolean(codeFill && onCodeFillPassedChange && missionId) && isCodeWorkspace;
  const runEnabled =
    canRun ?? (!isCodeWorkspace && instruction.trim().length > 0);
  const displayedMessage =
    running && runMode === "sequential" ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";

  if (showCodeFill && codeFill && onCodeFillPassedChange && missionId) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col bg-ml-bg-0">
        <div className="flex shrink-0 items-center gap-3 border-b border-ml-border bg-ml-surface-warm/40 px-3 py-1.5 sm:px-4">
          <p className="min-w-0 flex-1 truncate font-mono text-[length:var(--ml-text-sm)] text-ml-text">
            <span className="mr-2 text-ml-text-muted">
              {isLogic ? messages.logicFixtureLabel : messages.clientMessage}
            </span>
            {displayedMessage}
          </p>
          {running && (
            <span className="shrink-0 font-mono text-[11px] text-ml-accent uppercase">
              {runMode === "batch"
                ? messages.runBatchProgress
                : t(messages.runTestProgress, {
                    current: currentIndex + 1,
                    total: testCount,
                  })}
            </span>
          )}
        </div>

        <div className="min-h-0 flex-[4] overflow-hidden border-b border-ml-border">
          <CodeFillPanel
            missionId={missionId}
            task={codeFill}
            passed={codeFillPassed}
            onPassedChange={onCodeFillPassedChange}
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ml-border bg-ml-surface-warm/40 px-3 py-2 sm:px-4">
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
            <p className="min-w-0 flex-1 truncate text-[length:var(--ml-text-sm)] text-ml-danger">
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

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 sm:px-4">
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
              <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-accent">
                {messages.nextMissionUnlockedMap}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-ml-surface-warm/60">
      <div className="shrink-0 border-b border-ml-border px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="ml-section-label">
            {messages.clientMessage}
            {running && runMode === "sequential" && (
              <span className="ml-2 text-ml-accent">
                ·{" "}
                {t(messages.runTestProgress, {
                  current: currentIndex + 1,
                  total: testCount,
                })}
              </span>
            )}
            {running && runMode === "batch" && (
              <span className="ml-2 text-ml-accent">
                · {messages.runBatchProgress}
              </span>
            )}
          </p>
          <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {t(messages.oneInstructionTests, { count: testCount })}
          </p>
        </div>
        <p className="mt-1.5 line-clamp-2 font-mono text-[length:var(--ml-text-md)] leading-snug text-ml-text">
          {displayedMessage}
        </p>
      </div>

      <div className="flex min-h-[14rem] flex-[1.7] flex-col border-b border-ml-border px-4 py-3 sm:min-h-[16rem] sm:px-5">
        <div className="mb-2 shrink-0">
          <p className="ml-section-label">{messages.systemInstruction}</p>
          <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.systemInstructionHelp}
          </p>
        </div>
        <textarea
          id="instruction"
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          placeholder={messages.instructionPlaceholder}
          disabled={running}
          className="min-h-0 w-full flex-1 cursor-text resize-none border border-ml-border bg-ml-bg-1 px-3.5 py-3 text-[length:var(--ml-text-md)] leading-[1.55] text-ml-text outline-none transition placeholder:text-ml-text-muted/55 hover:border-ml-border-strong focus:border-ml-border-strong focus:ring-1 focus:ring-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        />
        <div className="mt-2.5 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onRun}
              disabled={Boolean(running || !runEnabled)}
              aria-busy={running && runMode === "sequential"}
              title={messages.runShortcutHint}
            >
              <Play className="h-3.5 w-3.5" />
              {running && runMode === "sequential"
                ? t(messages.runTestProgress, {
                    current: currentIndex + 1,
                    total: testCount,
                  })
                : messages.run}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onRunBatch}
              disabled={Boolean(running || !runEnabled)}
              title={messages.runBatch}
            >
              <Layers className="h-3.5 w-3.5" />
              {running && runMode === "batch"
                ? messages.runBatchProgress
                : messages.runBatch}
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
              <div className="min-w-0 flex-1 border-l-2 border-ml-danger pl-3">
                <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-danger uppercase">
                  {messages.systemErrorLabel}
                </p>
                <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-danger">
                  {error}
                </p>
                <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
                  {messages.systemErrorHelp}
                </p>
              </div>
            )}
          </div>
          <div className="min-w-0 sm:max-w-[min(100%,28rem)]">
            {running && runMode === "batch" ? (
              <p className="truncate text-[length:var(--ml-text-xs)] text-ml-accent">
                {messages.batchEvaluatingAll}
              </p>
            ) : (
              <PipelineVisual
                compact
                output={liveOutput}
                activeStage={stage}
                running={running}
                outcome={outcome}
                testLabel={null}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 sm:px-5">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-gutter:stable]">
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
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-accent">
              {messages.nextMissionUnlockedMap}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
