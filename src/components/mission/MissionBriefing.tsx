"use client";

import { useLocale } from "@/i18n/locale-context";
import type { MissionBriefingContent, MissionHint } from "@/lib/types";
import { HintPanel } from "@/components/mission/HintPanel";

interface MissionBriefingProps {
  briefing: MissionBriefingContent;
  missionTitle: string;
  missionOrder: number;
  alreadyCleared?: boolean;
  hints: MissionHint[];
  instruction: string;
  objective: string;
}

export function MissionBriefing({
  briefing,
  missionTitle,
  missionOrder,
  alreadyCleared,
  hints,
  instruction,
  objective,
}: MissionBriefingProps) {
  const { messages } = useLocale();
  const header = briefing.narrativeHeader;
  const policy = briefing.policy;
  const sentimentPolicy = briefing.sentimentPolicy;
  const outputContract = briefing.outputContract;

  return (
    <div className="space-y-7 text-[length:var(--ml-text-base)] leading-[var(--ml-leading-body)]">
      <header className="pb-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="ml-section-label">
            Mission {String(missionOrder).padStart(2, "0")}
          </p>
          <p className="text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {alreadyCleared
              ? messages.statusClearedReplay
              : messages.statusInProgress}
          </p>
        </div>
        <h1 className="mt-3 font-display text-[length:var(--ml-text-2xl)] leading-[1.15] text-ml-text">
          {missionTitle}
        </h1>
        <div className="mt-4 h-px w-14 bg-[color-mix(in_srgb,var(--ml-reward)_55%,transparent)]" />
      </header>

      {header && (
        <section
          className="border border-ml-border bg-ml-bg-1/40 px-3.5 py-3"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <p className="font-mono text-[length:var(--ml-text-xs)] tracking-[0.14em] text-ml-text-muted uppercase">
            {header.company}
          </p>
          <p className="mt-0.5 font-mono text-[length:var(--ml-text-xs)] tracking-[0.12em] text-ml-text-secondary uppercase">
            {header.division}
          </p>
          <p className="mt-3 font-mono text-[length:var(--ml-text-xs)] tracking-[0.16em] text-ml-accent uppercase">
            {header.project}
          </p>
          <p className="mt-3 text-[length:var(--ml-text-xs)] font-medium tracking-[0.08em] text-ml-text uppercase">
            {header.assignmentLabel}
          </p>
          <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-body">
            <span className="text-ml-text-muted">{header.fromLabel}:</span>{" "}
            <span className="text-ml-text">{header.fromName}</span>
          </p>
          <p className="text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {header.fromTitle}
          </p>
        </section>
      )}

      <section>
        <h2 className="font-display text-[length:var(--ml-text-lg)] text-ml-text">
          {briefing.welcomeTitle}
        </h2>
        <div className="mt-3 space-y-3 text-ml-text-body">
          {briefing.welcomeParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className={
                paragraph.endsWith(":")
                  ? "text-[length:var(--ml-text-sm)] font-medium text-ml-text-muted"
                  : undefined
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
        <p className="mt-3 font-medium text-ml-text">{briefing.roleHighlight}</p>
        {briefing.roleDetails.length > 0 && (
          <div className="mt-3 space-y-3 text-ml-text-body">
            {briefing.roleDetails.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
        )}
        {briefing.systemNote && (
          <p className="mt-3 text-ml-text-body">{briefing.systemNote}</p>
        )}
      </section>

      {sentimentPolicy && (
        <section
          className="border border-ml-border bg-ml-surface-1/50 px-3.5 py-3.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <h2 className="ml-section-label">{sentimentPolicy.title}</h2>
          <div className="mt-3 space-y-3 text-[length:var(--ml-text-sm)]">
            {(
              [
                {
                  label: sentimentPolicy.positiveLabel,
                  items: sentimentPolicy.positiveItems,
                },
                {
                  label: sentimentPolicy.negativeLabel,
                  items: sentimentPolicy.negativeItems,
                },
                {
                  label: sentimentPolicy.neutralLabel,
                  items: sentimentPolicy.neutralItems,
                },
              ] as const
            ).map((block) => (
              <div key={block.label}>
                <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                  {block.label}
                </p>
                <ul className="mt-1.5 space-y-1 text-ml-text-body">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ml-text-muted" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="border-l-2 border-ml-reward/50 pl-3 text-ml-text">
              {sentimentPolicy.note}
            </p>
          </div>
        </section>
      )}

      {policy && (
        <section
          className="border border-ml-border bg-ml-surface-1/50 px-3.5 py-3.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <h2 className="ml-section-label">{policy.title}</h2>
          <div className="mt-3 space-y-3 text-[length:var(--ml-text-sm)]">
            <div>
              <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-accent">
                {policy.urgentLabel}
              </p>
              <ul className="mt-1.5 space-y-1 text-ml-text-body">
                {policy.urgentItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-ml-text-muted" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                {policy.normalLabel}
              </p>
              <p className="mt-1.5 text-ml-text-body">{policy.normalBody}</p>
            </div>
            <p className="border-l-2 border-ml-reward/50 pl-3 text-ml-text">
              {policy.note}
            </p>
          </div>
        </section>
      )}

      {outputContract && (
        <section
          className="border border-ml-border bg-ml-bg-1/50 px-3.5 py-3.5"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <h2 className="ml-section-label">
            {outputContract.title || messages.outputContractTitle}
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-text-muted">
                {messages.humanReadableLabel}
              </p>
              <p className="mt-1.5 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body italic">
                “{outputContract.humanReadableExample}”
              </p>
            </div>
            <div>
              <p className="text-[length:var(--ml-text-xs)] font-medium text-ml-accent">
                {messages.machineReadableLabel}
              </p>
              <pre className="mt-1.5 overflow-x-auto border border-ml-border bg-ml-bg-0/60 px-3 py-2 font-mono text-[length:var(--ml-text-xs)] leading-relaxed text-ml-text whitespace-pre-wrap"
                style={{ borderRadius: "var(--ml-frame-radius)" }}
              >
                {outputContract.requiredFormat}
              </pre>
            </div>
            {outputContract.fieldLabels && outputContract.fieldLabels.length > 0 && (
              <ul className="space-y-1 font-mono text-[length:var(--ml-text-xs)] text-ml-text-secondary">
                {outputContract.fieldLabels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <hr className="ml-rule" />

      <section>
        <h2 className="ml-section-label">{messages.howItWorks}</h2>
        <p className="mt-3 text-[length:var(--ml-text-md)] text-ml-text">
          {briefing.flowSteps.join(" → ")}
        </p>
        <p className="mt-2.5 text-ml-text-muted">{briefing.flowCaption}</p>
      </section>

      <section className="ml-assignment">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--ml-reward)_30%,transparent)]" />
          <h2 className="font-display text-[length:var(--ml-text-xl)] text-ml-text">
            {briefing.assignmentTitle}
          </h2>
          <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--ml-reward)_30%,transparent)]" />
        </div>

        <p className="text-ml-text-body">{briefing.assignmentIntro}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {briefing.categories.map((category) => (
            <span
              key={category}
              className="border border-ml-border-strong bg-ml-bg-1 px-2.5 py-1 font-mono text-[length:var(--ml-text-xs)] text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
            >
              {category}
            </span>
          ))}
        </div>
        <p className="mt-3 text-ml-text-body">{briefing.assignmentNote}</p>

        <ol className="mt-5 space-y-2">
          {briefing.taskSteps.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-ml-text-body">
              <span className="font-medium text-ml-text">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-l-2 border-ml-reward/50 pl-3.5 text-ml-text">
          {briefing.taskReminder}
        </p>
      </section>

      <section>
        <HintPanel
          hints={hints}
          instruction={instruction}
          objective={objective}
          compact
        />
      </section>
    </div>
  );
}
