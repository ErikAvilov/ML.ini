"use client";

import { useRef } from "react";
import { LocateFixed } from "lucide-react";
import { MissionNode } from "@/components/kingdom/MissionNode";
import { useLocale } from "@/i18n/locale-context";
import { getMissionStatus } from "@/lib/progression";
import { useProgress } from "@/lib/progress-context";
import type { MissionDefinition } from "@/lib/types";

interface MissionPathProps {
  missions: MissionDefinition[];
  selectedMissionId: string;
  activeMissionId?: string;
  onSelectMission: (missionId: string) => void;
}

/** Center of MissionNode icon (h-16 → 2rem). */
const RAIL_TOP = "top-8";
/** Center of 5th grid column (M-05 / M-06). */
const RAIL_RIGHT = "left-[90%] -translate-x-1/2";

export function MissionPath({
  missions,
  selectedMissionId,
  activeMissionId,
  onSelectMission,
}: MissionPathProps) {
  const { progress, ready } = useProgress();
  const { messages } = useLocale();
  const activeNodeRef = useRef<HTMLLIElement>(null);
  const intro = missions.find((m) => m.kind === "intro");
  const core = missions.filter((m) => m.kind !== "intro");
  const rows = [core.slice(0, 5), core.slice(5, 10)];

  function statusOf(mission: MissionDefinition) {
    return ready
      ? getMissionStatus(mission.id, progress, mission.order)
      : mission.order === 0
        ? "available"
        : "locked";
  }

  function centerActiveMission() {
    activeNodeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  function renderRow(row: MissionDefinition[], rtl: boolean) {
    return (
      <ol
        className={`relative z-10 grid grid-cols-5 items-start justify-items-center ${
          rtl ? "[direction:rtl]" : ""
        }`}
      >
        {row.map((mission) => {
          const status = statusOf(mission);
          const isActive = mission.id === activeMissionId;

          return (
            <li
              key={mission.id}
              ref={isActive ? activeNodeRef : undefined}
              className="flex justify-center [direction:ltr]"
            >
              <MissionNode
                mission={mission}
                status={status}
                selected={mission.id === selectedMissionId}
                active={isActive}
                onSelect={onSelectMission}
              />
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-4 rounded-ml border border-ml-border bg-ml-surface-1 px-4 py-3">
        <p className="ml-section-label">{messages.expeditionMap}</p>
        <button
          type="button"
          onClick={centerActiveMission}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ml-accent transition hover:text-[var(--ml-accent-bright)]"
        >
          <LocateFixed size={16} />
          <span className="hidden sm:inline">
            {messages.centerActiveMission}
          </span>
        </button>
      </div>

      <div className="relative min-h-[560px] overflow-x-auto rounded-ml-lg border border-ml-border bg-ml-surface-1">
        <div className="map-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex min-h-[558px] min-w-[760px] max-w-[940px] flex-col justify-center px-10 py-10">
          {intro && (
            <div className="relative z-10 mb-16 flex justify-center">
              <MissionNode
                mission={intro}
                status={statusOf(intro)}
                selected={intro.id === selectedMissionId}
                active={intro.id === activeMissionId}
                onSelect={onSelectMission}
              />
            </div>
          )}

          {/* Serpentine: rail through icon centers, elbow on column 5 */}
          <div className="flex flex-col">
            <div className="relative">
              <div
                aria-hidden
                className={`pointer-events-none absolute ${RAIL_TOP} right-[10%] left-[10%] z-0 h-px bg-[var(--ml-connection-locked)]`}
              />
              <div
                aria-hidden
                className={`pointer-events-none absolute ${RAIL_TOP} bottom-0 z-0 w-px bg-[var(--ml-connection-locked)] ${RAIL_RIGHT}`}
              />
              {renderRow(rows[0], false)}
            </div>

            <div className="relative h-20" aria-hidden>
              <div
                className={`pointer-events-none absolute inset-y-0 z-0 w-px bg-[var(--ml-connection-locked)] ${RAIL_RIGHT}`}
              />
            </div>

            <div className="relative">
              <div
                aria-hidden
                className={`pointer-events-none absolute top-0 z-0 h-8 w-px bg-[var(--ml-connection-locked)] ${RAIL_RIGHT}`}
              />
              <div
                aria-hidden
                className={`pointer-events-none absolute ${RAIL_TOP} right-[10%] left-[10%] z-0 h-px bg-[var(--ml-connection-locked)]`}
              />
              {renderRow(rows[1], true)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
