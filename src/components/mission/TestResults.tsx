"use client";

import { Check, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ClassificationResult } from "@/lib/types";

interface TestResultsProps {
  results: ClassificationResult[];
  total: number;
  feedback: string | null;
  running: boolean;
  currentIndex: number;
}

export function TestResults({
  results,
  total,
  feedback,
  running,
  currentIndex,
}: TestResultsProps) {
  const reduceMotion = useReducedMotion();
  const passed = results.filter((r) => r.matchesExpected).length;
  const done = results.length === total && total > 0 && !running;

  return (
    <div className="min-h-0 min-w-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <div>
          <p className="ml-section-label">Tests</p>
          <p className="mt-0.5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            Même instruction · {total} messages
          </p>
        </div>
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
            {done ? (passed === total ? " Pass" : " Fail") : ""}
          </span>
        )}
      </div>

      <ul className="space-y-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const result = results[i];
          const isRunning = running && currentIndex === i;

          let statusLabel = "En attente";
          let detail = "";
          if (isRunning) {
            statusLabel = "En cours";
          } else if (result?.matchesExpected) {
            statusLabel = "Pass";
            detail = result.normalized ?? result.raw;
          } else if (result) {
            statusLabel = "Fail";
            detail = result.isValidCategory
              ? result.normalized ?? result.raw
              : "Format invalide";
          }

          return (
            <li
              key={i}
              className={`flex items-start gap-2.5 border px-2.5 py-2 ${
                result?.matchesExpected
                  ? "border-[color-mix(in_srgb,var(--ml-success)_25%,transparent)] bg-[var(--ml-success-soft)]"
                  : result
                    ? "border-[color-mix(in_srgb,var(--ml-danger)_25%,transparent)] bg-[var(--ml-danger-soft)]"
                    : isRunning
                      ? "border-[var(--ml-border-accent)] bg-ml-surface-1"
                      : "border-ml-border bg-ml-bg-1/40"
              }`}
              style={{ borderRadius: "var(--ml-frame-radius)" }}
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
                  {detail && (
                    <span className="truncate font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                      {detail}
                    </span>
                  )}
                </div>
                {result && (
                  <p className="mt-1 truncate text-[length:var(--ml-text-sm)] text-ml-text-muted italic">
                    “{result.message}”
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {feedback && !running && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 border-l-2 pl-3 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body ${
              passed === total ? "border-ml-success" : "border-ml-reward"
            }`}
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
