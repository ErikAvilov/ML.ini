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

export function MissionPath({
  missions,
  selectedMissionId,
  activeMissionId,
  onSelectMission,
}: MissionPathProps) {
  const { progress, ready } = useProgress();
  const { messages } = useLocale();
  const activeNodeRef = useRef<HTMLLIElement>(null);
  const rows = [missions.slice(0, 5), missions.slice(5, 10)];

  function centerActiveMission() {
    activeNodeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
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
        <div className="relative mx-auto flex min-h-[558px] min-w-[760px] max-w-[940px] flex-col justify-center gap-28 px-10 py-12">
          <div
            aria-hidden
            className="absolute top-[31%] right-[11%] left-[11%] h-px bg-[var(--ml-connection-locked)]"
          />
          <div
            aria-hidden
            className="absolute top-[31%] right-[11%] h-[38%] w-px bg-[var(--ml-connection-locked)]"
          />
          <div
            aria-hidden
            className="absolute right-[11%] bottom-[31%] left-[11%] h-px bg-[var(--ml-connection-locked)]"
          />

          {rows.map((row, rowIndex) => (
            <ol
              key={rowIndex}
              className={`relative grid grid-cols-5 items-start justify-items-center ${
                rowIndex === 1 ? "[direction:rtl]" : ""
              }`}
            >
              {row.map((mission) => {
                const status = ready
                  ? getMissionStatus(mission.id, progress, mission.order)
                  : mission.order === 1
                    ? "available"
                    : "locked";
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
          ))}
        </div>
      </div>
    </section>
  );
}
