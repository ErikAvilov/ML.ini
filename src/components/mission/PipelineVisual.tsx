"use client";

import { motion, useReducedMotion } from "framer-motion";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type PipelineOutcome = "idle" | "success" | "failure";

interface PipelineVisualProps {
  output: string | null;
  activeStage: Stage;
  running: boolean;
  testLabel?: string | null;
  outcome?: PipelineOutcome;
}

const STEPS: { id: Stage; label: string }[] = [
  { id: "input", label: "Message" },
  { id: "instruction", label: "Instruction" },
  { id: "model", label: "Model" },
  { id: "output", label: "Output" },
];

function stepState(
  stepId: Stage,
  index: number,
  activeStage: Stage,
  running: boolean,
  outcome: PipelineOutcome
): "idle" | "active" | "processing" | "done" | "success" | "failure" {
  if (!running && outcome === "success" && stepId === "output") return "success";
  if (!running && outcome === "failure" && stepId === "output") return "failure";
  if (!running) return "idle";

  const activeIndex = STEPS.findIndex((s) => s.id === activeStage);
  if (stepId === "model" && activeStage === "model") return "processing";
  if (index === activeIndex) return "active";
  if (index < activeIndex) return "done";
  return "idle";
}

export function PipelineVisual({
  output,
  activeStage,
  running,
  testLabel,
  outcome = "idle",
}: PipelineVisualProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="ml-section-label">Pipeline</p>
        {testLabel && (
          <p className="truncate text-[length:var(--ml-text-xs)] text-ml-accent">
            {testLabel}
          </p>
        )}
      </div>

      <div className="flex min-w-0 items-stretch gap-1.5 overflow-x-auto pb-0.5">
        {STEPS.map((step, index) => {
          const state = stepState(
            step.id,
            index,
            activeStage,
            running,
            outcome
          );

          const idle = state === "idle";
          const lit =
            state === "active" ||
            state === "processing" ||
            state === "done" ||
            state === "success";

          return (
            <div
              key={step.id}
              className="flex min-w-0 flex-1 items-center gap-1.5"
            >
              <div
                className={`min-w-0 flex-1 border px-2.5 py-2 text-center transition-colors duration-200 ${
                  state === "active" || state === "processing"
                    ? "border-[var(--ml-border-accent)] bg-[var(--ml-accent-soft)] text-ml-accent"
                    : state === "done" || state === "success"
                      ? "border-[color-mix(in_srgb,var(--ml-success)_28%,transparent)] bg-[var(--ml-success-soft)] text-ml-text"
                      : state === "failure"
                        ? "border-[color-mix(in_srgb,var(--ml-danger)_32%,transparent)] bg-[var(--ml-danger-soft)] text-ml-danger"
                        : "border-ml-border bg-ml-bg-1/70 text-ml-text-muted"
                }`}
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                <p className="truncate text-[length:var(--ml-text-xs)] font-medium">
                  {step.label}
                </p>
                {state === "processing" && (
                  <motion.p
                    className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-accent"
                    animate={
                      reduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : { repeat: Infinity, duration: 1.1 }
                    }
                  >
                    en cours…
                  </motion.p>
                )}
                {step.id === "output" && output && !idle && (
                  <p
                    className={`mt-0.5 truncate font-mono text-[length:var(--ml-text-xs)] ${
                      state === "failure" ? "text-ml-danger" : "text-ml-text"
                    }`}
                  >
                    {output}
                  </p>
                )}
                {step.id === "output" && !running && outcome === "success" && (
                  <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-success">
                    Pass
                  </p>
                )}
                {step.id === "output" && !running && outcome === "failure" && (
                  <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-danger">
                    Fail
                  </p>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`shrink-0 text-[length:var(--ml-text-sm)] ${
                    lit ? "text-ml-text-muted" : "text-ml-border-strong"
                  }`}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
