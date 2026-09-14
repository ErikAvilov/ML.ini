"use client";

import Link from "next/link";
import type { KingdomPathStatus } from "@/lib/world/resolve-world";
import type { WorldKingdomSnapshot } from "@/lib/world/resolve-world";
import { useLocale } from "@/i18n/locale-context";

function statusLabel(
  status: KingdomPathStatus,
  messages: ReturnType<typeof useLocale>["messages"]
) {
  if (status === "completed") return messages.worldKingdomCompleted;
  if (status === "active") return messages.worldKingdomActive;
  return messages.worldKingdomLocked;
}

function nodeClass(status: KingdomPathStatus) {
  if (status === "completed") return "bg-ml-state-completed";
  if (status === "active") {
    return "bg-ml-state-active shadow-[0_0_0_3px_color-mix(in_srgb,var(--ml-state-active)_28%,transparent)]";
  }
  return "bg-ml-border";
}

interface WorldKingdomItemProps {
  item: WorldKingdomSnapshot;
  isLast: boolean;
}

export function WorldKingdomItem({ item, isLast }: WorldKingdomItemProps) {
  const { messages, t } = useLocale();
  const { kingdom, status, completedCoreCount, totalCoreCount } = item;
  const dominant = status === "active";

  return (
    <li className="relative flex gap-4">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <span
          className={`mt-2 h-3 w-3 shrink-0 rounded-full transition-[box-shadow,background-color] duration-150 ease-out ${nodeClass(status)}`}
          aria-hidden
        />
        {!isLast && (
          <span
            className="mt-1 w-px flex-1 bg-[color-mix(in_srgb,var(--ml-border)_85%,transparent)]"
            aria-hidden
          />
        )}
      </div>

      <article
        className={`mb-4 min-w-0 flex-1 border p-4 transition-[border-color,background-color] duration-150 ease-out motion-reduce:transition-none ${
          dominant
            ? "border-ml-state-active bg-[color-mix(in_srgb,var(--ml-state-active)_8%,var(--ml-surface-raised))]"
            : status === "completed"
              ? "border-ml-border bg-ml-surface-1"
              : "border-ml-border/70 bg-ml-surface-inset/40 opacity-80"
        } ${
          status !== "locked"
            ? "hover:border-[color-mix(in_srgb,var(--ml-border)_60%,var(--ml-state-active)_40%)]"
            : ""
        }`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
        aria-current={dominant ? "step" : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`font-mono text-[11px] tracking-[0.06em] uppercase ${
              status === "active"
                ? "text-ml-state-active"
                : status === "completed"
                  ? "text-ml-state-completed"
                  : "text-ml-text-muted"
            }`}
          >
            {statusLabel(status, messages)}
          </span>
          {totalCoreCount > 0 && (
            <span className="font-mono text-[11px] text-ml-text-muted">
              {t(messages.worldMissionsProgress, {
                done: completedCoreCount,
                total: totalCoreCount,
              })}
            </span>
          )}
        </div>
        <h2
          className={`font-display mt-1.5 font-semibold text-ml-text-primary ${
            dominant ? "text-xl sm:text-2xl" : "text-lg"
          }`}
        >
          {status === "locked" ? (
            kingdom.name
          ) : (
            <Link
              href={`/app/kingdom/${kingdom.id}`}
              className="transition-colors hover:text-ml-state-active focus-visible:outline-none"
            >
              {kingdom.name}
            </Link>
          )}
        </h2>
        {kingdom.subtitle && (
          <p className="mt-1 text-[length:var(--ml-text-sm)] text-ml-text-muted">
            {kingdom.subtitle}
          </p>
        )}
      </article>
    </li>
  );
}
