"use client";

import { useLocale } from "@/i18n/locale-context";

interface XpBarProps {
  current: number;
  needed: number;
  level: number;
  animateKey?: string | number;
}

export function XpBar({ current, needed, level }: XpBarProps) {
  const { messages, t } = useLocale();
  const ratio = Math.min(1, needed === 0 ? 0 : current / needed);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-[0.14em]">
        <span className="text-ml-text-muted">
          {t(messages.level, { level })}
        </span>
        <span className="font-mono text-ml-accent">
          {current} / {needed} XP
        </span>
      </div>
      <div className="h-1.5 overflow-hidden border border-ml-border bg-ml-bg-1">
        <div
          className="h-full bg-gradient-to-r from-ml-accent-muted via-ml-accent to-ml-accent-bright motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
