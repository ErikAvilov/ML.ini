"use client";

import type { SkillDefinition } from "@/lib/types";
import type { WorldKingdomSnapshot } from "@/lib/world/resolve-world";
import { useLocale } from "@/i18n/locale-context";

interface WorldSkillPreviewProps {
  skills: SkillDefinition[];
}

export function WorldSkillPreview({ skills }: WorldSkillPreviewProps) {
  const { messages } = useLocale();
  if (skills.length === 0) return null;

  return (
    <section
      className="border border-ml-border bg-ml-surface-1 p-4"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      <h2 className="font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
        {messages.worldUpcomingSkills}
      </h2>
      <ul className="mt-3 space-y-3">
        {skills.map((skill) => (
          <li key={skill.id} className="min-w-0">
            <p className="text-[length:var(--ml-text-sm)] font-medium text-ml-text-primary">
              {skill.displayName}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-ml-text-muted">
              {skill.category}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface WorldNextKingdomProps {
  next: WorldKingdomSnapshot;
}

export function WorldNextKingdom({ next }: WorldNextKingdomProps) {
  const { messages } = useLocale();

  return (
    <section
      className="border border-dashed border-ml-border bg-ml-surface-inset/50 p-4"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
    >
      <h2 className="font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase">
        {messages.worldNextKingdom}
      </h2>
      <p className="font-display mt-1 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
        {next.kingdom.name}
      </p>
      {next.kingdom.subtitle && (
        <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted">
          {next.kingdom.subtitle}
        </p>
      )}
    </section>
  );
}
