"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import type { ClassificationResult } from "@/lib/types";

type Stage = "idle" | "input" | "instruction" | "model" | "output";

interface MissionPlaygroundProps {
  showcaseMessage: string;
  activeMessage: string;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onRun: () => void;
  running: boolean;
  stage: Stage;
  liveOutput: string | null;
  results: ClassificationResult[];
  feedback: string | null;
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
  running,
  stage,
  liveOutput,
  results,
  feedback,
  currentIndex,
  testCount,
  error,
  justUnlocked,
  showSuccess,
}: MissionPlaygroundProps) {
  const displayedMessage = running ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-ml-surface-warm/60">
      <div className="shrink-0 border-b border-ml-border px-4 py-3 sm:px-5">
        <p className="ml-section-label">
          Message client
          {running && (
            <span className="ml-2 text-ml-accent">
              · Test {currentIndex + 1}/{testCount}
            </span>
          )}
        </p>
        <p className="mt-2 text-[length:var(--ml-text-base)] leading-snug text-ml-text italic">
          “{displayedMessage}”
        </p>
      </div>

      <div className="flex min-h-0 flex-[1.25] flex-col border-b border-ml-border px-4 py-3 sm:px-5">
        <div className="mb-2 shrink-0">
          <p className="ml-section-label">Instruction du système</p>
          <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            Écrite par toi · utilisée automatiquement sur chaque message
          </p>
        </div>
        <textarea
          id="instruction"
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          placeholder="Écris l’instruction que le système enverra au modèle…"
          disabled={running}
          className="min-h-0 w-full flex-1 resize-none border border-ml-border bg-ml-bg-1 px-3.5 py-3 text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)] text-ml-text outline-none transition placeholder:text-ml-text-muted/55 focus:border-ml-border-strong focus:ring-1 focus:ring-[color-mix(in_srgb,var(--ml-accent)_20%,transparent)] disabled:opacity-60"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        />
        <div className="mt-3 flex shrink-0 flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onRun}
            disabled={Boolean(running || instruction.trim().length === 0)}
          >
            <Play className="h-3.5 w-3.5" />
            {running ? `Test ${currentIndex + 1}/${testCount}` : "Run"}
          </Button>
          <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
            Une instruction · {testCount} tests
          </p>
        </div>
        {error && (
          <p className="mt-2 shrink-0 border-l-2 border-ml-danger pl-3 text-[length:var(--ml-text-sm)] text-ml-danger">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0 border-b border-ml-border px-4 py-3 sm:px-5">
        <PipelineVisual
          output={liveOutput}
          activeStage={stage}
          running={running}
          outcome={outcome}
          testLabel={
            running
              ? `Test ${currentIndex + 1}/${testCount} · même instruction`
              : null
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
        <TestResults
          results={results}
          total={testCount}
          feedback={feedback}
          running={running}
          currentIndex={currentIndex}
        />
        {justUnlocked && !showSuccess && (
          <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-accent">
            Mission 2 débloquée sur la carte.
          </p>
        )}
      </div>
    </div>
  );
}
