"use client";

import type { ReactNode } from "react";

interface CollapsibleBlockProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Visual weight: secondary = blue-grey muted */
  tone?: "secondary" | "default";
}

/** Native details — collapsed previous knowledge / theory / hints wrapper. */
export function CollapsibleBlock({
  title,
  children,
  defaultOpen = false,
  tone = "secondary",
}: CollapsibleBlockProps) {
  return (
    <details
      className={`group border border-ml-border bg-ml-bg-1/30 ${
        tone === "secondary" ? "text-ml-text-muted" : "text-ml-text-body"
      }`}
      style={{ borderRadius: "var(--ml-frame-radius)" }}
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="cursor-pointer list-none px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-ml-secondary uppercase marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-ml-secondary transition group-open:rotate-90">
            ▸
          </span>
          {title}
        </span>
      </summary>
      <div className="border-t border-ml-border px-3 py-2.5 text-[length:var(--ml-text-sm)] leading-snug text-ml-text-body">
        {children}
      </div>
    </details>
  );
}
