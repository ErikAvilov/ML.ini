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
}: PayloadRepairPanelProps) {
  const { messages } = useLocale();
  const [value, setValue] = useState(task.brokenPayload);
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
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (passed) setPassed(false);
          setFeedback(null);
        }}
        spellCheck={false}
        rows={6}
        className="mt-2 w-full resize-y border border-ml-border bg-ml-bg-0/70 px-2.5 py-2 font-mono text-[12px] leading-snug text-ml-text outline-none focus:border-ml-accent"
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
        <p className="mt-2 border-l-2 border-ml-danger pl-2.5 text-[length:var(--ml-text-sm)] text-ml-danger">
          {feedback}
        </p>
      )}
    </section>
  );
}
