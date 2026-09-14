"use client";

import type {
  FormatCompareContent,
  SentimentPolicyContent,
  SupportPolicyContent,
} from "@/lib/types";

export function FormatCompare({ compare }: { compare: FormatCompareContent }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormatCard
        label={compare.currentLabel}
        example={compare.currentExample}
        status={compare.currentStatusLabel}
        ok={false}
      />
      <FormatCard
        label={compare.expectedLabel}
        example={compare.expectedExample}
        status={compare.expectedStatusLabel}
        ok
      />
    </div>
  );
}

function FormatCard({
  label,
  example,
  status,
  ok,
}: {
  label: string;
  example: string;
  status: string;
  ok: boolean;
}) {
  return (
    <div className="border-t border-ml-border/80 pt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="ml-mission-section-label">{label}</p>
        <p
          className={`font-mono text-[10px] tracking-[0.06em] uppercase ${
            ok ? "text-ml-state-completed" : "text-ml-state-error"
          }`}
        >
          {ok ? "✓" : "✕"} {status}
        </p>
      </div>
      <pre className="mt-1.5 overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text-primary">
        {example}
      </pre>
    </div>
  );
}

export function SentimentPolicyBody({
  policy,
}: {
  policy: SentimentPolicyContent;
}) {
  return (
    <div className="space-y-2.5">
      {(
        [
          { label: policy.positiveLabel, items: policy.positiveItems },
          { label: policy.negativeLabel, items: policy.negativeItems },
          { label: policy.neutralLabel, items: policy.neutralItems },
        ] as const
      ).map((block) => (
        <div key={block.label}>
          <p className="font-mono text-[11px] text-ml-text-muted">{block.label}</p>
          <ul className="mt-1 space-y-0.5 text-[length:var(--ml-text-sm)] text-ml-text-body">
            {block.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ml-border-strong" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="border-l border-ml-border pl-2.5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {policy.note}
      </p>
    </div>
  );
}

export function SupportPolicyBody({ policy }: { policy: SupportPolicyContent }) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="font-mono text-[11px] text-ml-state-active">
          {policy.urgentLabel}
        </p>
        <ul className="mt-1 space-y-0.5 text-[length:var(--ml-text-sm)] text-ml-text-body">
          {policy.urgentItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ml-border-strong" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-[11px] text-ml-text-muted">{policy.normalLabel}</p>
        <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-body">
          {policy.normalBody}
        </p>
      </div>
      <p className="border-l border-ml-border pl-2.5 text-[length:var(--ml-text-sm)] text-ml-text-muted">
        {policy.note}
      </p>
    </div>
  );
}
