"use client";

import { Check, Lock, Play, Shield } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface MissionNodeProps {
  mission: MissionDefinition;
  status: MissionStatus;
  selected: boolean;
  active: boolean;
  onSelect: (missionId: string) => void;
}

export function MissionNode({
  mission,
  status,
  selected,
  active,
  onSelect,
}: MissionNodeProps) {
  const { messages } = useLocale();
  const isBoss = mission.kind === "boss";

  return (
    <button
      type="button"
      onClick={() => onSelect(mission.id)}
      aria-pressed={selected}
      className="group relative z-10 flex w-32 flex-col items-center text-center outline-none focus-visible:rounded-ml focus-visible:ring-2 focus-visible:ring-[var(--ml-border-accent)]"
    >
      <span
        className={`relative flex h-16 w-16 items-center justify-center border bg-ml-surface-2 transition duration-200 group-hover:-translate-y-0.5 ${
          isBoss
            ? "border-[var(--ml-frame-boss)] text-ml-reward"
            : status === "locked"
              ? "border-ml-border text-ml-text-muted"
              : status === "completed"
                ? "border-[var(--ml-border-accent)] text-ml-accent"
                : "border-ml-accent text-ml-accent"
        } ${
          selected
            ? isBoss
              ? "ring-2 ring-[var(--ml-reward-soft)]"
              : "ring-2 ring-[var(--ml-accent-soft)]"
            : ""
        }`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <span
          className={`flex h-8 w-8 rotate-45 items-center justify-center border ${
            isBoss
              ? "border-ml-reward bg-ml-reward-soft"
              : status === "locked"
                ? "border-ml-border bg-ml-bg-1"
                : status === "completed"
                  ? "border-ml-accent bg-ml-accent"
                  : "border-ml-accent bg-ml-accent-soft"
          }`}
        >
          {status === "completed" ? (
            <Check
              className="-rotate-45 text-[var(--ml-text-on-primary)]"
              size={17}
            />
          ) : status === "locked" ? (
            <Lock className="-rotate-45" size={15} />
          ) : isBoss ? (
            <Shield className="-rotate-45" size={17} />
          ) : (
            <Play className="-rotate-45" size={16} />
          )}
        </span>
        {active && (
          <span
            className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-ml-surface-2 motion-safe:animate-pulse ${
              isBoss ? "bg-ml-reward" : "bg-ml-accent"
            }`}
          />
        )}
      </span>

      <span
        className={`mt-3 font-mono text-xs ${
          isBoss
            ? "text-ml-reward"
            : status === "locked"
              ? "text-ml-text-muted"
              : "text-ml-accent"
        }`}
      >
        {isBoss
          ? `${messages.homeKingdomBoss} · ${mission.order}`
          : `M-${String(mission.order).padStart(2, "0")}`}
      </span>
      <span
        className={`mt-1 line-clamp-2 text-sm font-semibold leading-tight ${
          isBoss
            ? "font-display text-ml-reward"
            : status === "locked"
              ? "text-ml-text-muted"
              : "text-ml-text"
        }`}
      >
        {mission.shortTitle}
      </span>
      <span className="mt-1 text-xs text-ml-text-muted">
        {status === "completed"
          ? messages.missionClearedBadge
          : status === "available"
            ? messages.missionActiveBadge
            : messages.profileLocked}
      </span>
    </button>
  );
}
