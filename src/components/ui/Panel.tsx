import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Panel({ children, className = "", glow = false }: PanelProps) {
  return (
    <div
      className={`border border-ml-border bg-[color-mix(in_srgb,var(--ml-surface-1)_88%,transparent)] backdrop-blur-sm ${
        glow
          ? "shadow-[0_0_0_1px_color-mix(in_srgb,var(--ml-accent)_18%,transparent)]"
          : ""
      } ${className}`}
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      {children}
    </div>
  );
}
