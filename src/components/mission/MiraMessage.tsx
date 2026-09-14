"use client";

import { LEAD } from "@/data/narrative/canon";

interface MiraMessageProps {
  message: string;
  /** Optional compact label override */
  name?: string;
}

/** Compact Mira line — pedagogical voice, not a marketing banner. */
export function MiraMessage({ message, name = LEAD.firstName }: MiraMessageProps) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-ml-border"
        style={{ borderRadius: "var(--ml-frame-radius)" }}
        aria-hidden
      >
        <span className="h-2 w-2 rotate-45 bg-ml-state-active/80" />
      </span>
      <div className="min-w-0">
        <p className="ml-mission-section-label">{name}</p>
        <p className="mt-1 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
          “{message}”
        </p>
      </div>
    </div>
  );
}
