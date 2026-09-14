"use client";

import type { WorldSnapshot } from "@/lib/world/resolve-world";
import { useLocale } from "@/i18n/locale-context";

interface WorldProgressSummaryProps {
  snapshot: WorldSnapshot;
}

export function WorldProgressSummary({ snapshot }: WorldProgressSummaryProps) {
  const { messages, t } = useLocale();
  if (snapshot.curriculumTotal <= 0) return null;

  const pct = Math.round(
    (snapshot.curriculumCompleted / snapshot.curriculumTotal) * 100
  );

  return (
    <section
      className="border border-ml-border bg-ml-surface-1 p-4"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      <h2 className="font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
        {messages.worldCurriculumProgress}
      </h2>
      <p className="mt-2 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
        {t(messages.worldMissionsProgress, {
          done: snapshot.curriculumCompleted,
          total: snapshot.curriculumTotal,
        })}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ml-border">
        <div
          className="h-full rounded-full bg-ml-state-completed transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
