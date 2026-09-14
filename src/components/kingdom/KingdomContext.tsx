import type { KingdomSnapshot } from "@/lib/kingdom/resolve-kingdom";
import { useLocale } from "@/i18n/locale-context";

interface KingdomContextProps {
  snapshot: KingdomSnapshot;
}

/**
 * Secondary column — complements pathway; no duplicate Continue CTA,
 * no duplicate Boss / Final Objective panel (Boss lives on the path).
 */
export function KingdomContext({ snapshot }: KingdomContextProps) {
  const { messages } = useLocale();
  const current = snapshot.current;

  return (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
      {current && (
        <section
          className="border border-ml-border bg-ml-surface-1 p-4"
          style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        >
          <h2 className="font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase">
            {messages.kingdomContextCurrent}
          </h2>
          <p className="font-display mt-1.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
            {current.mission.title}
          </p>
          <p className="mt-1 text-[length:var(--ml-text-xs)] text-ml-text-muted line-clamp-3">
            {current.mission.objective || current.mission.brief}
          </p>
        </section>
      )}

      <section
        className="border border-ml-border bg-ml-surface-1 p-4"
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <h2 className="font-display text-[length:var(--ml-text-sm)] font-semibold text-ml-text-primary">
          {messages.kingdomUpcomingSkills}
        </h2>
        {snapshot.upcomingSkills.length === 0 ? (
          <p className="mt-2 text-[length:var(--ml-text-xs)] text-ml-text-muted">
            {messages.kingdomNoUpcomingSkills}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {snapshot.upcomingSkills.map((skill) => (
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
        )}
      </section>
    </aside>
  );
}
