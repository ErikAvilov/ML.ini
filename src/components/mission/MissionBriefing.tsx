"use client";

import { useLocale } from "@/i18n/locale-context";
import type {
  CodeFillTask,
  MissionBriefingContent,
  MissionHint,
  PayloadRepairTask,
  StructuredOutputSchema,
} from "@/lib/types";
import { HintPanel } from "@/components/mission/HintPanel";
import { MiraMessage } from "@/components/mission/MiraMessage";
import { CollapsibleBlock } from "@/components/mission/CollapsibleBlock";
import {
  FormatCompare,
  SentimentPolicyBody,
  SupportPolicyBody,
} from "@/components/mission/BriefBlocks";
import { PayloadRepairPanel } from "@/components/mission/PayloadRepairPanel";
import { CodeFillPanel } from "@/components/mission/CodeFillPanel";

interface MissionBriefingProps {
  briefing: MissionBriefingContent;
  missionTitle: string;
  missionOrder: number;
  alreadyCleared?: boolean;
  hints: MissionHint[];
  instruction: string;
  objective: string;
  missionId: string;
  payloadRepair?: PayloadRepairTask;
  codeFill?: CodeFillTask;
  outputSchema?: StructuredOutputSchema;
  repairPassed?: boolean;
  onRepairPassedChange?: (passed: boolean) => void;
  codeFillPassed?: boolean;
  onCodeFillPassedChange?: (passed: boolean) => void;
}

export function MissionBriefing({
  briefing,
  missionTitle,
  missionOrder,
  alreadyCleared,
  hints,
  instruction,
  objective,
  missionId,
  payloadRepair,
  codeFill,
  outputSchema,
  repairPassed = false,
  onRepairPassedChange,
  codeFillPassed = false,
  onCodeFillPassedChange,
}: MissionBriefingProps) {
  const { messages } = useLocale();
  const objectiveText = briefing.objectiveText ?? objective;
  const shortBrief =
    briefing.shortBrief ??
    briefing.welcomeParagraphs?.filter(Boolean).slice(0, 2).join(" ") ??
    "";

  const currentSentiment =
    briefing.currentSentimentPolicy ??
    (!briefing.previousRules ? briefing.sentimentPolicy : undefined);
  const currentPolicy =
    briefing.currentPolicy ??
    (!briefing.previousRules ? briefing.policy : undefined);

  const previous = briefing.previousRules;

  return (
    <div className="space-y-3.5 text-[length:var(--ml-text-sm)] leading-snug">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-text-muted uppercase">
            Mission {String(missionOrder).padStart(2, "0")}
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] text-ml-accent uppercase">
            {alreadyCleared
              ? messages.statusClearedReplay
              : messages.statusInProgress}
          </p>
        </div>
        <h1 className="mt-1 font-display text-[1.75rem] leading-tight text-ml-text sm:text-[1.875rem]">
          {missionTitle}
        </h1>
      </header>

      {shortBrief ? <MiraMessage message={shortBrief} /> : null}

      <section
        className="border border-[color-mix(in_srgb,var(--ml-accent)_35%,var(--ml-border))] bg-[color-mix(in_srgb,var(--ml-accent)_8%,transparent)] px-3 py-2.5"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
          {messages.objectiveLabel}
        </p>
        <p className="mt-1 text-[length:var(--ml-text-md)] font-medium leading-snug whitespace-pre-line text-ml-text">
          {objectiveText}
        </p>
        {briefing.categories && briefing.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {briefing.categories.map((category) => (
              <span
                key={category}
                className="border border-ml-border-strong bg-ml-bg-1 px-2 py-0.5 font-mono text-[11px] text-ml-text"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </section>

      {briefing.newConcept && (
        <section
          className="border border-ml-border bg-ml-surface-1/40 px-3 py-2.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
            {briefing.newConcept.title}
          </p>
          {briefing.newConcept.summary && (
            <p className="mt-1.5 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body">
              {briefing.newConcept.summary}
            </p>
          )}
          {briefing.newConcept.example && (
            <pre className="mt-1.5 overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text">
              {briefing.newConcept.example}
            </pre>
          )}
          {briefing.newConcept.labels &&
            briefing.newConcept.labels.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 font-mono text-[11px] text-ml-secondary">
                {briefing.newConcept.labels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            )}
        </section>
      )}

      {payloadRepair && outputSchema && onRepairPassedChange && (
        <PayloadRepairPanel
          missionId={missionId}
          task={payloadRepair}
          schema={outputSchema}
          passed={repairPassed}
          onPassedChange={onRepairPassedChange}
        />
      )}

      {codeFill && onCodeFillPassedChange && (
        <CodeFillPanel
          missionId={missionId}
          task={codeFill}
          passed={codeFillPassed}
          onPassedChange={onCodeFillPassedChange}
        />
      )}

      {briefing.formatCompare && (
        <FormatCompare compare={briefing.formatCompare} />
      )}

      {(briefing.expectedFormat ||
        (briefing.contractLines && briefing.contractLines.length > 0)) && (
        <section
          className="border border-ml-border bg-ml-bg-1/40 px-3 py-2.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
            {messages.expectedFormatLabel}
          </p>
          {briefing.expectedFormat && (
            <pre className="mt-1.5 overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text">
              {briefing.expectedFormat}
            </pre>
          )}
          {briefing.contractLines && briefing.contractLines.length > 0 && (
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-ml-text-secondary">
              {briefing.contractLines.map((line) => (
                <li key={line.name}>
                  <span className="text-ml-text">{line.name}</span>
                  <span className="text-ml-text-muted"> · </span>
                  {line.values}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {currentSentiment && (
        <section
          className="border border-ml-border bg-ml-surface-1/40 px-3 py-2.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
            {currentSentiment.title}
          </p>
          <div className="mt-2">
            <SentimentPolicyBody policy={currentSentiment} />
          </div>
        </section>
      )}

      {currentPolicy && (
        <section
          className="border border-ml-border bg-ml-surface-1/40 px-3 py-2.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="font-mono text-[11px] tracking-[0.14em] text-ml-accent uppercase">
            {currentPolicy.title}
          </p>
          <div className="mt-2">
            <SupportPolicyBody policy={currentPolicy} />
          </div>
        </section>
      )}

      {briefing.flowSteps && briefing.flowSteps.length > 0 && (
        <section>
          <p className="font-mono text-[11px] tracking-[0.12em] text-ml-secondary uppercase">
            {messages.howItWorks}
          </p>
          <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text">
            {briefing.flowSteps.join(" → ")}
          </p>
          {briefing.flowCaption && (
            <p className="mt-0.5 text-[length:var(--ml-text-xs)] text-ml-text-muted">
              {briefing.flowCaption}
            </p>
          )}
        </section>
      )}

      {previous && (previous.sentimentPolicy || previous.policy) && (
        <CollapsibleBlock title={previous.title}>
          <div className="space-y-3">
            {previous.sentimentPolicy && (
              <div>
                <p className="mb-1.5 font-mono text-[11px] text-ml-secondary">
                  {previous.sentimentPolicy.title}
                </p>
                <SentimentPolicyBody policy={previous.sentimentPolicy} />
              </div>
            )}
            {previous.policy && (
              <div>
                <p className="mb-1.5 font-mono text-[11px] text-ml-secondary">
                  {previous.policy.title}
                </p>
                <SupportPolicyBody policy={previous.policy} />
              </div>
            )}
          </div>
        </CollapsibleBlock>
      )}

      {briefing.optionalTheory && (
        <CollapsibleBlock title={briefing.optionalTheory.title}>
          <div className="space-y-2">
            {briefing.optionalTheory.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </CollapsibleBlock>
      )}

      {hints.length > 0 && (
        <CollapsibleBlock title={messages.hints}>
          <HintPanel
            key={missionId}
            missionId={missionId}
            hints={hints}
            instruction={instruction}
            objective={objective}
            compact
            hideHeader
          />
        </CollapsibleBlock>
      )}
    </div>
  );
}
