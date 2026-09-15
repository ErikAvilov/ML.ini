"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/i18n/locale-context";
import {
  evaluatePayloadRepair,
  type JsonErrorCode,
} from "@/lib/validation";
import type { PayloadRepairTask, StructuredOutputSchema } from "@/lib/types";
import type { CommonMessages } from "@/i18n/messages/common";

const STORAGE_PREFIX = "mlini-payload-repair-v1:";
const TEXT_PREFIX = "mlini-payload-repair-text-v1:";

interface PayloadRepairPanelProps {
  missionId: string;
  task: PayloadRepairTask;
  schema: StructuredOutputSchema;
  passed: boolean;
  onPassedChange: (passed: boolean) => void;
  /** Highlight when tests passed but repair is still the blocking gate. */
  emphasized?: boolean;
}

function messageForRepairFailure(
  messages: CommonMessages,
  result: {
    jsonErrorCode?: JsonErrorCode;
    contentMismatch?: boolean;
  }
): string {
  if (result.contentMismatch) return messages.payloadRepairContentFail;
  switch (result.jsonErrorCode) {
    case "trailing_comma":
      return messages.feedbackJsonTrailingComma;
    case "unquoted_keys":
      return messages.feedbackJsonUnquotedKeys;
    case "single_quotes":
      return messages.feedbackJsonSingleQuotes;
    case "unclosed":
      return messages.feedbackJsonUnclosed;
    case "prose_wrapper":
      return messages.feedbackJsonProseWrapper;
    case "extra_fields":
      return messages.feedbackJsonExtraFields;
    case "wrong_keys":
      return messages.feedbackJsonWrongKeys;
    case "invalid_values":
      return messages.payloadRepairContentFail;
    default:
      return messages.feedbackJsonInvalid;
  }
}

export function PayloadRepairPanel({
  missionId,
  task,
  schema,
  passed,
  onPassedChange,
  emphasized = false,
}: PayloadRepairPanelProps) {
  const { messages } = useLocale();
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return task.brokenPayload;
    try {
      return (
        sessionStorage.getItem(TEXT_PREFIX + missionId) ?? task.brokenPayload
      );
    } catch {
      return task.brokenPayload;
    }
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const onPassedChangeRef = useRef(onPassedChange);

  useEffect(() => {
    onPassedChangeRef.current = onPassedChange;
  }, [onPassedChange]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_PREFIX + missionId) === "1") {
        onPassedChangeRef.current(true);
      }
    } catch {
      /* ignore */
    }
  }, [missionId]);

  function setPassed(next: boolean) {
    onPassedChange(next);
    try {
      if (next) {
        sessionStorage.setItem(STORAGE_PREFIX + missionId, "1");
        sessionStorage.setItem(TEXT_PREFIX + missionId, value);
      } else {
        sessionStorage.removeItem(STORAGE_PREFIX + missionId);
        sessionStorage.removeItem(TEXT_PREFIX + missionId);
      }
    } catch {
      /* ignore */
    }
  }

  function check() {
    const result = evaluatePayloadRepair(value, task.expectedFields, schema);
    if (result.ok) {
      setFeedback(null);
      try {
        sessionStorage.setItem(TEXT_PREFIX + missionId, value);
      } catch {
        /* ignore */
      }
      setPassed(true);
      return;
    }
    setPassed(false);
    setFeedback(messageForRepairFailure(messages, result));
  }

  return (
    <section
      id="ml-payload-repair"
      className={`ml-mission-callout-objective px-3 py-3 ${
        emphasized
          ? "border border-ml-state-active bg-[color-mix(in_srgb,var(--ml-state-active)_8%,transparent)] ring-1 ring-ml-state-active/40"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="ml-mission-section-label text-ml-state-active">
          {task.title}
        </p>
        <p
          className={`font-mono text-[11px] tracking-[0.06em] uppercase ${
            passed ? "text-ml-state-completed" : "text-ml-state-active"
          }`}
        >
          {passed ? `✓ ${task.passLabel}` : task.checkLabel}
        </p>
      </div>
      {emphasized && !passed ? (
        <p className="mt-2 text-[length:var(--ml-text-sm)] font-medium leading-snug text-ml-state-active">
          {messages.payloadRepairRequired}
        </p>
      ) : null}
      <p className="mt-1.5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
        {task.description}
      </p>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (passed) setPassed(false);
          setFeedback(null);
        }}
        spellCheck={false}
        rows={6}
        className="mt-2 w-full resize-y border border-ml-border bg-ml-surface-inset px-2.5 py-2 font-mono text-[12px] leading-snug text-ml-text-primary outline-none focus:border-ml-state-active"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        aria-label={task.title}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={check}>
          {messages.payloadRepairCheck}
        </Button>
        {!passed && (
          <button
            type="button"
            className="text-[length:var(--ml-text-xs)] text-ml-text-muted underline-offset-2 hover:text-ml-text-secondary hover:underline"
            onClick={() => {
              setValue(task.brokenPayload);
              setFeedback(null);
              setPassed(false);
            }}
          >
            {messages.payloadRepairReset}
          </button>
        )}
      </div>
      {feedback && (
        <p className="mt-2 border-l-2 border-ml-state-error pl-2.5 text-[length:var(--ml-text-sm)] text-ml-state-error">
          {feedback}
        </p>
      )}
    </section>
  );
}
