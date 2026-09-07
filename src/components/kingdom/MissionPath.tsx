"use client";

import { MissionNode } from "@/components/kingdom/MissionNode";
import { getMissionStatus } from "@/lib/progression";
import { useProgress } from "@/lib/progress-context";
import type { MissionDefinition } from "@/lib/types";

interface MissionPathProps {
  missions: MissionDefinition[];
}

export function MissionPath({ missions }: MissionPathProps) {
  const { progress, ready } = useProgress();

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Path spine */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-6 bottom-6 left-[28px] w-px bg-gradient-to-b from-signal/50 via-line to-amber/40 sm:left-1/2 sm:-translate-x-1/2"
      />

      <ol className="relative space-y-1">
        {missions.map((mission, index) => {
          const status = ready
            ? getMissionStatus(mission.id, progress, mission.order)
            : mission.order === 1
              ? "available"
              : "locked";

          return (
            <li key={mission.id} className="relative">
              {/* Node connector dot on spine */}
              <span
                aria-hidden
                className={`absolute top-8 left-[24px] z-10 h-2.5 w-2.5 rounded-full sm:left-1/2 sm:-translate-x-1/2 ${
                  status === "completed"
                    ? "bg-signal shadow-[0_0_12px_rgba(61,214,180,0.8)]"
                    : status === "available"
                      ? "bg-signal-bright shadow-[0_0_14px_rgba(61,214,180,0.9)] animate-pulse"
                      : mission.kind === "boss"
                        ? "bg-amber/50"
                        : "bg-mist/40"
                }`}
              />
              <MissionNode mission={mission} status={status} index={index} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
