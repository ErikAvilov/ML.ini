"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import {
  buildCodeFillStarterSource,
  evaluateAiIntegrationFill,
  evaluateCodeFillTask,
  extractAiIntegrationFillFromSource,
  extractLogicFillFromSource,
} from "@/lib/validation";
import type { CodeFillTask } from "@/lib/types";

const PASSED_PREFIX = "mlini-code-fill-v2:";
const SOURCE_PREFIX = "mlini-code-src-v1:";

interface CodeFillPanelProps {
  missionId: string;
  task: CodeFillTask;
  passed: boolean;
  onPassedChange: (passed: boolean) => void;
}

export function CodeFillPanel({
  missionId,
  task,
  passed,
  onPassedChange,
}: CodeFillPanelProps) {
  const { messages } = useLocale();
  const starter = useMemo(() => buildCodeFillStarterSource(task), [task]);
  const [source, setSource] = useState(starter);
  const [feedback, setFeedback] = useState<string | null>(null);
  const onPassedChangeRef = useRef(onPassedChange);
  onPassedChangeRef.current = onPassedChange;

  useEffect(() => {
    let initial = starter;
    try {
      const saved = sessionStorage.getItem(SOURCE_PREFIX + missionId);
      if (saved != null && saved.length > 0) initial = saved;
      if (sessionStorage.getItem(PASSED_PREFIX + missionId) === "1") {
        onPassedChangeRef.current(true);
      }
    } catch {
      /* ignore */
    }
    setSource(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- missionId only
  }, [missionId]);

  function setPassed(next: boolean) {
    onPassedChange(next);
    try {
      if (next) sessionStorage.setItem(PASSED_PREFIX + missionId, "1");
      else sessionStorage.removeItem(PASSED_PREFIX + missionId);
    } catch {
      /* ignore */
    }
  }

  function dirty(next: string) {
    setSource(next);
    setFeedback(null);
    try {
      sessionStorage.setItem(SOURCE_PREFIX + missionId, next);
    } catch {
      /* ignore */
    }
  }

  function markPassed() {
    setFeedback(null);
    setPassed(true);
    try {
      sessionStorage.setItem(SOURCE_PREFIX + missionId, source);
    } catch {
      /* ignore */
    }
  }

  function checkLogic() {
    if (task.mode !== "logic") return;
    const { key, condition } = extractLogicFillFromSource(source);
    const result = evaluateCodeFillTask(key, condition, task);
    if (result.ok) {
      markPassed();
      return;
    }
    setPassed(false);
    setFeedback(
      result.which === "key"
        ? messages.codeFillKeyFail
        : messages.codeFillFail
    );
  }

  function checkAiIntegration() {
    if (task.mode !== "ai-integration") return;
    const { values } = extractAiIntegrationFillFromSource(source);
    const result = evaluateAiIntegrationFill(values, task.blanks);
    if (result.ok) {
      markPassed();
      return;
    }
    setPassed(false);
    const failKey =
      result.blankId === "instruction"
        ? messages.codeFillInstructionFail
        : result.blankId === "message"
          ? messages.codeFillMessageFail
          : result.blankId === "priority"
            ? messages.codeFillPriorityFail
            : messages.codeFillWiringFail;
    setFeedback(failKey);
  }

  function check() {
    if (task.mode === "ai-integration") checkAiIntegration();
    else checkLogic();
  }

  function reset() {
    setSource(starter);
    setFeedback(null);
    setPassed(false);
    try {
      sessionStorage.setItem(SOURCE_PREFIX + missionId, starter);
      sessionStorage.removeItem(PASSED_PREFIX + missionId);
    } catch {
      /* ignore */
    }
  }

  const hasEdits = source !== starter;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-ml-border px-3 py-1.5 sm:px-4">
        <p className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
          {messages.yourCodeLabel}
        </p>
        <p
          className={`font-mono text-[11px] tracking-[0.08em] uppercase ${
            passed ? "text-ml-accent" : "text-ml-text-muted"
          }`}
        >
          {passed ? `✓ ${task.passLabel}` : task.checkLabel}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {hasEdits && (
            <button
              type="button"
              className="text-[length:var(--ml-text-xs)] text-ml-text-muted underline-offset-2 hover:text-ml-text-secondary hover:underline"
              onClick={reset}
            >
              {messages.codeFillReset}
            </button>
          )}
          <Button variant="secondary" size="sm" onClick={check}>
            {task.mode === "ai-integration"
              ? messages.codeFillWiringCheck
              : messages.codeFillCheck}
          </Button>
        </div>
      </div>

      {feedback && (
        <p className="shrink-0 border-b border-ml-danger/40 bg-[color-mix(in_srgb,var(--ml-danger)_8%,transparent)] px-3 py-1.5 text-[length:var(--ml-text-sm)] text-ml-danger sm:px-4">
          {feedback}
        </p>
      )}

      <textarea
        value={source}
        onChange={(e) => dirty(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-label={messages.yourCodeLabel}
        className="min-h-0 w-full flex-1 resize-none border-0 bg-ml-bg-0 px-3 py-3 font-mono text-[13px] leading-[1.55] text-ml-text outline-none focus:ring-0 sm:px-4"
      />
    </div>
  );
}
