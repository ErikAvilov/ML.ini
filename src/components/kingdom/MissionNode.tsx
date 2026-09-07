"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Skull, Play } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface MissionNodeProps {
  mission: MissionDefinition;
  status: MissionStatus;
  index: number;
}

const positionClass = [
  "ml-[4%] sm:ml-[8%]",
  "ml-[38%] sm:ml-[48%]",
  "ml-[12%] sm:ml-[18%]",
  "ml-[52%] sm:ml-[58%]",
  "ml-[8%] sm:ml-[12%]",
  "ml-[44%] sm:ml-[50%]",
  "ml-[16%] sm:ml-[22%]",
  "ml-[48%] sm:ml-[54%]",
  "ml-[20%] sm:ml-[28%]",
  "ml-[34%] sm:ml-[40%]",
];

export function MissionNode({ mission, status, index }: MissionNodeProps) {
  const { messages } = useLocale();
  const isBoss = mission.kind === "boss";
  const href =
    status === "locked"
      ? undefined
      : `/missions/${mission.slug}`;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45 }}
      className={`relative w-[min(100%,280px)] ${positionClass[index] ?? ""}`}
    >
      <div
        className={`group relative overflow-hidden border px-4 py-3 transition duration-300 ${
          status === "completed"
            ? "border-[color-mix(in_srgb,var(--ml-success)_40%,transparent)] bg-[var(--ml-success-soft)]"
            : status === "available"
              ? isBoss
                ? "border-[var(--ml-frame-boss)] bg-[var(--ml-reward-soft)]"
                : "border-[var(--ml-border-accent)] bg-ml-surface-2 hover:border-ml-accent"
              : "border-ml-border bg-ml-surface-1/50 opacity-70"
        }`}
        style={{ borderRadius: "var(--ml-frame-radius-lg)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              status === "completed"
                ? "border-signal/40 bg-signal/20 text-signal"
                : status === "available"
                  ? isBoss
                    ? "border-amber/40 bg-amber/15 text-amber"
                    : "border-signal/40 bg-ink text-signal"
                  : "border-line bg-ink-soft text-mist"
            }`}
          >
            {status === "completed" ? (
              <Check className="h-5 w-5" />
            ) : status === "locked" ? (
              <Lock className="h-4 w-4" />
            ) : isBoss ? (
              <Skull className="h-5 w-5" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.16em] text-mist uppercase">
                {isBoss ? "Boss" : `Mission ${mission.order}`}
              </span>
              {status === "available" && (
                <span className="rounded bg-signal/15 px-1.5 py-0.5 text-[9px] tracking-wider text-signal uppercase">
                  {messages.missionActiveBadge}
                </span>
              )}
              {status === "completed" && (
                <span className="rounded bg-signal/10 px-1.5 py-0.5 text-[9px] tracking-wider text-signal uppercase">
                  {messages.missionClearedBadge}
                </span>
              )}
            </div>
            <h3
              className={`mt-1 font-display text-base leading-tight ${
                isBoss ? "text-amber" : "text-fog"
              }`}
            >
              {mission.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-mist">
              {status === "locked"
                ? messages.lockedHint
                : mission.brief}
            </p>
            {status !== "locked" && (
              <p className="mt-2 font-mono text-[10px] tracking-wider text-signal/80 uppercase">
                +{mission.xpReward} XP
              </p>
            )}
          </div>
        </div>
        {status === "available" && !isBoss && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--ml-accent)_10%,transparent),transparent_55%)]" />
        )}
      </div>
    </motion.div>
  );

  if (!href) {
    return <div className="relative py-3">{content}</div>;
  }

  return (
    <Link href={href} className="relative block py-3 outline-none">
      {content}
    </Link>
  );
}
