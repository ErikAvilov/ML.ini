"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PipelineVisual } from "@/components/mission/PipelineVisual";
import { TestResults } from "@/components/mission/TestResults";
import { useLocale } from "@/i18n/locale-context";
import {
  evaluatePipelineConnections,
  evaluateSafetyConfig,
  portKey,
  type PipelineConnectionFail,
} from "@/lib/missions/pipeline";
import type {
  ClassificationResult,
  PipelineBlockSpec,
  PipelineConnections,
  PipelinePortRef,
  PipelineTask,
  SafetyReasonCode,
  SafetyRuleConfig,
  SafetyTask,
} from "@/lib/types";

const CONN_PREFIX = "mlini-pipeline-conn-v1:";
const PASS_PREFIX = "mlini-pipeline-pass-v1:";
const SAFETY_CFG_PREFIX = "mlini-safety-cfg-v1:";
const SAFETY_PASS_PREFIX = "mlini-safety-pass-v1:";

type Stage = "idle" | "input" | "instruction" | "model" | "output";
type RunMode = "idle" | "sequential" | "batch";

function serializePort(ref: PipelinePortRef): string {
  return `${ref.blockId}:${ref.field}`;
}

function parsePort(value: string): PipelinePortRef | null {
  if (!value) return null;
  const i = value.indexOf(":");
  if (i <= 0) return null;
  return {
    blockId: value.slice(0, i) as PipelinePortRef["blockId"],
    field: value.slice(i + 1),
  };
}

function portOptionLabel(
  blocks: PipelineBlockSpec[],
  ref: PipelinePortRef
): string {
  const block = blocks.find((b) => b.id === ref.blockId);
  const out = block?.outputs.find((o) => o.id === ref.field);
  return `${block?.title ?? ref.blockId} → ${out?.label ?? ref.field}`;
}

function persistJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function persistFlag(key: string, passed: boolean) {
  try {
    if (passed) sessionStorage.setItem(key, "1");
    else sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Presentation boundary for fixed-block pipeline missions (08–09).
 * Run/results/completion stay owned by MissionSession — passed as props.
 */
export interface PipelineBuilderWorkspaceProps {
  missionId: string;
  pipeline: PipelineTask;
  safety?: SafetyTask;
  connections: PipelineConnections;
  onConnectionsChange: (next: PipelineConnections) => void;
  pipelinePassed: boolean;
  onPipelinePassedChange: (passed: boolean) => void;
  safetyConfig?: SafetyRuleConfig;
  onSafetyConfigChange?: (next: SafetyRuleConfig) => void;
  safetyPassed?: boolean;
  onSafetyPassedChange?: (passed: boolean) => void;
  showcaseMessage: string;
  activeMessage: string;
  onRun: () => void;
  onRunBatch: () => void;
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
  canRun: boolean;
  /** Optional override for primary run button label. */
  runLabel?: string;
}

export function PipelineBuilderWorkspace({
  missionId,
  pipeline,
  safety,
  connections,
  onConnectionsChange,
  pipelinePassed,
  onPipelinePassedChange,
  safetyConfig,
  onSafetyConfigChange,
  safetyPassed = false,
  onSafetyPassedChange,
  showcaseMessage,
  activeMessage,
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
  canRun,
  runLabel: runLabelProp,
}: PipelineBuilderWorkspaceProps) {
  const { messages, t } = useLocale();
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const onPipelinePassedChangeRef = useRef(onPipelinePassedChange);
  const onSafetyPassedChangeRef = useRef(onSafetyPassedChange);

  useEffect(() => {
    onPipelinePassedChangeRef.current = onPipelinePassedChange;
  }, [onPipelinePassedChange]);

  useEffect(() => {
    onSafetyPassedChangeRef.current = onSafetyPassedChange;
  }, [onSafetyPassedChange]);

  // Parent remounts via key={missionId}; restore passed flags once.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PASS_PREFIX + missionId) === "1") {
        onPipelinePassedChangeRef.current(true);
      }
      if (
        safety &&
        sessionStorage.getItem(SAFETY_PASS_PREFIX + missionId) === "1"
      ) {
        onSafetyPassedChangeRef.current?.(true);
      }
    } catch {
      /* ignore */
    }
  }, [missionId, safety]);

  const displayedMessage =
    running && runMode === "sequential" ? activeMessage : showcaseMessage;
  const allDone = !running && results.length === testCount && testCount > 0;
  const allPassed = allDone && results.every((r) => r.matchesExpected);
  const outcome = allDone ? (allPassed ? "success" : "failure") : "idle";
  const runLabel =
    runLabelProp ??
    (safety ? messages.runIncidentTests : messages.runWorkflow);

  function failMessage(which: PipelineConnectionFail): string {
    switch (which) {
      case "decision_got_response":
        return messages.pipelineDecisionGotResponse;
      case "decision_got_object":
        return messages.pipelineDecisionGotObject;
      case "decision_got_sentiment":
        return messages.pipelineDecisionGotSentiment;
      case "ai_needs_message":
      case "action_missing_message":
        return messages.pipelineMissingMessage;
      default:
        return messages.pipelineFailGeneric;
    }
  }

  function setConnection(inputKey: string, value: string) {
    const next: PipelineConnections = {
      ...connections,
      [inputKey]: parsePort(value),
    };
    onConnectionsChange(next);
    persistJson(CONN_PREFIX + missionId, next);
    setCheckFeedback(null);
    if (pipelinePassed) {
      onPipelinePassedChange(false);
      persistFlag(PASS_PREFIX + missionId, false);
    }
  }

  function checkPipeline() {
    const result = evaluatePipelineConnections(
      connections,
      pipeline.expectedConnections
    );
    if (result.ok) {
      setCheckFeedback(null);
      onPipelinePassedChange(true);
      persistFlag(PASS_PREFIX + missionId, true);
      persistJson(CONN_PREFIX + missionId, connections);
      return;
    }
    onPipelinePassedChange(false);
    persistFlag(PASS_PREFIX + missionId, false);
    setCheckFeedback(failMessage(result.which));
  }

  function patchSafety(
    family: keyof SafetyRuleConfig,
    patch: Partial<SafetyRuleConfig[keyof SafetyRuleConfig]>
  ) {
    if (!safetyConfig || !onSafetyConfigChange) return;
    const next: SafetyRuleConfig = {
      ...safetyConfig,
      [family]: { ...safetyConfig[family], ...patch },
    };
    onSafetyConfigChange(next);
    persistJson(SAFETY_CFG_PREFIX + missionId, next);
    setSafetyFeedback(null);
    if (safetyPassed) {
      onSafetyPassedChange?.(false);
      persistFlag(SAFETY_PASS_PREFIX + missionId, false);
    }
  }

  function checkSafety() {
    if (!safety || !safetyConfig || !onSafetyPassedChange) return;
    const result = evaluateSafetyConfig(safetyConfig, safety.expected);
    if (result.ok) {
      setSafetyFeedback(null);
      onSafetyPassedChange(true);
      persistFlag(SAFETY_PASS_PREFIX + missionId, true);
      persistJson(SAFETY_CFG_PREFIX + missionId, safetyConfig);
      return;
    }
    onSafetyPassedChange(false);
    persistFlag(SAFETY_PASS_PREFIX + missionId, false);
    setSafetyFeedback(messages.pipelineFailGeneric);
  }

  return (
    <div className="ml-mission-workspace-grid flex h-full min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-ml-border bg-ml-surface-raised/80 px-3 py-2 sm:px-4">
        <p className="min-w-0 flex-1 truncate font-mono text-[length:var(--ml-text-sm)] text-ml-text-primary">
          <span className="mr-2 text-ml-text-muted">
            {messages.clientMessage}
          </span>
          {displayedMessage}
        </p>
        {running && (
          <span className="shrink-0 font-mono text-[11px] text-ml-state-active uppercase">
            {runMode === "batch"
              ? messages.runBatchProgress
              : t(messages.runTestProgress, {
                  current: currentIndex + 1,
                  total: testCount,
                })}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-[4] overflow-y-auto overscroll-contain border-b border-ml-border bg-ml-surface-inset/40 [scrollbar-gutter:stable]">
        <div className="flex flex-col gap-0 px-3 py-3 sm:px-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
              {pipeline.title}
            </p>
            <p
              className={`font-mono text-[11px] tracking-[0.06em] uppercase ${
                pipelinePassed
                  ? "text-ml-state-completed"
                  : "text-ml-text-muted"
              }`}
            >
              {pipelinePassed
                ? `✓ ${pipeline.passLabel}`
                : pipeline.checkLabel}
            </p>
            <div className="ml-auto">
              <Button variant="secondary" size="sm" onClick={checkPipeline}>
                {messages.pipelineCheck}
              </Button>
            </div>
          </div>
          {pipeline.description ? (
            <p className="mb-3 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
              {pipeline.description}
            </p>
          ) : null}
          {checkFeedback ? (
            <p className="mb-3 text-[length:var(--ml-text-sm)] text-ml-state-error">
              {checkFeedback}
            </p>
          ) : null}

          {pipeline.blocks.map((block, index) => (
            <div key={block.id} className="flex flex-col">
              {index > 0 ? (
                <div
                  className={`mx-auto h-4 w-px ${
                    block.inputs.every(
                      (input) => connections[portKey(block.id, input.id)]
                    )
                      ? "bg-ml-accent/50"
                      : "bg-ml-border"
                  }`}
                  aria-hidden
                />
              ) : null}
              <PipelineBlockCard
                block={block}
                blocks={pipeline.blocks}
                connections={connections}
                onSelect={setConnection}
              />
            </div>
          ))}

          {safety && safetyConfig && onSafetyConfigChange ? (
            <div className="mt-5 border-t border-ml-border pt-4">
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
                  {safety.title}
                </p>
                <p
                  className={`font-mono text-[11px] tracking-[0.06em] uppercase ${
                    safetyPassed
                      ? "text-ml-state-completed"
                      : "text-ml-text-muted"
                  }`}
                >
                  {safetyPassed ? `✓ ${safety.passLabel}` : safety.checkLabel}
                </p>
                <div className="ml-auto">
                  <Button variant="secondary" size="sm" onClick={checkSafety}>
                    {messages.pipelineCheck}
                  </Button>
                </div>
              </div>
              {safety.description ? (
                <p className="mb-3 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
                  {safety.description}
                </p>
              ) : null}
              {safetyFeedback ? (
                <p className="mb-3 text-[length:var(--ml-text-sm)] text-ml-state-error">
                  {safetyFeedback}
                </p>
              ) : null}
              <SafetyRuleRow
                label="Parse fail"
                reasons={safety.parseFailReasons}
                config={safetyConfig.onParseFail}
                onChange={(patch) => patchSafety("onParseFail", patch)}
              />
              <SafetyRuleRow
                label="Invalid priority"
                reasons={safety.invalidPriorityReasons}
                config={safetyConfig.onInvalidPriority}
                onChange={(patch) => patchSafety("onInvalidPriority", patch)}
              />
              <SafetyRuleRow
                label="Action fail"
                reasons={safety.actionFailReasons}
                config={safetyConfig.onActionFail}
                onChange={(patch) => patchSafety("onActionFail", patch)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-ml-border bg-ml-surface-raised/80 px-3 py-2.5 sm:px-4">
        <Button
          variant="primary"
          size="md"
          onClick={onRun}
          disabled={Boolean(running || !canRun)}
          aria-busy={running && runMode === "sequential"}
          title={messages.runShortcutHint}
        >
          <Play className="h-3.5 w-3.5" />
          {runLabel}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onRunBatch}
          disabled={Boolean(running || !canRun)}
          title={messages.runBatch}
        >
          <Layers className="h-3.5 w-3.5" />
          {messages.runBatch}
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
          <p className="min-w-0 flex-1 truncate text-[length:var(--ml-text-sm)] text-ml-state-error">
            {error}
          </p>
        )}
        {(running || liveOutput) && (
          <div className="ml-auto min-w-0 max-w-[min(100%,20rem)]">
            <PipelineVisual
              compact
              output={liveOutput}
              activeStage={stage}
              running={running}
              outcome={outcome}
              testLabel={null}
            />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2.5 sm:px-4">
        <p className="ml-mission-section-label mb-1.5 shrink-0">
          {messages.tests}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
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
            <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-state-completed">
              {messages.nextMissionUnlockedMap}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineBlockCard({
  block,
  blocks,
  connections,
  onSelect,
}: {
  block: PipelineBlockSpec;
  blocks: PipelineBlockSpec[];
  connections: PipelineConnections;
  onSelect: (inputKey: string, value: string) => void;
}) {
  return (
    <div className="border border-ml-border bg-ml-surface-1 px-3 py-2.5">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] tracking-[0.1em] text-ml-text-primary uppercase">
          {block.title}
        </p>
        {block.outputs.length > 0 ? (
          <p className="font-mono text-[10px] text-ml-text-muted">
            out · {block.outputs.map((o) => o.label).join(" · ")}
          </p>
        ) : null}
      </div>
      {block.inputs.length === 0 ? (
        <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
          —
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {block.inputs.map((input) => {
            const key = portKey(block.id, input.id);
            const current = connections[key];
            return (
              <li key={input.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <label
                  htmlFor={`pipe-${key}`}
                  className="shrink-0 font-mono text-[11px] text-ml-text-secondary"
                >
                  {input.label}
                </label>
                <select
                  id={`pipe-${key}`}
                  className="min-w-0 flex-1 cursor-pointer border border-ml-border bg-ml-surface-inset px-2 py-1.5 font-mono text-[length:var(--ml-text-sm)] text-ml-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
                  value={current ? serializePort(current) : ""}
                  onChange={(e) => onSelect(key, e.target.value)}
                >
                  <option value="">—</option>
                  {input.allowed.map((ref) => (
                    <option key={serializePort(ref)} value={serializePort(ref)}>
                      {portOptionLabel(blocks, ref)}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SafetyRuleRow({
  label,
  reasons,
  config,
  onChange,
}: {
  label: string;
  reasons: SafetyReasonCode[];
  config: SafetyRuleConfig["onParseFail"];
  onChange: (
    patch: Partial<SafetyRuleConfig["onParseFail"]>
  ) => void;
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 border border-ml-border bg-ml-surface-1 px-3 py-2.5 sm:flex-row sm:items-end sm:gap-3">
      <p className="shrink-0 font-mono text-[11px] tracking-[0.08em] text-ml-text-secondary uppercase sm:w-36">
        {label}
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="font-mono text-[10px] text-ml-text-muted">
          Target
        </label>
        <select
          className="cursor-pointer border border-ml-border bg-ml-surface-inset px-2 py-1.5 font-mono text-[length:var(--ml-text-sm)] text-ml-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          value={config.target}
          onChange={() => onChange({ target: "MANUAL_REVIEW" })}
        >
          <option value="MANUAL_REVIEW">MANUAL REVIEW</option>
        </select>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="font-mono text-[10px] text-ml-text-muted">
          Reason
        </label>
        <select
          className="cursor-pointer border border-ml-border bg-ml-surface-inset px-2 py-1.5 font-mono text-[length:var(--ml-text-sm)] text-ml-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-accent"
          value={config.reason}
          onChange={(e) =>
            onChange({ reason: e.target.value as SafetyReasonCode })
          }
        >
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
