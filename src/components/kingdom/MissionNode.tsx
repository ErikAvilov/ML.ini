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
  const isIntro = mission.kind === "intro";

  return (
    <button
      type="button"
      onClick={() => onSelect(mission.id)}
      aria-pressed={selected}
      className="group relative z-10 flex w-32 cursor-pointer flex-col items-center text-center outline-none focus-visible:rounded-ml focus-visible:ring-2 focus-visible:ring-[var(--ml-border-accent)]"
    >
      <span
        className={`relative flex items-center justify-center border bg-ml-surface-2 transition duration-200 group-hover:-translate-y-0.5 ${
          isIntro
            ? "h-12 w-12 border-ml-reward text-ml-reward"
            : "h-16 w-16"
        } ${
          isBoss
            ? "border-[var(--ml-frame-boss)] text-ml-reward"
            : isIntro
              ? ""
              : status === "locked"
                ? "border-ml-border text-ml-text-muted"
                : status === "completed"
                  ? "border-[var(--ml-border-accent)] text-ml-accent"
                  : "border-ml-accent text-ml-accent"
        } ${
          selected
            ? isBoss || isIntro
              ? "ring-2 ring-[var(--ml-reward-soft)]"
              : "ring-2 ring-[var(--ml-accent-soft)]"
            : ""
        }`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <span
          className={`flex items-center justify-center border ${
            isIntro ? "h-6 w-6 rotate-45" : "h-8 w-8 rotate-45"
          } ${
            isBoss || isIntro
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
              size={isIntro ? 14 : 17}
            />
          ) : status === "locked" ? (
            <Lock className="-rotate-45" size={isIntro ? 12 : 15} />
          ) : isBoss ? (
            <Shield className="-rotate-45" size={17} />
          ) : (
            <Play className="-rotate-45" size={isIntro ? 13 : 16} />
          )}
        </span>
        {active && (
          <span
            className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-ml-surface-2 motion-safe:animate-pulse ${
              isBoss || isIntro ? "bg-ml-reward" : "bg-ml-accent"
            }`}
          />
        )}
      </span>

      <span
        className={`mt-3 font-mono text-xs ${
          isBoss || isIntro
            ? "text-ml-reward"
            : status === "locked"
              ? "text-ml-text-muted"
              : "text-ml-accent"
        }`}
      >
        {isIntro
          ? messages.introLabel
          : isBoss
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
