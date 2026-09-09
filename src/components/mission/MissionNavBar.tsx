"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProgressNode } from "@/components/ui/ProgressNode";
import { MliniEmblem } from "@/components/ui/MliniEmblem";
import { getMissionStatus } from "@/lib/progression";
import { useProgress } from "@/lib/progress-context";
import { useLocale } from "@/i18n/locale-context";
import type { MissionDefinition, MissionStatus } from "@/lib/types";

interface MissionNavBarProps {
  mission: MissionDefinition;
  missions: MissionDefinition[];
}

export function MissionNavBar({ mission, missions }: MissionNavBarProps) {
  const router = useRouter();
  const { progress, ready } = useProgress();
  const { messages, t } = useLocale();
  const total = missions.length;
  const sorted = [...missions].sort((a, b) => a.order - b.order);

  function statusOf(m: MissionDefinition): MissionStatus {
    if (!ready) return m.order === 1 ? "available" : "locked";
    return getMissionStatus(m.id, progress, m.order);
  }

  function lockedReason(m: MissionDefinition): string {
    const prior = sorted.find((x) => x.order === m.order - 1);
    if (prior) {
      return t(messages.missionLockedCompletePrev, {
        order: String(prior.order).padStart(2, "0"),
      });
    }
    return messages.missionLocked;
  }

  function goToMission(m: MissionDefinition) {
    const st = statusOf(m);
    if (st === "locked") return;
    if (m.id === mission.id) return;
    router.push(`/missions/${m.slug}`);
  }

  return (
    <div className="shrink-0 border-b border-ml-border bg-ml-surface-1/75">
      <div className="grid h-12 w-full grid-cols-[7.5rem_minmax(0,1fr)_7.5rem] items-center gap-2 px-2 sm:px-4">
        <Link
          href="/royaume"
          className="inline-flex w-fit items-center gap-1 px-2 py-1.5 text-[length:var(--ml-text-sm)] text-ml-text-secondary transition hover:bg-ml-surface-hover hover:text-ml-text"
          style={{ borderRadius: "var(--ml-frame-radius)" }}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden truncate sm:inline">{messages.kingdomNav}</span>
        </Link>

        <div className="flex min-w-0 flex-col items-center justify-center gap-1 sm:flex-row sm:gap-5">
          <p
            className="w-[min(100%,15rem)] shrink-0 truncate text-center text-[length:var(--ml-text-sm)] text-ml-text-secondary sm:w-[15rem] sm:text-left lg:w-[17rem]"
            title={`Mission ${String(mission.order).padStart(2, "0")} — ${mission.title}`}
          >
            Mission {String(mission.order).padStart(2, "0")} —{" "}
            <span className="font-medium text-ml-text">{mission.title}</span>
          </p>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5">
            <span className="hidden shrink-0 font-mono text-[length:var(--ml-text-xs)] text-ml-text-muted tabular-nums sm:inline">
              {mission.order}/{total}
            </span>
            <div
              className="flex items-center gap-1"
              role="navigation"
              aria-label={messages.missionSelectorLabel}
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
                const clickable = st !== "locked";
                const title =
                  st === "locked"
                    ? lockedReason(m)
                    : t(messages.missionNavLabel, {
                        order: String(m.order).padStart(2, "0"),
                        title: m.title,
                      });

                return (
                  <span key={m.id} className="flex items-center gap-1">
                    {i > 0 && <span className={connClass} aria-hidden />}
                    {clickable ? (
                      <button
                        type="button"
                        onClick={() => goToMission(m)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-sm transition hover:bg-ml-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ml-accent)_40%,transparent)]"
                        title={title}
                        aria-label={title}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        <ProgressNode
                          status={st}
                          current={isCurrent}
                          boss={m.kind === "boss"}
                          title={title}
                        />
                      </button>
                    ) : (
                      <span
                        className="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center"
                        title={title}
                        aria-label={title}
                      >
                        <ProgressNode
                          status={st}
                          current={isCurrent}
                          boss={m.kind === "boss"}
                          title={title}
                        />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/profil"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ml-border bg-ml-surface-2 transition hover:border-ml-accent"
            aria-label={messages.navProfile}
          >
            <MliniEmblem size={14} title="" />
          </Link>
        </div>
      </div>
    </div>
  );
}
