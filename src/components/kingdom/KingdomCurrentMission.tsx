import Link from "next/link";
import type { KingdomMissionSnapshot } from "@/lib/kingdom/resolve-kingdom";
import { useLocale } from "@/i18n/locale-context";

interface KingdomCurrentMissionProps {
  item: KingdomMissionSnapshot;
  isNewLearner: boolean;
}

export function KingdomCurrentMission({
  item,
  isNewLearner,
}: KingdomCurrentMissionProps) {
  const { messages } = useLocale();
  const { mission, href, pathIndex } = item;
  const ctaLabel = isNewLearner
    ? messages.kingdomStartMission
    : messages.kingdomContinueMission;

  return (
    <article
      className="ml-kingdom-current-surface relative border border-ml-state-active p-4 sm:p-5"
      style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      aria-labelledby="kingdom-current-mission-title"
      aria-current="step"
    >
      <div className="relative z-[1]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] tracking-[0.06em] text-ml-state-active uppercase">
            {messages.kingdomCurrentMission}
          </span>
          <span className="font-mono text-[11px] text-ml-text-muted">
            {mission.kind === "intro"
              ? messages.introLabel
              : mission.kind === "boss"
                ? messages.homeKingdomBoss
                : `${pathIndex}`}
          </span>
        </div>
        <h3
          id="kingdom-current-mission-title"
          className="font-display mt-2 text-xl font-semibold text-ml-text-primary sm:text-2xl"
        >
          {mission.title}
        </h3>
        <p className="mt-2 text-[length:var(--ml-text-sm)] text-ml-text-body">
          {mission.brief || mission.objective}
        </p>
        {href && (
          <Link
            href={href}
            className="mt-4 inline-flex items-center border border-ml-state-active bg-ml-state-active px-4 py-2.5 text-[length:var(--ml-text-sm)] font-semibold text-ml-text-inverse transition-colors duration-150 ease-out hover:bg-ml-state-active-hover focus-visible:outline-none active:opacity-90"
            style={{ borderRadius: "var(--ml-frame-radius)" }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
