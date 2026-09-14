"use client";

import { useLocale } from "@/i18n/locale-context";
import type {
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
  outputSchema?: StructuredOutputSchema;
  repairPassed?: boolean;
  onRepairPassedChange?: (passed: boolean) => void;
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
  outputSchema,
  repairPassed = false,
  onRepairPassedChange,
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
    <div className="space-y-5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
      <header className="space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="ml-mission-section-label">
            Mission {String(missionOrder).padStart(2, "0")}
          </p>
          <p
            className={`font-mono text-[11px] tracking-[0.06em] uppercase ${
              alreadyCleared
                ? "text-ml-state-completed"
                : "text-ml-state-active"
            }`}
          >
            {alreadyCleared
              ? messages.statusClearedReplay
              : messages.statusInProgress}
          </p>
        </div>
        <h1 className="font-display text-[1.625rem] font-semibold leading-tight tracking-tight text-ml-text-primary sm:text-[1.75rem]">
          {missionTitle}
        </h1>
      </header>

      {shortBrief ? <MiraMessage message={shortBrief} /> : null}

      <section className="ml-mission-callout-objective px-3 py-3">
        <p className="ml-mission-section-label text-ml-state-active">
          {messages.objectiveLabel}
        </p>
        <p className="mt-1.5 text-[length:var(--ml-text-base)] font-medium leading-snug whitespace-pre-line text-ml-text-primary">
          {objectiveText}
        </p>
        {briefing.categories && briefing.categories.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {briefing.categories.map((category) => (
              <span
                key={category}
                className="border border-ml-border px-2 py-0.5 font-mono text-[11px] text-ml-text-secondary"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </section>

      {briefing.newConcept && (
        <section className="ml-mission-callout-inset py-3">
          <p className="ml-mission-section-label">{briefing.newConcept.title}</p>
          {briefing.newConcept.summary && (
            <p className="mt-1.5 leading-relaxed text-ml-text-body">
              {briefing.newConcept.summary}
            </p>
          )}
          {briefing.newConcept.example && (
            <pre className="mt-2 overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text-primary">
              {briefing.newConcept.example}
            </pre>
          )}
          {briefing.newConcept.labels &&
            briefing.newConcept.labels.length > 0 && (
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-ml-text-muted">
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

      {briefing.formatCompare && (
        <FormatCompare compare={briefing.formatCompare} />
      )}

      {(briefing.expectedFormat ||
        (briefing.contractLines && briefing.contractLines.length > 0)) && (
        <section className="space-y-1.5">
          <p className="ml-mission-section-label">
            {messages.expectedFormatLabel}
          </p>
          {briefing.expectedFormat && (
            <pre className="overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text-primary">
              {briefing.expectedFormat}
            </pre>
          )}
          {briefing.contractLines && briefing.contractLines.length > 0 && (
            <ul className="space-y-1 font-mono text-[11px] text-ml-text-muted">
              {briefing.contractLines.map((line) => (
                <li key={line.name}>
                  <span className="text-ml-text-primary">{line.name}</span>
                  <span className="text-ml-text-muted"> · </span>
                  {line.values}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {currentSentiment && (
        <section className="space-y-2">
          <p className="ml-mission-section-label">{currentSentiment.title}</p>
          <SentimentPolicyBody policy={currentSentiment} />
        </section>
      )}

      {currentPolicy && (
        <section className="space-y-2">
          <p className="ml-mission-section-label">{currentPolicy.title}</p>
          <SupportPolicyBody policy={currentPolicy} />
        </section>
      )}

      {briefing.flowSteps && briefing.flowSteps.length > 0 && (
        <section>
          <p className="ml-mission-section-label">{messages.howItWorks}</p>
          <p className="mt-1 text-ml-text-secondary">
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
                <p className="mb-1.5 font-mono text-[11px] text-ml-text-muted">
                  {previous.sentimentPolicy.title}
                </p>
                <SentimentPolicyBody policy={previous.sentimentPolicy} />
              </div>
            )}
            {previous.policy && (
              <div>
                <p className="mb-1.5 font-mono text-[11px] text-ml-text-muted">
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
