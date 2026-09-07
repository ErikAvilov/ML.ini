"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressNode } from "@/components/ui/ProgressNode";
import { getMissionStatus } from "@/lib/progression";
import { useProgress } from "@/lib/progress-context";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface MissionNavBarProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
}

export function MissionNavBar({ mission, missions }: MissionNavBarProps) {
  const { progress, ready } = useProgress();
  const { messages } = useLocale();
  const total = missions.length;
  const sorted = [...missions].sort((a, b) => a.order - b.order);

  const prev = sorted.find((m) => m.order === mission.order - 1);
  const next = sorted.find((m) => m.order === mission.order + 1);

  function statusOf(m: MissionDefinition): MissionStatus {
    if (!ready) return m.order === 1 ? "available" : "locked";
    return getMissionStatus(m.id, progress, m.order);
  }

  const prevStatus = prev ? statusOf(prev) : null;
  const nextStatus = next ? statusOf(next) : null;
  const canPrev = prev && prevStatus !== "locked";
  const canNext = next && nextStatus !== "locked";

  return (
    <div className="shrink-0 border-b border-ml-border bg-ml-surface-1/75">
      <div className="flex h-11 w-full items-center gap-2 px-2 sm:gap-3 sm:px-4">
        <Link
          href="/royaume"
          className="inline-flex shrink-0 items-center gap-1 px-2 py-1.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{messages.kingdomNav}</span>
        </Link>

        <div className="mx-auto flex min-w-0 flex-1 items-center justify-center gap-3">
          <div className="min-w-0 text-center">
            <p className="truncate text-[length:var(--ml-text-sm)] text-ml-text-secondary">
              Mission {String(mission.order).padStart(2, "0")} —{" "}
              <span className="font-medium text-ml-text">{mission.title}</span>
            </p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted">
              {mission.order}/{total}
            </span>
            <div
              className="flex items-center gap-0.5"
              aria-label={messages.kingdomProgress}
            >
              {sorted.map((m, i) => {
                const st = statusOf(m);
                const isCurrent = m.id === mission.id;
                const prevM = sorted[i - 1];
                const prevSt = prevM ? statusOf(prevM) : null;
                const connClass =
                  prevSt === "completed"
                    ? "ml-connection ml-connection-completed"
                    : st !== "locked" || isCurrent
                      ? "ml-connection ml-connection-available"
                      : "ml-connection";

                return (
                  <span key={m.id} className="flex items-center gap-0.5">
                    {i > 0 && <span className={connClass} aria-hidden />}
                    <ProgressNode
                      status={st}
                      current={isCurrent}
                      boss={m.kind === "boss"}
                      title={m.title}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {canPrev && prev ? (
            <Link
              href={`/missions/${prev.slug}`}
              className="p-1.5 text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
              aria-label={messages.prevMission}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-ml-text-muted/30">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
          {canNext && next ? (
            <Link
              href={`/missions/${next.slug}`}
              className="p-1.5 text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text"
              style={{ borderRadius: "var(--ml-frame-radius)" }}
              aria-label={messages.nextMission}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="p-1.5 text-ml-text-muted/30">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
