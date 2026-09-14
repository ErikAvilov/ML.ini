import type { KingdomMissionSnapshot } from "@/lib/kingdom/resolve-kingdom";
import { KingdomMissionItem } from "@/components/kingdom/KingdomMissionItem";
import { KingdomCurrentMission } from "@/components/kingdom/KingdomCurrentMission";
import { useLocale } from "@/i18n/locale-context";

interface KingdomMissionPathProps {
  missions: KingdomMissionSnapshot[];
  isNewLearner: boolean;
}

/** Sequential pathway — order is the graph. Boss is the final path node. */
export function KingdomMissionPath({
  missions,
  isNewLearner,
}: KingdomMissionPathProps) {
  const { messages } = useLocale();

  return (
    <section
      className="ml-kingdom-path-surface relative border border-ml-border p-4 sm:p-5"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      aria-label={messages.kingdomPathLabel}
    >
      <p className="relative z-[1] font-mono text-[11px] tracking-[0.06em] text-ml-text-muted uppercase">
        {messages.kingdomPathLabel}
      </p>
      <ol className="relative z-[1] mt-4 m-0 list-none p-0">
        {missions.map((item, index) => {
          const isLast = index === missions.length - 1;
          if (item.isCurrent) {
            return (
              <li key={item.mission.id} className="relative flex gap-3 sm:gap-4">
                <div className="flex w-3 shrink-0 flex-col items-center" aria-hidden>
                  <span
                    className={`mt-4 shrink-0 ${
                      item.mission.kind === "boss"
                        ? "h-3 w-3 rotate-45 bg-ml-state-active shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-active)_28%,transparent)]"
                        : "h-3 w-3 rounded-full bg-ml-state-active shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-active)_28%,transparent)]"
                    }`}
                  />
                  {!isLast && (
                    <span className="mt-1 w-px flex-1 bg-[color-mix(in_srgb,var(--ml-state-active)_40%,transparent)]" />
                  )}
                </div>
                <div className={`min-w-0 flex-1 ${isLast ? "" : "mb-3"}`}>
                  <KingdomCurrentMission
                    item={item}
                    isNewLearner={isNewLearner}
                  />
                </div>
              </li>
            );
          }
          return (
            <KingdomMissionItem
              key={item.mission.id}
              item={item}
              isLast={isLast}
            />
          );
        })}
      </ol>
    </section>
  );
}
