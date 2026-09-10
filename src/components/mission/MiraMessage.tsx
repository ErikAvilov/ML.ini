"use client";

import { LEAD } from "@/data/narrative/canon";

interface MiraMessageProps {
  message: string;
  /** Optional compact label override */
  name?: string;
}

/** Compact Mira line — no job title, no Veyra banner. */
export function MiraMessage({ message, name = LEAD.firstName }: MiraMessageProps) {
  return (
    <div className="flex gap-2.5">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-ml-border bg-ml-surface-2"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        aria-hidden
      >
        <span className="h-2.5 w-2.5 rotate-45 border border-ml-accent bg-ml-accent-soft" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-[0.12em] text-ml-text-muted uppercase">
          {name}
        </p>
        <p className="mt-0.5 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body">
          “{message}”
        </p>
      </div>
    </div>
  );
}
