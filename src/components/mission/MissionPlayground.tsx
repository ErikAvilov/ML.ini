"use client";

import { Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import { useLocale } from "@/i18n/locale-context";
import type { ClassificationResult } from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

/**
 * Prompt / payload-repair RUN workspace (editable instruction + AI).
 */
interface MissionPlaygroundProps {
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
}: MissionPlaygroundProps) {
  const { messages, t } = useLocale();
  const runEnabled = instruction.trim().length > 0;
  const displayedMessage =
    running && runMode === "sequential" ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";
  const hasResults = results.length > 0 || running;

  return (
    <div className="ml-mission-workspace flex h-full min-h-0 min-w-0 flex-col">
      <div className="shrink-0 border-b border-ml-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="ml-mission-section-label">{messages.clientMessage}</p>
          <p className="font-mono text-[11px] text-ml-text-muted">
            {t(messages.oneInstructionTests, { count: testCount })}
          </p>
        </div>
        <p className="mt-2 font-mono text-[length:var(--ml-text-sm)] leading-snug text-ml-text-primary">
          {displayedMessage}
        </p>
        {running && (
          <p className="mt-1.5 font-mono text-[11px] text-ml-state-active uppercase">
            {runMode === "batch"
              ? messages.runBatchProgress
              : t(messages.runTestProgress, {
                  current: currentIndex + 1,
                  total: testCount,
                })}
          </p>
        )}
      </div>

      <div className="flex min-h-[14rem] flex-[1.7] flex-col border-b border-ml-border px-4 py-3 sm:min-h-[16rem] sm:px-5">
        <div className="mb-2 shrink-0">
          <p className="ml-mission-section-label">{messages.systemInstruction}</p>
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
          className="min-h-0 w-full flex-1 cursor-text resize-none border border-ml-border bg-ml-surface-inset px-3.5 py-3 text-[length:var(--ml-text-md)] leading-[1.55] text-ml-text-primary outline-none transition placeholder:text-ml-text-muted/55 hover:border-ml-border-strong focus:border-ml-state-active focus:ring-1 focus:ring-[color-mix(in_srgb,var(--ml-state-active)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        />
        <div className="mt-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
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
              <div className="min-w-0 flex-1 border-l-2 border-ml-state-error pl-3">
                <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.08em] text-ml-state-error uppercase">
                  {messages.systemErrorLabel}
                </p>
                <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-state-error">
                  {error}
                </p>
              </div>
            )}
          </div>
          <div className="min-w-0 sm:max-w-[min(100%,28rem)]">
            {running && runMode === "batch" ? (
              <p className="truncate text-[length:var(--ml-text-xs)] text-ml-state-active">
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

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 sm:px-5 ${
          hasResults ? "" : "opacity-70"
        }`}
      >
        <p className="ml-mission-section-label mb-2 shrink-0">
          {messages.tests}
        </p>
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
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-state-completed">
              {messages.nextMissionUnlockedMap}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
