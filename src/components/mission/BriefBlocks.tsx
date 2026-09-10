"use client";

import type {
  FormatCompareContent,
  SentimentPolicyContent,
  SupportPolicyContent,
} from "@/lib/types";

export function FormatCompare({ compare }: { compare: FormatCompareContent }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
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
    <div
      className="border border-ml-border bg-ml-bg-0/50 px-2.5 py-2"
      style={{ borderRadius: "var(--ml-frame-radius)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] tracking-[0.12em] text-ml-text-muted uppercase">
          {label}
        </p>
        <p
          className={`font-mono text-[10px] tracking-[0.08em] uppercase ${
            ok ? "text-ml-accent" : "text-ml-danger"
          }`}
        >
          {ok ? "✓" : "✕"} {status}
        </p>
      </div>
      <pre className="mt-1.5 overflow-x-auto font-mono text-[12px] leading-snug whitespace-pre-wrap text-ml-text">
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
          <p className="font-mono text-[11px] text-ml-secondary">{block.label}</p>
          <ul className="mt-1 space-y-0.5 text-[length:var(--ml-text-sm)]">
            {block.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ml-text-muted" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="border-l-2 border-ml-secondary/40 pl-2.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
        {policy.note}
      </p>
    </div>
  );
}

export function SupportPolicyBody({ policy }: { policy: SupportPolicyContent }) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="font-mono text-[11px] text-ml-accent">{policy.urgentLabel}</p>
        <ul className="mt-1 space-y-0.5 text-[length:var(--ml-text-sm)]">
          {policy.urgentItems.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-ml-text-muted" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-mono text-[11px] text-ml-secondary">{policy.normalLabel}</p>
        <p className="mt-1 text-[length:var(--ml-text-sm)]">{policy.normalBody}</p>
      </div>
      <p className="border-l-2 border-ml-secondary/40 pl-2.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary">
        {policy.note}
      </p>
    </div>
  );
}
