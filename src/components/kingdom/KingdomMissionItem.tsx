import Link from "next/link";
import type { KingdomMissionSnapshot } from "@/lib/kingdom/resolve-kingdom";
import { useLocale } from "@/i18n/locale-context";

interface KingdomMissionItemProps {
  item: KingdomMissionSnapshot;
  isLast: boolean;
}

export function KingdomMissionItem({ item, isLast }: KingdomMissionItemProps) {
  const { messages } = useLocale();
  const { mission, status, pathIndex, href } = item;
  const isBoss = mission.kind === "boss";

  const markerClass = isBoss
    ? status === "completed"
      ? "h-2.5 w-2.5 rotate-45 bg-ml-state-completed shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-completed)_22%,transparent)]"
      : status === "available"
        ? "h-2.5 w-2.5 rotate-45 bg-ml-state-active shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-active)_22%,transparent)]"
        : "h-2.5 w-2.5 rotate-45 bg-ml-border"
    : status === "completed"
      ? "h-2.5 w-2.5 rounded-full bg-ml-state-completed shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-completed)_22%,transparent)]"
      : status === "available"
        ? "h-2.5 w-2.5 rounded-full bg-ml-border-strong"
        : "h-2.5 w-2.5 rounded-full bg-ml-border";

  const connectorClass =
    status === "completed"
      ? "bg-[color-mix(in_srgb,var(--ml-state-completed)_45%,transparent)]"
      : "bg-[color-mix(in_srgb,var(--ml-border)_85%,transparent)]";

  const titleClass =
    status === "completed"
      ? "text-ml-text-muted"
      : status === "locked"
        ? "text-ml-text-muted"
        : "text-ml-text-primary";

  const statusLabel =
    status === "completed"
      ? messages.kingdomMissionCompleted
      : status === "available"
        ? messages.kingdomMissionAvailable
        : messages.kingdomMissionLocked;

  const borderClass = isBoss
    ? status === "available"
      ? "border-ml-state-active/70 bg-[color-mix(in_srgb,var(--ml-state-active)_6%,var(--ml-surface-1))]"
      : status === "completed"
        ? "border-ml-state-completed/50 bg-ml-surface-1/60"
        : "border-[color-mix(in_srgb,var(--ml-border)_55%,var(--ml-state-active)_45%)] bg-ml-surface-1/50"
    : "border-ml-border/70 bg-ml-surface-1/60";

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="flex w-3 shrink-0 flex-col items-center" aria-hidden>
        <span className={`mt-3 shrink-0 ${markerClass}`} />
        {!isLast && <span className={`mt-1 w-px flex-1 ${connectorClass}`} />}
      </div>
      <div
        className={`mb-2 min-w-0 flex-1 border px-3 py-3 sm:px-4 ${borderClass} ${
          status === "completed" ? "opacity-80" : ""
        } ${status === "locked" && !isBoss ? "opacity-70" : ""} ${
          status === "locked" && isBoss ? "opacity-75" : ""
        }`}
        style={{ borderRadius: "var(--ml-frame-radius)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={`font-mono text-[10px] tracking-[0.06em] uppercase ${
              isBoss
                ? status === "available"
                  ? "text-ml-state-active"
                  : "text-ml-text-muted"
                : "text-ml-text-muted"
            }`}
          >
            {mission.kind === "intro"
              ? messages.introLabel
              : isBoss
                ? messages.homeKingdomBoss
                : pathIndex}
          </span>
          <span className="font-mono text-[10px] text-ml-text-muted uppercase">
            {statusLabel}
          </span>
          {!mission.playable && (
            <span className="font-mono text-[10px] uppercase opacity-70">
              {messages.kingdomMissionSoon}
            </span>
          )}
        </div>
        <p
          className={`mt-1 text-[length:var(--ml-text-sm)] font-medium ${
            isBoss && status !== "locked" ? "text-ml-text-primary" : titleClass
          }`}
        >
          {mission.title}
        </p>
        {status === "completed" && href && (
          <Link
            href={href}
            className="mt-2 inline-block text-[length:var(--ml-text-xs)] text-ml-text-muted underline-offset-2 hover:text-ml-text-primary hover:underline"
          >
            {messages.kingdomReviewMission}
          </Link>
        )}
      </div>
    </li>
  );
}
