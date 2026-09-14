"use client";

import type { ReactNode } from "react";

interface CollapsibleBlockProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Visual weight: secondary = muted prior knowledge */
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
      className={`group border-t border-ml-border/80 ${
        tone === "secondary" ? "text-ml-text-muted" : "text-ml-text-body"
      }`}
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="cursor-pointer list-none py-2.5 font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-ml-text-muted transition group-open:rotate-90">
            ▸
          </span>
          {title}
        </span>
      </summary>
      <div className="pb-3 text-[length:var(--ml-text-sm)] leading-relaxed text-ml-text-body">
        {children}
      </div>
    </details>
  );
}
