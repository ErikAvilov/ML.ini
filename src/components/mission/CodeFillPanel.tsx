"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import { evaluateCodeFill } from "@/lib/validation";
import type { CodeFillTask } from "@/lib/types";

const STORAGE_PREFIX = "mlini-code-fill-v1:";

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
  const [blank, setBlank] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_PREFIX + missionId) === "1") {
        onPassedChange(true);
      }
    } catch {
      /* ignore */
    }
  }, [missionId, onPassedChange]);

  function check() {
    const ok = evaluateCodeFill(
      blank,
      task.compareVariable,
      task.compareValue
    );
    if (ok) {
      setFeedback(null);
      onPassedChange(true);
      try {
        sessionStorage.setItem(STORAGE_PREFIX + missionId, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    onPassedChange(false);
    setFeedback(messages.codeFillFail);
  }

  return (
    <section
      className="border border-[color-mix(in_srgb,var(--ml-accent)_35%,var(--ml-border))] bg-[color-mix(in_srgb,var(--ml-accent)_6%,transparent)] px-3 py-2.5"
      style={{ borderRadius: "var(--ml-frame-radius)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
          {task.title}
        </p>
        <p
          className={`font-mono text-[11px] tracking-[0.08em] uppercase ${
            passed ? "text-ml-accent" : "text-ml-text-muted"
          }`}
        >
          {passed ? `✓ ${task.passLabel}` : task.checkLabel}
        </p>
      </div>
      <p className="mt-1.5 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body">
        {task.description}
      </p>

      <div
        className="mt-2 overflow-x-auto border border-ml-border bg-ml-bg-0/70 px-2.5 py-2 font-mono text-[12px] leading-snug text-ml-text"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        <pre className="whitespace-pre-wrap">{task.prefix}</pre>
        <div className="my-1 flex flex-wrap items-center gap-1">
          <input
            type="text"
            value={blank}
            onChange={(e) => {
              setBlank(e.target.value);
              if (passed) onPassedChange(false);
              setFeedback(null);
            }}
            placeholder={task.blankPlaceholder}
            spellCheck={false}
            autoComplete="off"
            aria-label={task.title}
            className="min-w-[12rem] flex-1 border border-ml-border-strong bg-ml-bg-1 px-2 py-1 font-mono text-[12px] text-ml-accent outline-none focus:border-ml-accent"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          />
        </div>
        <pre className="whitespace-pre-wrap">{task.suffix}</pre>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={check}>
          {messages.codeFillCheck}
        </Button>
        {!passed && blank && (
          <button
            type="button"
            className="text-[length:var(--ml-text-xs)] text-ml-text-muted underline-offset-2 hover:text-ml-text-secondary hover:underline"
            onClick={() => {
              setBlank("");
              setFeedback(null);
              onPassedChange(false);
            }}
          >
            {messages.codeFillReset}
          </button>
        )}
      </div>
      {feedback && (
        <p className="mt-2 border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
          {feedback}
        </p>
      )}
    </section>
  );
}
