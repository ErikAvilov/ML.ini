"use client";

import { Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import { useLocale } from "@/i18n/locale-context";
import type { ClassificationResult } from "@/lib/types";

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
  /** Logic missions: no prompt editor; RUN when fill-in is ready. */
  exerciseMode?: "prompt" | "logic";
  canRun?: boolean;
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
}: MissionPlaygroundProps) {
  const { messages, t } = useLocale();
  const isLogic = exerciseMode === "logic";
  const runEnabled =
    canRun ?? (!isLogic && instruction.trim().length > 0);
  const displayedMessage =
    running && runMode === "sequential" ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-ml-surface-warm/60">
      <div className="shrink-0 border-b border-ml-border px-4 py-2.5 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="ml-section-label">
            {isLogic ? messages.logicFixtureLabel : messages.clientMessage}
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
            {isLogic
              ? t(messages.logicScenarioCount, { count: testCount })
              : t(messages.oneInstructionTests, { count: testCount })}
          </p>
        </div>
        <p className="mt-1.5 line-clamp-2 font-mono text-[length:var(--ml-text-md)] leading-snug text-ml-text">
          {displayedMessage}
        </p>
      </div>

      <div className="flex min-h-[14rem] flex-[1.7] flex-col border-b border-ml-border px-4 py-3 sm:min-h-[16rem] sm:px-5">
        <div className="mb-2 shrink-0">
          <p className="ml-section-label">
            {isLogic ? messages.logicDecisionLabel : messages.systemInstruction}
          </p>
          <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {isLogic
              ? messages.logicDecisionHelp
              : messages.systemInstructionHelp}
          </p>
        </div>
        {isLogic ? (
          <div
            className="min-h-0 w-full flex-1 border border-ml-border bg-ml-bg-1 px-3.5 py-3 font-mono text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            <p className="whitespace-pre-wrap">
              {`priority = result["priority"]\n\nif priority == "URGENT":\n  route = "HUMAN_REVIEW"\nelse:\n  route = "STANDARD_QUEUE"`}
            </p>
            <p
              className={`mt-3 font-mono text-[11px] tracking-[0.1em] uppercase ${
                runEnabled ? "text-ml-accent" : "text-ml-text-muted"
              }`}
            >
              {runEnabled
                ? messages.logicConditionReady
                : messages.logicConditionNeeded}
            </p>
          </div>
        ) : (
          <textarea
            id="instruction"
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder={messages.instructionPlaceholder}
            disabled={running}
            className="min-h-0 w-full flex-1 cursor-text resize-none border border-ml-border bg-ml-bg-1 px-3.5 py-3 text-[length:var(--ml-text-md)] leading-[1.55] text-ml-text outline-none transition placeholder:text-ml-text-muted/55 hover:border-ml-border-strong focus:border-ml-border-strong focus:ring-1 focus:ring-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          />
        )}
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
