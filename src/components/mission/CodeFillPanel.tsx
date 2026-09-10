"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import { evaluateCodeFillTask } from "@/lib/validation";
import type { CodeFillTask } from "@/lib/types";

const STORAGE_PREFIX = "mlini-code-fill-v2:";

interface CodeFillPanelProps {
  missionId: string;
  task: CodeFillTask;
  passed: boolean;
  onPassedChange: (passed: boolean) => void;
}

const blankInputClass =
  "min-w-[7rem] flex-1 border border-ml-border-strong bg-ml-bg-1 px-2 py-1 font-mono text-[12px] text-ml-accent outline-none focus:border-ml-accent";

export function CodeFillPanel({
  missionId,
  task,
  passed,
  onPassedChange,
}: CodeFillPanelProps) {
  const { messages } = useLocale();
  const [keyBlank, setKeyBlank] = useState("");
  const [conditionBlank, setConditionBlank] = useState("");
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

  function dirty() {
    if (passed) onPassedChange(false);
    setFeedback(null);
  }

  function check() {
    const result = evaluateCodeFillTask(keyBlank, conditionBlank, task);
    if (result.ok) {
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
    setFeedback(
      result.which === "key"
        ? messages.codeFillKeyFail
        : messages.codeFillFail
    );
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
        <div className="my-1 inline-flex min-w-[6rem] max-w-full">
          <input
            type="text"
            value={keyBlank}
            onChange={(e) => {
              setKeyBlank(e.target.value);
              dirty();
            }}
            placeholder={task.keyPlaceholder}
            spellCheck={false}
            autoComplete="off"
            aria-label={messages.codeFillKeyLabel}
            className={blankInputClass}
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          />
        </div>
        <pre className="whitespace-pre-wrap">{task.middle}</pre>
        <div className="my-1 flex flex-wrap items-center gap-1">
          <input
            type="text"
            value={conditionBlank}
            onChange={(e) => {
              setConditionBlank(e.target.value);
              dirty();
            }}
            placeholder={task.conditionPlaceholder}
            spellCheck={false}
            autoComplete="off"
            aria-label={messages.codeFillConditionLabel}
            className={blankInputClass}
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          />
        </div>
        <pre className="whitespace-pre-wrap">{task.suffix}</pre>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={check}>
          {messages.codeFillCheck}
        </Button>
        {!passed && (keyBlank || conditionBlank) && (
          <button
            type="button"
            className="text-[length:var(--ml-text-xs)] text-ml-text-muted underline-offset-2 hover:text-ml-text-secondary hover:underline"
            onClick={() => {
              setKeyBlank("");
              setConditionBlank("");
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
