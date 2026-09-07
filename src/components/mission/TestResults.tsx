"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/i18n/locale-context";
import { LEAD } from "@/data/narrative/canon";
import { Frame } from "@/components/ui/Frame";
import type { ClassificationResult } from "@/lib/types";

interface TestResultsProps {
  results: ClassificationResult[];
  total: number;
  feedback: string | null;
  feedbackSpeaker?: "mira" | null;
  running: boolean;
  /** sequential = one active row; batch = all pending rows animate together */
  runMode?: "idle" | "sequential" | "batch";
  currentIndex: number;
}

function displayOutput(value: string | null | undefined): string {
  if (!value) return "—";
  return value;
}

export function TestResults({
  results,
  total,
  feedback,
  feedbackSpeaker = null,
  running,
  runMode = "idle",
  currentIndex,
}: TestResultsProps) {
  const { messages } = useLocale();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [openRow, setOpenRow] = useState<number | null>(null);

  const passed = results.filter((r) => r.matchesExpected).length;
  const done = results.length === total && total > 0 && !running;
  const hasResults = results.length > 0;
  const showExpanded = expanded && !running && hasResults;
  const activeOpenRow = running ? null : openRow;
  const batchRunning = running && runMode === "batch";

  useEffect(() => {
    if (!showExpanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showExpanded]);

  function toggleRow(index: number, hasResult: boolean) {
    if (!hasResult || running) return;
    setOpenRow((current) => (current === index ? null : index));
  }

  const list = (
    <ul className={`space-y-1.5 ${showExpanded ? "space-y-2.5" : ""}`}>
      {Array.from({ length: total }).map((_, i) => {
        const result = results[i];
        const isRunning =
          !result &&
          (batchRunning || (running && runMode !== "batch" && currentIndex === i));
        const isOpen = showExpanded || activeOpenRow === i;

        let statusLabel: string = messages.testPending;
        if (isRunning) {
          statusLabel = batchRunning
            ? messages.runBatchProgress
            : messages.testRunning;
        } else if (result?.matchesExpected) {
          statusLabel = messages.testPass;
        } else if (result) {
          statusLabel = messages.testFail;
        }

        const received = result
          ? result.isValidCategory
            ? result.normalized ?? result.raw
            : messages.formatInvalid
          : null;

        return (
          <li key={i}>
            <button
              type="button"
              disabled={!result || running}
              onClick={() => toggleRow(i, Boolean(result))}
              className={`flex w-full items-start gap-2.5 border px-2.5 py-2 text-left transition duration-150 ${
                result?.matchesExpected
                  ? "border-[color-mix(in_srgb,var(--ml-success)_25%,transparent)] bg-[var(--ml-success-soft)]"
                  : result
                    ? "border-[color-mix(in_srgb,var(--ml-danger)_25%,transparent)] bg-[var(--ml-danger-soft)]"
                    : isRunning
                      ? "border-[var(--ml-border-accent)] bg-ml-surface-1"
                      : "border-ml-border bg-ml-bg-1/40"
              } ${
                result && !running
                  ? "cursor-pointer hover:border-ml-border-strong hover:bg-ml-surface-hover/40"
                  : "cursor-default"
              }`}
              style={{ borderRadius: "var(--ml-frame-radius)" }}
              aria-expanded={result ? isOpen : undefined}
            >
              <span className="mt-0.5 shrink-0">
                {result?.matchesExpected ? (
                  <Check className="h-4 w-4 text-ml-success" />
                ) : result ? (
                  <X className="h-4 w-4 text-ml-danger" />
                ) : isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin text-ml-accent" />
                ) : (
                  <span className="mt-0.5 block h-4 w-4 rounded-full border border-ml-text-muted/35" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[length:var(--ml-text-sm)] font-medium text-ml-text">
                    Test {i + 1}
                  </span>
                  <span
                    className={`text-[length:var(--ml-text-xs)] ${
                      result?.matchesExpected
                        ? "text-ml-success"
                        : result
                          ? "text-ml-danger"
                          : isRunning
                            ? "text-ml-accent"
                            : "text-ml-text-muted"
                    }`}
                  >
                    {statusLabel}
                  </span>
                  {received && !isOpen && (
                    <span className="truncate font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                      {received.replace(/\n/g, " · ")}
                    </span>
                  )}
                </div>

                {result && !isOpen && (
                  <p className="mt-1 truncate text-[length:var(--ml-text-sm)] text-ml-text-muted italic">
                    “{result.message}”
                  </p>
                )}

                {result && isOpen && (
                  <div className="mt-3 space-y-3 text-[length:var(--ml-text-sm)]">
                    <div>
                      <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-text-muted">
                        {messages.testCustomerMessage}
                      </p>
                      <p className="mt-1 leading-relaxed text-ml-text-body italic">
                        “{result.message}”
                      </p>
                    </div>

                    {result.contractOk !== undefined && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div
                          className="border border-ml-border bg-ml-bg-1/50 px-2.5 py-2"
                          style={{ borderRadius: "var(--ml-frame-radius)" }}
                        >
                          <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.08em] text-ml-text-muted uppercase">
                            {messages.contentCheckLabel}
                          </p>
                          <p
                            className={`mt-1 text-[length:var(--ml-text-sm)] font-medium ${
                              result.contentOk === true
                                ? "text-ml-success"
                                : result.contentOk === false
                                  ? "text-ml-danger"
                                  : "text-ml-text-muted"
                            }`}
                          >
                            {result.contentOk === true
                              ? `✓ ${messages.contentCorrect}`
                              : result.contentOk === false
                                ? `✕ ${messages.contentIncorrect}`
                                : `· ${messages.contentUnclear}`}
                          </p>
                        </div>
                        <div
                          className="border border-ml-border bg-ml-bg-1/50 px-2.5 py-2"
                          style={{ borderRadius: "var(--ml-frame-radius)" }}
                        >
                          <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.08em] text-ml-text-muted uppercase">
                            {messages.outputContractCheckLabel}
                          </p>
                          <p
                            className={`mt-1 text-[length:var(--ml-text-sm)] font-medium ${
                              result.contractOk
                                ? "text-ml-success"
                                : "text-ml-danger"
                            }`}
                          >
                            {result.contractOk
                              ? `✓ ${messages.contractValid}`
                              : `✕ ${messages.contractInvalid}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {result.contractOk && result.parsedFields ? (
                      <div className="space-y-2.5">
                        {Object.keys(result.parsedFields).map((field) => {
                          const expectedLine = result.expected
                            .split("\n")
                            .find((line) =>
                              line
                                .toUpperCase()
                                .startsWith(`${field.toUpperCase()}:`)
                            );
                          const expectedValue =
                            expectedLine?.split(":").slice(1).join(":").trim() ??
                            "—";
                          const receivedValue = result.parsedFields?.[field] ?? "—";
                          const fieldOk =
                            !result.fieldMismatches?.includes(field);

                          return (
                            <div
                              key={field}
                              className="border border-ml-border/80 px-2.5 py-2"
                              style={{ borderRadius: "var(--ml-frame-radius)" }}
                            >
                              <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                                {field}
                              </p>
                              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                                <p className="text-[length:var(--ml-text-sm)] text-ml-text">
                                  <span className="text-ml-text-muted">
                                    {messages.testExpected}:{" "}
                                  </span>
                                  <span className="font-mono">{expectedValue}</span>
                                </p>
                                <p
                                  className={`text-[length:var(--ml-text-sm)] ${
                                    fieldOk ? "text-ml-success" : "text-ml-danger"
                                  }`}
                                >
                                  <span className="text-ml-text-muted">
                                    {messages.testReceived}:{" "}
                                  </span>
                                  <span className="font-mono">{receivedValue}</span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-text-muted">
                            {messages.testExpected}
                          </p>
                          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text">
                            {displayOutput(result.expected)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-text-muted">
                            {messages.testReceived}
                          </p>
                          <pre
                            className={`mt-1 whitespace-pre-wrap break-words font-mono text-[length:var(--ml-text-sm)] leading-relaxed ${
                              result.matchesExpected
                                ? "text-ml-success"
                                : "text-ml-danger"
                            }`}
                          >
                            {displayOutput(received)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {result.raw !== received && (
                      <div>
                        <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-text-muted">
                          {messages.testRawOutput}
                        </p>
                        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                          {displayOutput(result.raw)}
                        </pre>
                      </div>
                    )}
                    {result.failHint && !result.matchesExpected && (
                      <p className="border-l-2 border-ml-reward/50 pl-3 text-ml-text-body">
                        {result.failHint}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const feedbackBlock = feedback && !running && (
    <div
      className={`mt-3 border-l-2 pl-3 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body ${
        passed === total ? "border-ml-success" : "border-ml-reward"
      }`}
    >
      {passed < total && (
        <p className="mb-1.5 font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-reward uppercase">
          {messages.solutionFailedLabel}
        </p>
      )}
      {feedbackSpeaker === "mira" && (
        <p className="mb-1.5 font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-reward uppercase">
          {LEAD.displayName}
        </p>
      )}
      {feedback.split("\n").map((line, index) => (
        <p
          key={`${index}-${line}`}
          className={`mt-1 first:mt-0 ${
            line.startsWith("EXPECTED:") || line.startsWith("RECEIVED:")
              ? "whitespace-pre-wrap font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary"
              : ""
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );

  const header = (
    <div className="mb-2.5 flex items-start justify-between gap-2">
      <div
        className={`min-w-0 rounded-sm transition ${
          hasResults && !running && !showExpanded
            ? "cursor-pointer hover:opacity-90"
            : ""
        }`}
      >
        <p className="ml-section-label">{messages.tests}</p>
        <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
          {batchRunning
            ? messages.batchEvaluatingAll
            : messages.sameInstructionMessages.replace(
                "{count}",
                String(total)
              )}
        </p>
        {hasResults && !running && !showExpanded && (
          <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.clickToExpandTests}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {(results.length > 0 || running) && (
          <span
            className={`font-mono text-[length:var(--ml-text-sm)] ${
              done && passed === total
                ? "text-ml-success"
                : done
                  ? "text-ml-danger"
                  : "text-ml-text"
            }`}
          >
            {passed}/{total}
            {done
              ? passed === total
                ? ` ${messages.testPass}`
                : ` ${messages.testFail}`
              : ""}
          </span>
        )}
        {hasResults && !running && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1 border border-ml-border bg-ml-surface-1 px-2 py-1 text-[length:var(--ml-text-xs)] text-ml-text-secondary transition hover:border-ml-border-strong hover:bg-ml-surface-hover hover:text-ml-text"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
            aria-label={
              showExpanded ? messages.collapseTests : messages.expandTests
            }
          >
            {showExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {showExpanded ? messages.collapseTests : messages.expandTests}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`min-h-0 min-w-0 ${
          hasResults && !running && !showExpanded ? "cursor-pointer" : ""
        }`}
        onClick={(e) => {
          if (showExpanded || running || !hasResults) return;
          const target = e.target as HTMLElement;
          if (target.closest("button")) return;
          setExpanded(true);
        }}
      >
        {header}
        {list}
        <AnimatePresence>
          {feedbackBlock && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {feedbackBlock}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--ml-bg-0)_88%,transparent)] p-4 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={messages.tests}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Frame className="bg-ml-surface-1 p-5 sm:p-6">
                {header}
                {list}
                {feedbackBlock}
              </Frame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
